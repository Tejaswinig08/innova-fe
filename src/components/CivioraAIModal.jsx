import { useState, useEffect, useRef } from "react";
import { civioraAIAPI } from "../services/api";
import { IconMic, IconClose } from "./icons";

const IconSend = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);

export default function CivioraAIModal({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm Civiora AI, your society assistant powered by Groq.\n\nI can:\n- Answer questions about society rules and features\n- Raise complaints for you\n- Update complaint status\n- Book facilities\n\nTry saying: Raise a high priority complaint about water leakage in my bathroom"
    }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // ── Text-to-Speech ──
  function speakReply(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Strip markdown for cleaner speech
    const clean = text.replace(/\*\*/g, "").replace(/\*/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-IN";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // ── Voice Input ──
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input requires Google Chrome or Microsoft Edge.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    setListening(true);

    rec.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setListening(false);
      setInput(spoken);
      sendMessage(spoken);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  // ── Send Message ──
  async function sendMessage(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await civioraAIAPI.chat(newHistory);
      const reply = res?.reply || "Sorry, I didn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speakReply(reply);
    } catch {
      const errMsg = "I'm having trouble connecting right now. Please check that the backend server is running.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  }

  // ── Render markdown-like text ──
  function renderContent(text) {
    return text.split("\n").map((line, i) => {
      // Bold text **...**
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      );
      return <p key={i} className={line === "" ? "mt-1" : ""}>{parts}</p>;
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: "min(620px, 92vh)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-forest text-cream shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-gold">AI</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Civiora AI</p>
              <p className="text-[11px] text-cream/60 leading-tight">Powered by Groq · Llama 3.3</p>
            </div>
          </div>
          <button
            onClick={() => { window.speechSynthesis?.cancel(); onClose(); }}
            className="p-2 rounded-full hover:bg-cream/10 transition-colors"
            aria-label="Close"
          >
            <IconClose className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ── Chat Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-forest/15 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <span className="text-[10px] font-bold text-forest">AI</span>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-0.5 ${
                m.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-brown/8 text-brown rounded-tl-sm ring-1 ring-brown/10"
              }`}>
                {m.role === "assistant" ? renderContent(m.content) : m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-forest/15 flex items-center justify-center shrink-0 mr-2">
                <span className="text-[10px] font-bold text-forest">AI</span>
              </div>
              <div className="bg-brown/8 ring-1 ring-brown/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-brown/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-brown/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-brown/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="px-4 py-3 border-t border-brown/10 bg-surface shrink-0">
          <div className="flex gap-2 items-center">
            <button
              onClick={startListening}
              disabled={loading}
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                listening
                  ? "bg-red-500 text-white scale-110 shadow-lg animate-pulse"
                  : "bg-brown/8 text-brown hover:bg-brown/15"
              }`}
              title={listening ? "Listening..." : "Click to speak"}
            >
              <IconMic className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={listening ? "Listening..." : "Ask anything or give a command..."}
              disabled={loading || listening}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-brown/6 ring-1 ring-brown/15 focus:ring-accent/50 outline-none transition-all placeholder:text-brown/40 text-brown"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-all shadow"
              title="Send"
            >
              <IconSend className="w-4.5 h-4.5" />
            </button>
          </div>

          <p className="text-[10px] text-brown/35 text-center mt-2">
            Civiora AI can make mistakes. Verify important actions in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
