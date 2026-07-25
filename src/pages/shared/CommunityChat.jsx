import { useState, useEffect, useRef } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { toast } from "../../components/Toast";
import { chatAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function getWing(flat) {
  if (!flat) return "General";
  const match = flat.trim().match(/^([a-zA-Z]+)(?:-|\s)?\d+/);
  if (match) return match[1].toUpperCase();
  const first = flat.trim().charAt(0);
  if (/^[a-zA-Z]$/.test(first)) return first.toUpperCase();
  return "General";
}

export default function CommunityChat() {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Users & Channels State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState("society"); // "society", "wing", "private"
  const [selectedUser, setSelectedUser] = useState(null);

  // Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const wing = getWing(user?.flat);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true); // silent fetch in background
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const data = await chatAPI.getUsers();
      setUsers(data || []);
    } catch {
      toast.error("Failed to load community users");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchMessages(silent = false) {
    if (!silent) setLoadingMessages(true);
    try {
      let data = [];
      if (activeTab === "society") {
        data = await chatAPI.getSocietyMessages();
      } else if (activeTab === "wing") {
        data = await chatAPI.getWingMessages();
      } else if (activeTab === "private" && selectedUser) {
        data = await chatAPI.getPrivateMessages(selectedUser._id);
      }
      setMessages(data || []);
    } catch {
      if (!silent) toast.error("Failed to fetch messages");
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const payload = {
        channelType: activeTab,
        text: newMessage.trim(),
      };
      if (activeTab === "private" && selectedUser) {
        payload.recipientId = selectedUser._id;
      }
      const created = await chatAPI.sendMessage(payload);
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function selectPrivateChat(recipient) {
    setSelectedUser(recipient);
    setActiveTab("private");
  }

  const getRoleTone = (r) => {
    switch (r) {
      case "admin":
        return "warn";
      case "security":
        return "info";
      default:
        return "neutral";
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Community Chat"
        subtitle={`Connected to ${user?.society || "Civiora"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-210px)] min-h-[500px]">
        {/* Left Panel: Channels & Users */}
        <Card className="p-4 md:col-span-1 flex flex-col h-full overflow-hidden border border-brown/5 shadow-md">
          <p className="text-[11px] font-bold text-brown/40 uppercase tracking-wider mb-3">Channels</p>
          
          <div className="space-y-1 mb-6">
            <button
              onClick={() => { setActiveTab("society"); setSelectedUser(null); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "society"
                  ? "bg-gold text-forest-dark"
                  : "text-brown/70 hover:bg-brown/5"
              }`}
            >
              Society Group
            </button>
            
            <button
              onClick={() => { setActiveTab("wing"); setSelectedUser(null); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === "wing"
                  ? "bg-gold text-forest-dark"
                  : "text-brown/70 hover:bg-brown/5"
              }`}
            >
              Wing {wing} Group
            </button>
          </div>

          <p className="text-[11px] font-bold text-brown/40 uppercase tracking-wider mb-3">Direct Messages</p>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {loadingUsers ? (
              <p className="text-xs text-brown/40 text-center py-4">Loading contacts...</p>
            ) : users.length === 0 ? (
              <p className="text-xs text-brown/40 text-center py-4">No residents found</p>
            ) : (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => selectPrivateChat(u)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex flex-col transition-colors ${
                    activeTab === "private" && selectedUser?._id === u._id
                      ? "bg-gold text-forest-dark"
                      : "text-brown/80 hover:bg-brown/5"
                  }`}
                >
                  <span className="text-sm font-semibold truncate">{u.name}</span>
                  <span className={`text-[10px] ${activeTab === "private" && selectedUser?._id === u._id ? "text-forest-dark/70" : "text-brown/45"} mt-0.5`}>
                    {u.role === "resident" ? `Flat ${u.flat || "—"}` : u.role}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Right Panel: Chat Feed */}
        <Card className="md:col-span-3 flex flex-col h-full overflow-hidden border border-brown/5 shadow-md">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-brown/10 bg-surface flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-brown">
                {activeTab === "society" && "Society Group Chat"}
                {activeTab === "wing" && `Wing ${wing} Group Chat`}
                {activeTab === "private" && selectedUser && `Direct Message: ${selectedUser.name}`}
              </h3>
              <p className="text-[11px] text-brown/45 mt-0.5">
                {activeTab === "society" && "Broadcast channel for all society members"}
                {activeTab === "wing" && `Exclusive room for wing ${wing} residents`}
                {activeTab === "private" && selectedUser && (selectedUser.role === "resident" ? `Resident of Flat ${selectedUser.flat}` : selectedUser.role)}
              </p>
            </div>
            {activeTab === "private" && selectedUser && (
              <Badge tone={getRoleTone(selectedUser.role)}>{selectedUser.role}</Badge>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#FAF7F2] dark:bg-surface/30 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-brown/40">Loading conversations...</p>
              </div>
            ) : activeTab === "private" && !selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-sm text-brown/50 font-medium">Select a contact from the sidebar to begin messaging</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-8">
                <p className="text-xs text-brown/40">No messages in this chat yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] text-brown/50 font-bold mb-1 ml-1 flex gap-1.5 items-center">
                        {msg.senderName}
                        <span className="text-[9px] opacity-75">({msg.senderRole})</span>
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-gold text-forest-dark rounded-tr-none font-medium shadow-sm"
                          : "bg-surface text-brown rounded-tl-none border border-brown/5 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-brown/35 mt-1 mx-1.5">
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Messages Input Box */}
          {(!selectedUser && activeTab === "private") ? null : (
            <form onSubmit={handleSendMessage} className="p-3.5 border-t border-brown/10 bg-surface flex gap-3">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="admin-input flex-1 py-2 px-3.5"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={sending || !newMessage.trim()}
                className="px-5"
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
