import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List

import anthropic
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="ChatGPT Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# In-memory store: { conversation_id: [{ role, content, timestamp }] }
conversations: Dict[str, List[dict]] = {}


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, cid: str):
        await ws.accept()
        self.active[cid] = ws

    def disconnect(self, cid: str):
        self.active.pop(cid, None)

    async def send(self, cid: str, data: dict):
        ws = self.active.get(cid)
        if ws:
            await ws.send_text(json.dumps(data))


manager = ConnectionManager()


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/conversations")
async def list_conversations():
    result = []
    for cid, msgs in conversations.items():
        if msgs:
            first_user = next((m for m in msgs if m["role"] == "user"), None)
            title = (first_user["content"][:50] + "…") if first_user and len(first_user["content"]) > 50 else (first_user["content"] if first_user else "New Chat")
        else:
            title = "New Chat"
        result.append({"id": cid, "title": title, "message_count": len(msgs)})
    return result


@app.get("/conversations/{cid}")
async def get_conversation(cid: str):
    return {"id": cid, "messages": conversations.get(cid, [])}


@app.delete("/conversations/{cid}")
async def delete_conversation(cid: str):
    conversations.pop(cid, None)
    return {"deleted": cid}


@app.websocket("/ws/{cid}")
async def websocket_endpoint(websocket: WebSocket, cid: str):
    await manager.connect(websocket, cid)

    if cid not in conversations:
        conversations[cid] = []

    # Send existing history on connect
    await manager.send(cid, {
        "type": "history",
        "messages": conversations[cid]
    })

    try:
        while True:
            raw = await websocket.receive_text()
            payload = json.loads(raw)

            if payload.get("type") == "message":
                user_text = payload["content"].strip()
                model = payload.get("model", "claude-sonnet-4-20250514")
                system = payload.get("system", "You are a helpful, harmless, and honest AI assistant.")

                if not user_text:
                    continue

                user_msg = {
                    "role": "user",
                    "content": user_text,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                conversations[cid].append(user_msg)

                await manager.send(cid, {"type": "user_message", "message": user_msg})
                await manager.send(cid, {"type": "stream_start"})

                # Stream response from Claude
                full_reply = ""
                try:
                    with client.messages.stream(
                        model=model,
                        max_tokens=1024,
                        system=system,
                        messages=[
                            {"role": m["role"], "content": m["content"]}
                            for m in conversations[cid]
                            if m["role"] in ("user", "assistant")
                        ],
                    ) as stream:
                        for text_chunk in stream.text_stream:
                            full_reply += text_chunk
                            await manager.send(cid, {
                                "type": "stream_chunk",
                                "chunk": text_chunk
                            })
                            await asyncio.sleep(0)  # yield control

                except Exception as e:
                    await manager.send(cid, {
                        "type": "error",
                        "message": f"Claude API error: {str(e)}"
                    })
                    continue

                assistant_msg = {
                    "role": "assistant",
                    "content": full_reply,
                    "timestamp": datetime.utcnow().isoformat(),
                }
                conversations[cid].append(assistant_msg)

                await manager.send(cid, {
                    "type": "stream_end",
                    "message": assistant_msg
                })

            elif payload.get("type") == "clear":
                conversations[cid] = []
                await manager.send(cid, {"type": "cleared"})

    except WebSocketDisconnect:
        manager.disconnect(cid)
