import React, { useMemo, useState } from "react";
import { Plus, Search, Send, Sparkles, X } from "lucide-react";
import { Enquiry, IndustryId, TeamMember } from "../types";

interface EnquiriesViewProps {
  enquiries: Enquiry[];
  selectedEnquiryId: string | null;
  onSelectEnquiry: (id: string) => void;
  teamMembers: TeamMember[];
  industryLabel: string;
  activeIndustry: IndustryId;
  onUpdateEnquiryStatus: (id: string, status: Enquiry["status"]) => void;
  onSendReply: (id: string, body: string) => void;
  onConvertToTask: (enquiry: Enquiry) => void;
  onAddEnquiry: (enquiry: Omit<Enquiry, "id" | "receivedAt" | "slaMinutesLeft">) => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  enquiries,
  selectedEnquiryId,
  onSelectEnquiry,
  teamMembers,
  industryLabel,
  activeIndustry,
  onUpdateEnquiryStatus,
  onSendReply,
  onConvertToTask,
  onAddEnquiry,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Enquiry["status"]>("All");
  const [channelFilter, setChannelFilter] = useState<"All" | Enquiry["channel"]>("All");
  const [replyText, setReplyText] = useState("");
  const [tone, setTone] = useState("Concise and professional");
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newChannel, setNewChannel] = useState<Enquiry["channel"]>("Email");
  const [newPriority, setNewPriority] = useState<Enquiry["priority"]>("High");

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (channelFilter !== "All" && e.channel !== channelFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.customerName.toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enquiries, statusFilter, channelFilter, search]);

  const activeEnquiry =
    filtered.find((e) => e.id === selectedEnquiryId) || filtered[0] || null;

  const handleDraftWithAI = async () => {
    if (!activeEnquiry || draftLoading) return;
    setDraftLoading(true);
    setDraftError(null);
    try {
      const res = await fetch("/api/enquiries/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiry: activeEnquiry,
          tone,
          industry: industryLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to draft reply.");
      }
      setReplyText(data.draft || "");
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Failed to draft reply.");
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnquiry || !replyText.trim()) return;
    onSendReply(activeEnquiry.id, replyText.trim());
    setReplyText("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.trim() || !newSubject.trim() || !newBody.trim()) return;
    onAddEnquiry({
      customerName: newCustomer.trim(),
      company: newCompany.trim() || "Direct Client",
      email: newEmail.trim() || "contact@client.example",
      channel: newChannel,
      subject: newSubject.trim(),
      priority: newPriority,
      status: "Open",
      assignedToId: teamMembers[0]?.id || "tm-elena",
      industry: activeIndustry,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: newCustomer.trim(),
          role: "customer",
          body: newBody.trim(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    });
    setNewCustomer("");
    setNewCompany("");
    setNewEmail("");
    setNewSubject("");
    setNewBody("");
    setShowNewModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md bg-[#F2F0F8] dark:bg-[#171722] p-1">
            {(["All", "Open", "In Progress", "Resolved"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                    : "text-[#646275] dark:text-[#9D9AB2] hover:text-[#0D0D12] dark:hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by channel"
            value={channelFilter}
            onChange={(e) =>
              setChannelFilter(e.target.value as "All" | Enquiry["channel"])
            }
            className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#111118] px-3 py-1.5 text-[12.5px] text-[#0D0D12] dark:text-white"
          >
            <option value="All">All Channels (Demo feeds)</option>
            <option value="Email">Email</option>
            <option value="Web Form">Web Form</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Client Portal">Client Portal</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-[#858399] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or ID..."
              className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#111118] pl-8 pr-3 py-1.5 text-[13px] text-[#0D0D12] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#EDE9FE] dark:bg-[#251F3D] border border-[#DDD6FE] dark:border-[#3E3369] px-3 py-1.5 text-[12.5px] font-medium text-[#3B1E8A] dark:text-[#E5DCFF] hover:bg-[#E1DAFC] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Split-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left List */}
        <div className="lg:col-span-5 rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A] overflow-hidden">
          {filtered.map((enq) => {
            const selected = activeEnquiry?.id === enq.id;
            return (
              <button
                key={enq.id}
                type="button"
                onClick={() => onSelectEnquiry(enq.id)}
                className={`w-full text-left px-4 py-3.5 transition-colors ${
                  selected
                    ? "bg-[#F5F2FF] dark:bg-[#1C182D]"
                    : "hover:bg-[#FAF9FD] dark:hover:bg-[#15151F]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                    {enq.id} · {enq.channel}
                  </span>
                  <span
                    className={`font-medium ${
                      enq.priority === "Urgent"
                        ? "text-[#DC2626] dark:text-[#F87171]"
                        : enq.priority === "High"
                          ? "text-[#D97706] dark:text-[#FBBF24]"
                          : "text-[#646275] dark:text-[#9D9AB2]"
                    }`}
                  >
                    {enq.priority}
                  </span>
                </div>
                <div className="mt-1 text-[13.5px] font-semibold text-[#0D0D12] dark:text-white line-clamp-1">
                  {enq.subject}
                </div>
                <div className="mt-1 flex items-center justify-between text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                  <span className="truncate">
                    {enq.customerName} · {enq.company}
                  </span>
                  <span className="shrink-0 pl-2">{enq.status}</span>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-[13px] text-[#646275] dark:text-[#9D9AB2]">
              No customer enquiries match your current filters.
            </div>
          )}
        </div>

        {/* Right Detail & AI Drafting */}
        <div className="lg:col-span-7 rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] flex flex-col min-h-[500px]">
          {activeEnquiry ? (
            <>
              <div className="p-5 border-b border-[#ECEAF3] dark:border-[#1F1F2E] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                      <span className="font-mono-tabular">{activeEnquiry.id}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{activeEnquiry.channel} (Demo feed)</span>
                      <span aria-hidden="true"> · </span>
                      <span>Received {activeEnquiry.receivedAt}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-[#0D0D12] dark:text-white mt-1">
                      {activeEnquiry.subject}
                    </h3>
                    <div className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
                      {activeEnquiry.customerName} · {activeEnquiry.company} ·{" "}
                      {activeEnquiry.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      aria-label="Update enquiry status"
                      value={activeEnquiry.status}
                      onChange={(e) =>
                        onUpdateEnquiryStatus(
                          activeEnquiry.id,
                          e.target.value as Enquiry["status"]
                        )
                      }
                      className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#161621] px-2.5 py-1.5 text-[12.5px] font-medium text-[#0D0D12] dark:text-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => onConvertToTask(activeEnquiry)}
                      className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] px-3 py-1.5 text-[12.5px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27] whitespace-nowrap"
                    >
                      Convert to Task
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[320px]">
                {activeEnquiry.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-md p-3.5 text-[13.5px] leading-relaxed ${
                      msg.role === "customer"
                        ? "bg-[#F7F6FB] dark:bg-[#171722] border border-[#EAE8F2] dark:border-[#252536] text-[#0D0D12] dark:text-[#F0EFF7]"
                        : "bg-[#0D0D12] dark:bg-[#231E3A] text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11.5px] opacity-75 mb-1.5">
                      <span className="font-medium">{msg.sender}</span>
                      <span className="font-mono-tabular">{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSend}
                className="p-4 border-t border-[#ECEAF3] dark:border-[#1F1F2E] space-y-3 bg-[#FCFBFE] dark:bg-[#0E0E15]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Reply tone"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#161621] px-2.5 py-1.5 text-[12px] text-[#0D0D12] dark:text-white"
                    >
                      <option value="Concise and professional">Tone: Concise</option>
                      <option value="Warm and empathetic">Tone: Empathetic</option>
                      <option value="Formal executive SLA">Tone: Formal SLA</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleDraftWithAI}
                      disabled={draftLoading}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#EDE9FE] dark:bg-[#272042] border border-[#DDD6FE] dark:border-[#423670] px-3 py-1.5 text-[12px] font-medium text-[#3B1E8A] dark:text-[#E5DCFF] hover:bg-[#E1DAFC] transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{draftLoading ? "Drafting..." : "Draft Reply with AI"}</span>
                    </button>
                  </div>
                  <span className="text-[11.5px] text-[#7A788C]">
                    Outbound email/WhatsApp delivery is simulated in demo mode
                  </span>
                </div>

                {draftError && (
                  <div className="text-[12.5px] text-[#DC2626] dark:text-[#F87171]">
                    {draftError}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply or generate a tailored draft with Gemini AI..."
                  className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#161621] p-3 text-[13.5px] text-[#0D0D12] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-4 py-2 text-[13px] font-medium text-white dark:text-[#0B0B10] disabled:opacity-40 hover:bg-[#23232F] transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Log Simulated Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-[13.5px] text-[#646275] dark:text-[#9D9AB2]">
              Select an enquiry from the list to inspect or draft a reply.
            </div>
          )}
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-[#14141D] border border-[#E6E4EE] dark:border-[#262638] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#0D0D12] dark:text-white">
                Add Sample Customer Enquiry
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-[#646275] hover:text-[#0D0D12] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Customer full name"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Company name"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                />
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as Enquiry["channel"])}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                >
                  <option value="Email">Email</option>
                  <option value="Web Form">Web Form</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Client Portal">Client Portal</option>
                </select>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.val
