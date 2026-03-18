import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Sidebar({ activeId, onSelect, onNew, onDelete, collapsed, onToggle }) {
  const [convos, setConvos] = useState([]);

  const fetchConvos = async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      setConvos(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchConvos();
    const t = setInterval(fetchConvos, 3000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await fetch(`${API}/conversations/${id}`, { method: "DELETE" });
    onDelete(id);
    fetchConvos();
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="icon-btn" onClick={onToggle} title="Toggle sidebar">
          <MenuIcon />
        </button>
        {!collapsed && (
          <button className="new-chat-btn" onClick={onNew}>
            <PlusIcon /> New chat
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="sidebar-list">
          <div className="sidebar-section-label">Recent</div>
          {convos.length === 0 && (
            <div className="sidebar-empty">No conversations yet</div>
          )}
          {convos.map((c) => (
            <div
              key={c.id}
              className={`sidebar-item ${c.id === activeId ? "active" : ""}`}
              onClick={() => onSelect(c.id)}
            >
              <ChatIcon />
              <span className="sidebar-title">{c.title}</span>
              <button
                className="del-btn"
                onClick={(e) => handleDelete(e, c.id)}
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">U</div>
            <span>User</span>
          </div>
        </div>
      )}
    </aside>
  );
}

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
  </svg>
);
