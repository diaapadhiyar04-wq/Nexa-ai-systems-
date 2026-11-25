import React, { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { THROUGHPUT_SERIES } from "../data/demoData";
import { Enquiry, TaskItem, ViewId, WorkflowRule } from "../types";

interface OverviewViewProps {
  enquiries: Enquiry[];
  tasks: TaskItem[];
  workflows: WorkflowRule[];
  onNavigate: (view: ViewId) => void;
  onSelectEnquiry: (id: string) => void;
  onRunWorkflowTest: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  enquiries,
  tasks,
  workflows,
  onNavigate,
  onSelectEnquiry,
  onRunWorkflowTest,
}) => {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("7D");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const openEnquiries = enquiries.filter((e) => e.status !== "Resolved");
  const resolvedEnquiries = enquiries.filter((e) => e.status === "Resolved").length;
  const activeWorkflows = workflows.filter((w) => w.active);
  const weeklyHoursSaved = activeWorkflows.reduce(
    (sum, w) => sum + w.hoursSavedPerWeek,
    0
  );
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const estimatedMonthlySavings = Math.round(weeklyHoursSaved * 4.2 * 65);

  const series = THROUGHPUT_SERIES[timeframe];
  const maxHours = Math.max(...series.map((d) => d.hoursSaved), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E4EE] dark:border-[#1E1E2B] pb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#0D0D12] dark:text-white tracking-tight">
            Operations Control Center
          </h2>
          <p className="text-[13px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
            Sample demonstration dataset · Live Gemini AI powers Assistant, Drafting & Media Studio · External webhooks are simulated
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("assistant")}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-md bg-[#EDE9FE] dark:bg-[#231E3A] border border-[#DDD6FE] dark:border-[#3D3366] px-3.5 py-2 text-[13px] font-medium text-[#3B1E8A] dark:text-[#E5DCFF] hover:bg-[#E2DCFD] dark:hover:bg-[#2C254A] transition-colors whitespace-nowrap shrink-0"
        >
          <span>Ask AI Operations Assistant</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] font-medium text-[#646275] dark:text-[#9D9AB2]">
            Automated Hours / Week
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white">
              {weeklyHoursSaved.toFixed(1)} hrs
            </span>
            <span className="text-[12px] font-medium text-[#5B21B6] dark:text-[#C4B5FD]">
              {activeWorkflows.length} active rules
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] font-medium text-[#646275] dark:text-[#9D9AB2]">
            Open Customer Enquiries
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white">
              {openEnquiries.length}
            </span>
            <span className="text-[12px] text-[#646275] dark:text-[#9D9AB2] tabular-nums">
              {resolvedEnquiries} resolved in queue
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] font-medium text-[#646275] dark:text-[#9D9AB2]">
            Operational Tasks
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white">
              {tasks.length}
            </span>
            <span className="text-[12px] text-[#16A34A] dark:text-[#4ADE80] tabular-nums">
              {completedTasks} completed
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-[#0D0D12] dark:bg-[#171522] border border-[#0D0D12] dark:border-[#2C2742] p-5 text-white">
          <div className="text-[12.5px] font-medium text-[#B8B5CA]">
            Est. Monthly Cost Savings
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono-tabular text-2xl font-semibold text-[#EDE9FE]">
              ${estimatedMonthlySavings.toLocaleString()}
            </span>
            <span className="text-[12px] text-[#C4B5FD]">
              Demo projection
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Automation Throughput Chart */}
      <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white">
              Automation Throughput & Hours Saved
            </h3>
            <p className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2]">
              Sample operational time reclaimed across enquiry triage and scheduled tasks
            </p>
          </div>
          <div className="inline-flex items-center rounded-md bg-[#F4F2FA] dark:bg-[#181822] p-1 self-start">
            {(["7D", "30D", "90D"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-[12px] font-medium transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                    : "text-[#646275] dark:text-[#9D9AB2] hover:text-[#0D0D12] dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-3">
            <div className="h-52 flex items-end gap-3 pt-6 pb-2 border-b border-[#ECEAF3] dark:border-[#1F1F2E]">
              {series.map((point, idx) => {
                const pct = Math.max((point.hoursSaved / maxHours) * 100, 10);
                const isHovered = hoveredIdx === idx;
                return (
                  <div
                    key={point.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    <div className="text-[11px] font-mono-tabular text-[#646275] dark:text-[#9D9AB2] mb-1.5">
                      {point.hoursSaved}h
                    </div>
                    <div className="w-full max-w-[44px] h-full flex items-end">
                      <div
                        style={{ height: `${pct}%` }}
                        className={`w-full rounded-t-sm transition-colors duration-150 ${
                          isHovered
                            ? "bg-[#7C3AED] dark:bg-[#A78BFA]"
                            : "bg-[#DDD6FE] dark:bg-[#3A3059]"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 pt-2">
              {series.map((point) => (
                <div
                  key={point.label}
                  className="flex-1 text-center text-[12px] text-[#646275] dark:text-[#9D9AB2]"
                >
                  {point.label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-[#F9F8FC] dark:bg-[#171722] border border-[#EAE8F2] dark:border-[#242434] p-4 space-y-3">
            <div className="text-[12px] font-medium text-[#646275] dark:text-[#9D9AB2]">
              {hoveredIdx !== null
                ? `Period: ${series[hoveredIdx].label}`
                : `Period Summary (${timeframe})`}
            </div>
            <div>
              <div className="text-[11.5px] text-[#7A788C]">Hours Reclaimed</div>
              <div className="font-mono-tabular text-lg font-semibold text-[#0D0D12] dark:text-white">
                {(hoveredIdx !== null
                  ? series[hoveredIdx].hoursSaved
                  : series.reduce((s, x) => s + x.hoursSaved, 0)
                ).toFixed(1)}{" "}
                hrs
              </div>
            </div>
            <div>
              <div className="text-[11.5px] text-[#7A788C]">Tasks Automated</div>
              <div className="font-mono-tabular text-base font-semibold text-[#0D0D12] dark:text-white">
                {hoveredIdx !== null
                  ? series[hoveredIdx].tasksAutomated
                  : series.reduce((s, x) => s + x.tasksAutomated, 0)}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] text-[#7A788C]">Enquiries Resolved</div>
              <div className="font-mono-tabular text-base font-semibold text-[#0D0D12] dark:text-white">
                {hoveredIdx !== null
                  ? series[hoveredIdx].enquiriesResolved
                  : series.reduce((s, x) => s + x.enquiriesResolved, 0)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split Snapshot: Priority Enquiries + Active Automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] flex flex-col">
          <div className="px-5 py-4 border-b border-[#ECEAF3] dark:border-[#1F1F2E] flex items-center justify-between">
            <h3 className="font-display text-[14.5px] font-semibold text-[#0D0D12] dark:text-white">
              Priority Customer Enquiries
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("enquiries")}
              className="text-[12.5px] font-medium text-[#5B21B6] dark:text-[#C4B5FD] hover:underline whitespace-nowrap"
            >
              View inbox
            </button>
          </div>
          <div className="divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A] flex-1">
            {openEnquiries.slice(0, 4).map((enq) => (
              <button
                key={enq.id}
                type="button"
                onClick={() => {
                  onSelectEnquiry(enq.id);
                  onNavigate("enquiries");
                }}
                className="w-full text-left px-5 py-3.5 hover:bg-[#FAF9FD] dark:hover:bg-[#161621] transition-colors flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-[#0D0D12] dark:text-white truncate">
                    {enq.subject}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                    <span>{enq.customerName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{enq.company}</span>
                    <span aria-hidden="true">·</span>
                    <span>{enq.channel}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={`text-[12px] font-medium ${
                      enq.priority === "Urgent"
                        ? "text-[#DC2626] dark:text-[#F87171]"
                        : enq.priority === "High"
                          ? "text-[#D97706] dark:text-[#FBBF24]"
                          : "text-[#646275] dark:text-[#9D9AB2]"
                    }`}
                  >
                    {enq.priority}
                  </div>
                  <div className="font-mono-tabular text-[11.5px] text-[#858399] mt-0.5">
                    {enq.slaMinutesLeft > 0 ? `${enq.slaMinutesLeft}m SLA` : enq.status}
                  </div>
                </div>
              </button>
            ))}
            {openEnquiries.length === 0 && (
              <div className="px-5 py-8 text-center text-[13px] text-[#646275] dark:text-[#9D9AB2]">
                All enquiries in this workspace are resolved.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] flex flex-col">
          <div className="px-5 py-4 border-b border-[#ECEAF3] dark:border-[#1F1F2E] flex items-center justify-between">
            <h3 className="font-display text-[14.5px] font-semibold text-[#0D0D12] dark:text-white">
              Workflow Automation Rules
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("workflows")}
              className="text-[12.5px] font-medium text-[#5B21B6] dark:text-[#C4B5FD] hover:underline whitespace-nowrap"
            >
              Manage rules
            </button>
          </div>
          <div className="divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A] flex-1">
            {workflows.slice(0, 4).map((wf) => (
              <div
                key={wf.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-[#0D0D12] dark:text-white truncate">
                    {wf.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                    <span>{wf.active ? "Active" : "Paused"}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{wf.runsThisMonth} runs</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{wf.hoursSavedPerWeek}h/wk saved</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRunWorkflowTest(wf.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E2DFEC] dark:border-[#2B2B3C] px-2.5 py-1.5 text-[12px] font-medium text-[#0D0D12] dark:text-[#E5E3F0] hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27] transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="h-3 w-3" />
                  <span>Simulate</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
