import React, { useState } from "react";
import { Check, Plus, Send } from "lucide-react";
import { AssistantMessage, Enquiry, TaskItem, WorkflowRule } from "../types";

interface AssistantViewProps {
  industryLabel: string;
  enquiries: Enquiry[];
  tasks: TaskItem[];
  workflows: WorkflowRule[];
  messages: AssistantMessage[];
  onAppendMessage: (msg: AssistantMessage) => void;
  onMarkTaskAdded: (msgId: string) => void;
  onMarkWorkflowAdded: (msgId: string) => void;
  onCreateTaskFromSuggestion: (task: {
    title: string;
    department: string;
    priority: string;
    dueDate: string;
  }) => void;
  onCreateWorkflowFromSuggestion: (wf: {
    name: string;
    trigger: string;
    condition: string;
    action: string;
    department: string;
    hoursSavedPerWeek: number;
  }) => void;
}

const PROMPT_SUGGESTIONS = [
  "Triage my open urgent enquiries and suggest next actions.",
  "Identify repetitive tasks we can automate with a new workflow.",
  "Summarize today's operational bottlenecks and SLA risks.",
  "Draft an onboarding checklist task for a new enterprise client.",
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  industryLabel,
  enquiries,
  tasks,
  workflows,
  messages,
  onAppendMessage,
  onMarkTaskAdded,
  onMarkWorkflowAdded,
  onCreateTaskFromSuggestion,
  onCreateWorkflowFromSuggestion,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    onAppendMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const openEnqSummary = enquiries
        .filter((e) => e.status !== "Resolved")
        .slice(0, 6)
        .map((e) => `${e.id} [${e.priority}] ${e.company}: ${e.subject} (SLA ${e.slaMinutesLeft}m)`)
        .join("; ");

      const taskSummary = tasks
        .slice(0, 8)
        .map((t) => `${t.id} [${t.status}/${t.priority}] ${t.title}`)
        .join("; ");

      const wfSummary = workflows
        .map((w) => `${w.name} (${w.active ? "Active" : "Paused"}, ${w.hoursSavedPerWeek}h/wk)`)
        .join("; ");

      const workspaceContext = `Industry focus: ${industryLabel}
Open enquiries (${enquiries.filter((e) => e.status !== "Resolved").length}): ${openEnqSummary || "None"}
Tasks (${tasks.length}): ${taskSummary || "None"}
Workflows (${workflows.length}): ${wfSummary || "None"}`;

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          workspaceContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assistant request failed.");
      }

      onAppendMessage({
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: data.reply || "No response returned.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedTask: data.suggestedTask || null,
        suggestedWorkflow: data.suggestedWorkflow || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach AI Assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Chat Canvas */}
      <div className="xl:col-span-2 rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] flex flex-col min-h-[560px] max-h-[calc(100vh-140px)]">
        <div className="px-5 py-4 border-b border-[#ECEAF3] dark:border-[#1F1F2E] flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white">
              NEXA Operations Copilot
            </h2>
            <p className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2]">
              Live Gemini assistant grounded in your current enquiries, tasks, and workflows
            </p>
          </div>
          <span className="text-[12px] font-medium text-[#5B21B6] dark:text-[#C4B5FD] whitespace-nowrap">
            Live AI
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-2 text-[11.5px] text-[#7A788C] mb-1">
                <span>{msg.role === "user" ? "You" : "NEXA Assistant"}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#0D0D12] text-white dark:bg-[#DDD6FE] dark:text-[#0B0B10]"
                    : "bg-[#F7F6FB] dark:bg-[#181823] text-[#0D0D12] dark:text-[#F0EFF7] border border-[#EAE8F2] dark:border-[#262636]"
                }`}
              >
                {msg.text}
              </div>

              {msg.suggestedTask && (
                <div className="mt-2.5 max-w-[85%] rounded-md bg-white dark:bg-[#14141E] border border-[#DDD6FE] dark:border-[#393059] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-[#5B21B6] dark:text-[#C4B5FD]">
                      Suggested Task · {msg.suggestedTask.department}
                    </div>
                    <div className="text-[13.5px] font-medium text-[#0D0D12] dark:text-white mt-0.5">
                      {msg.suggestedTask.title}
                    </div>
                    <div className="text-[12px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
                      Priority: {msg.suggestedTask.priority} · Due: {msg.suggestedTask.dueDate}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={msg.suggestedTask.added}
                    onClick={() => {
                      if (!msg.suggestedTask || msg.suggestedTask.added) return;
                      onCreateTaskFromSuggestion(msg.suggestedTask);
                      onMarkTaskAdded(msg.id);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                      msg.suggestedTask.added
                        ? "bg-[#ECEAF3] dark:bg-[#242434] text-[#646275] dark:text-[#9D9AB2]"
                        : "bg-[#0D0D12] dark:bg-[#DDD6FE] text-white dark:text-[#0B0B10] hover:bg-[#23232F]"
                    }`}
                  >
                    {msg.suggestedTask.added ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Added to Tasks</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {msg.suggestedWorkflow && (
                <div className="mt-2.5 max-w-[85%] rounded-md bg-white dark:bg-[#14141E] border border-[#DDD6FE] dark:border-[#393059] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-[#5B21B6] dark:text-[#C4B5FD]">
                      Suggested Workflow · {msg.suggestedWorkflow.department}
                    </div>
                    <div className="text-[13.5px] font-medium text-[#0D0D12] dark:text-white mt-0.5">
                      {msg.suggestedWorkflow.name}
                    </div>
                    <div className="text-[12px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
                      When {msg.suggestedWorkflow.trigger} → {msg.suggestedWorkflow.action}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={msg.suggestedWorkflow.added}
                    onClick={() => {
                      if (!msg.suggestedWorkflow || msg.suggestedWorkflow.added) return;
                      onCreateWorkflowFromSuggestion(msg.suggestedWorkflow);
                      onMarkWorkflowAdded(msg.id);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                      msg.suggestedWorkflow.added
                        ? "bg-[#ECEAF3] dark:bg-[#242434] text-[#646275] dark:text-[#9D9AB2]"
                        : "bg-[#0D0D12] dark:bg-[#DDD6FE] text-white dark:text-[#0B0B10] hover:bg-[#23232F]"
                    }`}
                  >
                    {msg.suggestedWorkflow.added ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Added to Workflows</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Workflow</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-[13px] text-[#646275] dark:text-[#9D9AB2]">
              Analyzing workspace context...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-[#FEF2F2] dark:bg-[#2B1418] border border-[#FECACA] dark:border-[#7F1D1D] px-4 py-3 text-[13px] text-[#991B1B] dark:text-[#FCA5A5]">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendPrompt(input);
          }}
          className="p-4 border-t border-[#ECEAF3] dark:border-[#1F1F2E] flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask to triage enquiries, draft an SLA plan, or propose an automation..."
            className="flex-1 rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAFAFC] dark:bg-[#161621] px-3.5 py-2.5 text-[13.5px] text-[#0D0D12] dark:text-white placeholder:text-[#8E8CA3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-4 py-2.5 text-[13px] font-medium text-white dark:text-[#0B0B10] disabled:opacity-40 hover:bg-[#23232F] dark:hover:bg-[#E9E3FF] transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Right Context & Quick Prompts Panel */}
      <div className="space-y-4">
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <h3 className="font-display text-[14px] font-semibold text-[#0D0D12] dark:text-white">
            Suggested Prompts
          </h3>
          <p className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2] mt-1">
            Run one-click operational analysis on your current workspace state.
          </p>
          <div className="mt-4 space-y-2">
            {PROMPT_SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => sendPrompt(prompt)}
                className="w-full text-left rounded-md border border-[#ECEAF3] dark:border-[#242434] bg-[#FAF9FD] dark:bg-[#161621] px-3.5 py-2.5 text-[13px] text-[#181822] dark:text-[#E7E5F2] hover:border-[#C4B5FD] dark:hover:border-[#6D28D9] transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-3">
          <h3 className="font-display text-[14px] font-semibold text-[#0D0D12] dark:text-white">
            Context Grounding
          </h3>
          <div className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2] space-y-1.5">
            <div className="flex justify-between">
              <span>Active Industry</span>
              <span className="font-medium text-[#0D0D12] dark:text-white">
                {industryLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Open Enquiries</span>
              <span className="font-mono-tabular font-medium text-[#0D0D12] dark:text-white">
                {enquiries.filter((e) => e.status !== "Resolved").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Tasks</span>
              <span className="font-mono-tabular font-medium text-[#0D0D12] dark:text-white">
                {tasks.filter((t) => t.status !== "Done").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Workflow Rules</span>
              <span className="font-mono-tabular font-medium text-[#0D0D12] dark:text-white">
                {workflows.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
