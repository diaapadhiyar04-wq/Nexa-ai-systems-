import React, { useState } from "react";
import { ArrowRight, Play, Plus, Unplug, X } from "lucide-react";
import { EXTERNAL_CONNECTORS } from "../data/demoData";
import { ExecutionLog, IndustryId, WorkflowRule } from "../types";

interface WorkflowsViewProps {
  workflows: WorkflowRule[];
  executionLogs: ExecutionLog[];
  activeIndustry: IndustryId;
  onToggleWorkflow: (id: string) => void;
  onRunWorkflowTest: (id: string) => void;
  onAddWorkflow: (wf: Omit<WorkflowRule, "id" | "runsThisMonth" | "lastRunAt">) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  executionLogs,
  activeIndustry,
  onToggleWorkflow,
  onRunWorkflowTest,
  onAddWorkflow,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Operations");
  const [trigger, setTrigger] = useState("");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("");
  const [hoursSaved, setHoursSaved] = useState("6");
  const [connectorNotice, setConnectorNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !trigger.trim() || !action.trim()) return;
    onAddWorkflow({
      name: name.trim(),
      department: department.trim() || "Operations",
      trigger: trigger.trim(),
      condition: condition.trim() || "Always",
      action: action.trim(),
      active: true,
      hoursSavedPerWeek: Number(hoursSaved) || 4,
      externalConnector: "Demo Rule Engine",
      industry: activeIndustry,
    });
    setName("");
    setTrigger("");
    setCondition("");
    setAction("");
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#0D0D12] dark:text-white">
            Automated Operations Pipelines
          </h2>
          <p className="text-[13px] text-[#646275] dark:text-[#9D9AB2]">
            Trigger-condition-action rules. Simulate executions locally; external app webhooks are not yet connected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-3.5 py-2 text-[13px] font-medium text-white dark:text-[#0B0B10] hover:bg-[#23232F] whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                    <span className="font-mono-tabular">{wf.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{wf.department}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        wf.active
                          ? "text-[#16A34A] dark:text-[#4ADE80] font-medium"
                          : "text-[#858399]"
                      }
                    >
                      {wf.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <h3 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white mt-0.5">
                    {wf.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRunWorkflowTest(wf.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] px-3 py-1.5 text-[12px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27]"
                  >
                    <Play className="h-3 w-3" />
                    <span>Simulate Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleWorkflow(wf.id)}
                    className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                      wf.active
                        ? "bg-[#EDE9FE] dark:bg-[#272042] text-[#3B1E8A] dark:text-[#E5DCFF]"
                        : "bg-[#F3F2F8] dark:bg-[#1C1C28] text-[#646275] dark:text-[#9D9AB2]"
                    }`}
                  >
                    {wf.active ? "Pause" : "Activate"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="rounded-md bg-[#FAF9FD] dark:bg-[#161621] border border-[#ECEAF3] dark:border-[#232334] p-3">
                  <div className="text-[11px] font-medium text-[#7A788C]">Trigger</div>
                  <div className="text-[12.5px] text-[#0D0D12] dark:text-[#EFEFF6] mt-1">
                    {wf.trigger}
                  </div>
                </div>
                <div className="rounded-md bg-[#FAF9FD] dark:bg-[#161621] border border-[#ECEAF3] dark:border-[#232334] p-3">
                  <div className="text-[11px] font-medium text-[#7A788C]">Condition</div>
                  <div className="text-[12.5px] text-[#0D0D12] dark:text-[#EFEFF6] mt-1">
                    {wf.condition}
                  </div>
                </div>
                <div className="rounded-md bg-[#F6F3FF] dark:bg-[#1D192E] border border-[#E4DDFC] dark:border-[#342B57] p-3">
                  <div className="text-[11px] font-medium text-[#5B21B6] dark:text-[#C4B5FD] flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Action</span>
                  </div>
                  <div className="text-[12.5px] text-[#0D0D12] dark:text-white mt-1">
                    {wf.action}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#646275] dark:text-[#9D9AB2] pt-1 border-t border-[#F2F0F8] dark:border-[#1D1D2A]">
                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular">{wf.runsThisMonth} runs/mo</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{wf.hoursSavedPerWeek}h/wk saved</span>
                  <span aria-hidden="true">·</span>
                  <span>Last run {wf.lastRunAt}</span>
                </div>
                {wf.externalConnector && (
                  <span className="text-[11.5px] text-[#7A788C]">
                    Connector: {wf.externalConnector}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar: Execution Log + Disconnected Integrations */}
        <div className="space-y-5">
          <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5">
            <h3 className="font-display text-[14px] font-semibold text-[#0D0D12] dark:text-white">
              Recent Execution Log
            </h3>
            <div className="mt-3 divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A]">
              {executionLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-2.5 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#0D0D12] dark:text-white truncate pr-2">
                      {log.workflowName}
                    </span>
                    <span className="font-mono-tabular text-[11.5px] text-[#7A788C] shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="text-[#646275] dark:text-[#9D9AB2] mt-0.5 leading-snug">
                    {log.summary}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[14px] font-semibold text-[#0D0D12] dark:text-white">
                External Service Connectors
              </h3>
              <Unplug className="h-4 w-4 text-[#858399]" />
            </div>
            <p className="text-[12px] text-[#646275] dark:text-[#9D9AB2]">
              Third-party SaaS integrations below are not yet connected in this first release.
            </p>

            {connectorNotice && (
              <div className="rounded-md bg-[#F5F2FF] dark:bg-[#1F1B33] border border-[#DDD6FE] dark:border-[#3A3059] p-3 text-[12px] text-[#3B1E8A] dark:text-[#DDD6FE]">
                {connectorNotice}
              </div>
            )}

            <div className="divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A]">
              {EXTERNAL_CONNECTORS.map((conn) => (
                <div key={conn.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#0D0D12] dark:text-white">
                      {conn.name}
                    </div>
                    <div className="text-[11.5px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
                      {conn.status} · {conn.category}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConnectorNotice(
                        `${conn.name} requires OAuth/API credentials to connect live webhooks. Currently running in local simulation mode.`
                      )
                    }
                    className="rounded border border-[#DCD9E8] dark:border-[#2A2A3B] px-2.5 py-1 text-[11.5px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27] shrink-0"
                  >
                    Setup Info
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-[#14141D] border border-[#E6E4EE] dark:border-[#262638] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#0D0D12] dark:text-white">
                Create Automation Workflow
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#646275] hover:text-[#0D0D12] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                type="text"
                placeholder="Workflow name (e.g., VIP Order Delay Escalation)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={80}
                  step="0.5"
                  placeholder="Est. hrs saved / wk"
                  value={hoursSaved}
                  onChange={(e) => setHoursSaved(e.target.value)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                />
              </div>
              <input
                required
                type="text"
                placeholder="Trigger (e.g., New enquiry marked Urgent)"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
              />
              <input
                type="text"
                placeholder="Condition (e.g., Order value > $1,000)"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
              />
              <input
                required
                type="text"
                placeholder="Action (e.g., Create task + draft AI response)"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#191924] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] px-4 py-2 text-[13px] font-medium text-[#646275] dark:text-[#9D9AB2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-4 py-2 text-[13px] font-medium text-white dark:text-[#0B0B10]"
                >
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
