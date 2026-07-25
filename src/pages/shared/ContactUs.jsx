import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { contactAPI } from "../../services/api";

export default function ContactUs() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [societyName, setSocietyName] = useState(user?.society || "");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !description.trim()) {
      toast.error("Please fill required fields (Name, Email, and Description)");
      return;
    }

    setSubmitting(true);
    try {
      await contactAPI.sendFeedback({
        name: name.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        societyName: societyName.trim(),
        description: description.trim(),
      });
      toast("Thank you! Your feedback has been sent directly to the developer mailbox.");
      setDescription("");
    } catch (error) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Support & Feedback"
        title="Contact Us / Developer Mailbox"
        subtitle="Share your experience, report issues, or suggest improvements directly to the developer"
      />

      <div className="max-w-2xl mx-auto">
        <Card className="p-6 md:p-8">
          <h2 className="font-display text-xl text-brown mb-2 font-bold">
            Share Your Experience With Developer
          </h2>
          <p className="text-xs text-brown/60 mb-6 leading-relaxed">
            Fill out the form below. When you click Send, your message will be immediately dispatched to the developer mailbox formatted with your details and description.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/80 uppercase tracking-wide mb-1.5">
                  Name <span className="text-[#A6452F]">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown/80 uppercase tracking-wide mb-1.5">
                  Email <span className="text-[#A6452F]">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brown/80 uppercase tracking-wide mb-1.5">
                  Contact Number <span className="text-brown/45 font-normal lowercase">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brown/80 uppercase tracking-wide mb-1.5">
                  Society Name
                </label>
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  placeholder="Your society name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brown/80 uppercase tracking-wide mb-1.5">
                Description of Your Problem or Feedback <span className="text-[#A6452F]">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue, feedback, or experience in detail..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30 resize-y"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm font-bold"
                disabled={submitting}
              >
                {submitting ? "Sending to Developer Mailbox..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
