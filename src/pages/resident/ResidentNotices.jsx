import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { noticesAPI } from "../../services/api";
import { IconSparkle, IconNotice } from "../../components/icons";

export default function ResidentNotices() {
  const [notices, setNotices] = useState([]);
  const [summarized, setSummarized] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noticesAPI.getAll()
      .then((data) => setNotices(data))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  function summarize(id, body) {
    const short = body.split(". ").slice(0, 1).join(". ") + ".";
    setSummarized((s) => ({ ...s, [id]: short }));
  }

  if (loading) return <><PageHeader eyebrow="Resident" title="Notice Board" subtitle="Loading..." /><div className="flex items-center justify-center py-20"><p className="text-sm text-brown/50">Loading...</p></div></>;

  return (
    <>
      <PageHeader eyebrow="Resident" title="Notice Board" subtitle="Announcements from your management committee" />
      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n._id} className="p-6">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <IconNotice className="w-4.5 h-4.5 text-accent" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-brown">{n.title}</p>
                  {n.pinned && <span className="text-xs text-gold-dark font-medium shrink-0">Pinned</span>}
                </div>
                <p className="text-xs text-brown/40 mt-1 mb-3">{new Date(n.createdAt).toLocaleDateString()}</p>
                {summarized[n._id] && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-gold/8 ring-1 ring-gold/20 mb-2">
                    <p className="text-xs text-brown/70 flex items-start gap-1.5">
                      <IconSparkle className="w-3.5 h-3.5 text-gold-dark shrink-0 mt-0.5" />
                      <span>{summarized[n._id]}</span>
                    </p>
                  </div>
                )}
                <p className="text-sm text-brown/65 leading-relaxed">{n.body}</p>
                {!summarized[n._id] && (
                  <button onClick={() => summarize(n._id, n.body)} className="text-xs text-accent font-medium hover:underline mt-3 inline-flex items-center gap-1.5">
                    <IconSparkle className="w-3.5 h-3.5" /> Summarize with AI
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {notices.length === 0 && <Card className="p-12 text-center"><p className="text-sm text-brown/50">No notices posted yet.</p></Card>}
      </div>
    </>
  );
}
