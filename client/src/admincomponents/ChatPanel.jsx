import { useEffect, useRef, useState } from "react";
import { api, useFetch } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Search } from "./UI.jsx";

const time = (d) => new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function ChatPanel() {
  const { user } = useAuth();
  const { data: contacts, reload: reloadContacts } = useFetch("/messages/contacts");
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState([]);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  const id = activeId || contacts[0]?._id;
  const active = contacts.find((c) => c._id === id);
  const shown = contacts.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  // Load the open conversation and check for new messages every 5 seconds.
  useEffect(() => {
    if (!id) return;
    const load = () => api(`/messages/${id}`).then(setThread).catch(() => {});
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [thread.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !id) return;
    setDraft("");
    try {
      const m = await api("/messages", { method: "POST", body: { to: id, text } });
      setThread((t) => [...t, m]);
      reloadContacts();
    } catch (e) {
      setDraft(text);
      alert(e.message);
    }
  };

  return (
    <div className="chat-layout">
      <section className="panel">
        <Search placeholder="Search conversations…" value={q} onChange={setQ} />
        {shown.map((c) => (
          <button key={c._id} className={"convo" + (c._id === id ? " active" : "")} onClick={() => setActiveId(c._id)}>
            <b>{c.name}</b><small>{c.last ? time(c.last.createdAt) : ""}</small>
            <span>{c.last ? c.last.text : "No messages yet"}</span>
          </button>
        ))}
        {!shown.length && <p className="empty">No one to message yet.</p>}
      </section>
      <section className="panel chat-panel">
        {active ? (
          <>
            <h3>{active.name} <small>{active.role}</small></h3>
            <div className="chat">
              {thread.map((m) => {
                const mine = m.from === user._id;
                return (
                  <div key={m._id} className={"bubble " + (mine ? "me" : "them")}>
                    <b>{mine ? "You" : active.name}</b>
                    <span>{m.text}</span>
                    <small>{time(m.createdAt)}</small>
                  </div>
                );
              })}
              {!thread.length && <p className="empty">Say hello to start the conversation.</p>}
              <div ref={endRef} />
            </div>
            <div className="composer">
              <input className="input" placeholder="Type a message…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </>
        ) : (
          <p className="empty">Select a conversation to start chatting.</p>
        )}
      </section>
    </div>
  );
}
