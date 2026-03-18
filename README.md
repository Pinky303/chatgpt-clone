# ChatGPT Clone

A full-stack ChatGPT-style chat application built with **Python (FastAPI)**, **React**, **WebSockets**, and **Docker**.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.12, FastAPI, Uvicorn       |
| AI        | Anthropic Claude API (streaming)    |
| Realtime  | WebSockets (native FastAPI support) |
| Frontend  | React 18, Vite                      |
| Proxy     | Nginx (production)                  |
| Container | Docker, Docker Compose              |

---

## Project Structure

```
chatgpt-clone/
├── backend/
│   ├── main.py               # FastAPI app + WebSocket handler
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component
│   │   ├── App.css           # All styles
│   │   ├── main.jsx          # Entry point
│   │   ├── components/
│   │   │   ├── Sidebar.jsx   # Conversation list
│   │   │   ├── Message.jsx   # Message bubble + markdown
│   │   │   └── ChatInput.jsx # Textarea + model select
│   │   ├── hooks/
│   │   │   └── useChat.js    # WebSocket hook
│   │   └── utils/
│   │       └── markdown.jsx  # Markdown renderer
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf            # Nginx config (production)
│   ├── Dockerfile            # Multi-stage production build
│   └── Dockerfile.dev        # Dev server
├── docker-compose.yml        # Production
├── docker-compose.dev.yml    # Development (hot reload)
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- An [Anthropic API key](https://console.anthropic.com/)

### 2. Clone and configure

```bash
git clone <your-repo-url>
cd chatgpt-clone

# Set your API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run with Docker

```bash
# Production (React built, served via Nginx on port 80)
docker compose up --build

# Development (hot reload on port 5173 + 8000)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Open **http://localhost** (production) or **http://localhost:5173** (dev).

---

## Running Without Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env            # uses localhost:8000 by default
npm install
npm run dev                     # http://localhost:5173
```

---

## WebSocket Protocol

The frontend connects to `ws://backend/ws/{conversation_id}`.

### Client → Server messages

```json
// Send a message
{ "type": "message", "content": "Hello!", "model": "claude-sonnet-4-20250514", "system": "You are helpful." }

// Clear conversation
{ "type": "clear" }
```

### Server → Client messages

```json
// Full history on connect
{ "type": "history", "messages": [...] }

// Echo of user's message
{ "type": "user_message", "message": { "role": "user", "content": "...", "timestamp": "..." } }

// Streaming started
{ "type": "stream_start" }

// Token-by-token chunk
{ "type": "stream_chunk", "chunk": "Hello" }

// Stream done + full message saved
{ "type": "stream_end", "message": { "role": "assistant", "content": "...", "timestamp": "..." } }

// Error from Claude API
{ "type": "error", "message": "..." }

// Chat cleared
{ "type": "cleared" }
```

---

## REST API

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/health`                 | Health check             |
| GET    | `/conversations`          | List all conversations   |
| GET    | `/conversations/{id}`     | Get conversation history |
| DELETE | `/conversations/{id}`     | Delete a conversation    |

Interactive docs at **http://localhost:8000/docs**

---

## Features

- **Real-time streaming** — token-by-token response via WebSocket
- **Multi-conversation** sidebar with auto-generated titles
- **Markdown rendering** — code blocks, headings, lists, inline code
- **3 Claude models** selectable per message
- **Auto-reconnect** — WebSocket reconnects on disconnect
- **Connection status** indicator
- **Clear chat** per conversation
- **Dark theme** matching ChatGPT aesthetic

---

## Environment Variables

| Variable           | Where   | Description             |
|--------------------|---------|-------------------------|
| `ANTHROPIC_API_KEY`| Backend | Your Anthropic API key  |
| `VITE_API_URL`     | Frontend| Backend HTTP URL        |
| `VITE_WS_URL`      | Frontend| Backend WebSocket URL   |

---

## Deployment Notes

- In production, Nginx proxies `/ws/` with `Upgrade: websocket` headers
- The React app is compiled to static files and served by Nginx
- Backend state is **in-memory** — conversations reset on restart
- To persist conversations, swap the dict store in `main.py` for SQLite/PostgreSQL

---

Project Explainer
https://chatgpt-clone-doc.netlify.app/
