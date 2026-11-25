import React, { useMemo } from "react";
import { Download } from "lucide-react";
import { Enquiry, TaskItem, WorkflowRule } from "../types";

interface AnalyticsViewProps {
  enquiries: Enquiry[];
  tasks: TaskItem[];
  workflows: WorkflowRule[];
  industryLabel: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  enquiries,
  tasks,
  workflows,
  industryLabel,
}) => {
  const departmentMetrics = useMemo(() => {
    const map = new Map<
      string,
      { department: string; hoursPerWeek: number; runs: number; workflows: number }
    >();
    workflows.forEach((wf) => {
      const existing = map.get(wf.department) || {
        department: wf.department,
        hoursPerWeek: 0,
        runs: 0,
        workflows: 0,
      };
      existing.hoursPerWeek += wf.active ? wf.hoursSavedPerWeek : 0;
      existing.runs += wf.runsThisMonth;
      existing.workflows += 1;
      map.set(wf.department, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);
  }, [workflows]);

  const channelBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Email: 0,
      "Web Form": 0,
      WhatsApp: 0,
      "Client Portal": 0,
    };
    enquiries.forEach((e) => {
      counts[e.channel] = (counts[e.channel] || 0) + 1;
    });
    const total = Math.max(enquiries.length, 1);
    return Object.entries(counts).map(([channel, count]) => ({
      channel,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [enquiries]);

  const totalWeeklyHours = workflows
    .filter((w) => w.active)
    .reduce((sum, w) => sum + w.hoursSavedPerWeek, 0);

  const taskCompletionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "Done").length / tasks.length) * 100)
    : 0;

  const enquiryResolutionRate = enquiries.length
    ? Math.round(
        (enquiries.filter((e) => e.status === "Resolved").length / enquiries.length) * 100
      )
    : 0;

  const handleExportCsv = () => {
    const rows = [
      ["Department", "Active Workflows", "Monthly Runs", "Hours Saved / Week", "Est. Monthly Savings USD"],
      ...departmentMetrics.map((d) => [
        d.department,
        String(d.workflows),
        String(d.runs),
        d.hoursPerWeek.toFixed(1),
        String(Math.round(d.hoursPerWeek * 4.2 * 65)),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexa-ai-systems-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxDeptHours = Math.max(...departmentMetrics.map((d) => d.hoursPerWeek), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#0D0D12] dark:text-white">
            Operational Analytics ({industryLabel})
          </h2>
          <p className="text-[13px] text-[#646275] dark:text-[#9D9AB2]">
            Computed dynamically from current workspace enquiries, tasks, and workflow rules (demo dataset)
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#111118] px-3.5 py-2 text-[13px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1A1A25] whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2]">
            Annualized Time Reclaimed
          </div>
          <div className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white mt-2">
            {Math.round(totalWeeklyHours * 52).toLocaleString()} hrs
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2]">
            Task Completion Rate
          </div>
          <div className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white mt-2">
            {taskCompletionRate}%
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
          <div className="text-[12.5px] text-[#646275] dark:text-[#9D9AB2]">
            Enquiry Resolution Rate
          </div>
          <div className="font-mono-tabular text-2xl font-semibold text-[#0D0D12] dark:text-white mt-2">
            {enquiryResolutionRate}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-4">
          <h3 className="font-display text-[14.5px] font-semibold text-[#0D0D12] dark:text-white">
            Hours Saved by Department
          </h3>
          <div className="space-y-3.5">
            {departmentMetrics.map((dept) => {
              const widthPct = Math.max((dept.hoursPerWeek / maxDeptHours) * 100, 4);
              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#0D0D12] dark:text-white">
                      {dept.department}
                    </span>
                    <span className="font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                      {dept.hoursPerWeek.toFixed(1)} hrs/wk
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded bg-[#F2F0F8] dark:bg-[#1C1C28] overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded bg-[#8B5CF6] dark:bg-[#C4B5FD]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-4">
          <h3 className="font-display text-[14.5px] font-semibold text-[#0D0D12] dark:text-white">
            Enquiry Volume by Channel (Demo Feeds)
          </h3>
          <div className="space-y-3.5">
            {channelBreakdown.map((item) => (
              <div key={item.channel} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#0D0D12] dark:text-white">
                    {item.channel}
                  </span>
                  <span className="font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full rounded bg-[#F2F0F8] dark:bg-[#1C1C28] overflow-hidden">
                  <div
                    style={{ width: `${Math.max(item.pct, 3)}%` }}
                    className="h-full rounded bg-[#0D0D12] dark:bg-[#EDE9FE]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] overflow-x-auto">
        <div className="px-5 py-4 border-b border-[#ECEAF3] dark:border-[#1F1F2E]">
          <h3 className="font-display text-[14.5px] font-semibold text-[#0D0D12] dark:text-white">
            Department Automation ROI Breakdown
          </h3>
        </div>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#ECEAF3] dark:border-[#1F1F2E] text-[12px] font-medium text-[#646275] dark:text-[#9D9AB2]">
              <th className="py-3 px-5">Department</th>
              <th className="py-3 px-5 text-right">Rules</th>
              <th className="py-3 px-5 text-right">Monthly Runs</th>
              <th className="py-3 px-5 text-right">Hours Saved / Wk</th>
              <th className="py-3 px-5 text-right">Est. Monthly Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A] text-[13px]">
            {departmentMetrics.map((d) => (
              <tr key={d.department}>
                <td className="py-3 px-5 font-medium text-[#0D0D12] dark:text-white">
                  {d.department}
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                  {d.workflows}
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                  {d.runs}
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-[#0D0D12] dark:text-white">
                  {d.hoursPerWeek.toFixed(1)}h
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular font-semibold text-[#5B21B6] dark:text-[#C4B5FD]">
                  ${Math.round(d.hoursPerWeek * 4.2 * 65).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
