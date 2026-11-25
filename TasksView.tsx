import React, { useMemo, useState } from "react";
import { Check, LayoutGrid, List, Search, Sparkles, Trash2 } from "lucide-react";
import { TaskItem, TeamMember } from "../types";

interface TasksViewProps {
  tasks: TaskItem[];
  teamMembers: TeamMember[];
  industryLabel: string;
  onUpdateTaskStatus: (id: string, status: TaskItem["status"]) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtasks: (taskId: string, subtasks: string[]) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTaskModal: () => void;
}

const STATUSES: TaskItem["status"][] = ["To Do", "In Progress", "Review", "Done"];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  teamMembers,
  industryLabel,
  onUpdateTaskStatus,
  onToggleSubtask,
  onAddSubtasks,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TaskItem["priority"]>("All");
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, priorityFilter, search]);

  const getMember = (id: string) =>
    teamMembers.find((m) => m.id === id) || teamMembers[0];

  const handleAiBreakdown = async (task: TaskItem) => {
    setBreakingDownId(task.id);
    setAiError(null);
    try {
      const res = await fetch("/api/tasks/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          department: task.department,
          industry: industryLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to generate subtasks.");
      }
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        onAddSubtasks(task.id, data.subtasks);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to break down task.");
    } finally {
      setBreakingDownId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-md bg-[#F2F0F8] dark:bg-[#171722] p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                viewMode === "table"
                  ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                  : "text-[#646275] dark:text-[#9D9AB2]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                viewMode === "board"
                  ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                  : "text-[#646275] dark:text-[#9D9AB2]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
          </div>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as "All" | TaskItem["priority"])
            }
            className="rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#111118] px-3 py-1.5 text-[12.5px] text-[#0D0D12] dark:text-white"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-[#858399] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-white dark:bg-[#111118] pl-8 pr-3 py-1.5 text-[13px] text-[#0D0D12] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
            />
          </div>
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="rounded-md bg-[#EDE9FE] dark:bg-[#251F3D] border border-[#DDD6FE] dark:border-[#3E3369] px-3 py-1.5 text-[12.5px] font-medium text-[#3B1E8A] dark:text-[#E5DCFF] hover:bg-[#E1DAFC] whitespace-nowrap"
          >
            + Add Task
          </button>
        </div>
      </div>

      {aiError && (
        <div className="rounded-md bg-[#FEF2F2] dark:bg-[#2B1418] border border-[#FECACA] dark:border-[#7F1D1D] px-4 py-2.5 text-[13px] text-[#991B1B] dark:text-[#FCA5A5]">
          {aiError}
        </div>
      )}

      {viewMode === "table" ? (
        <div className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#ECEAF3] dark:border-[#1F1F2E] text-[12px] font-medium text-[#646275] dark:text-[#9D9AB2]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEF6] dark:divide-[#1D1D2A] text-[13px]">
              {filtered.map((task) => {
                const owner = getMember(task.assigneeId);
                return (
                  <React.Fragment key={task.id}>
                    <tr className="hover:bg-[#FAF9FD] dark:hover:bg-[#161621] transition-colors">
                      <td className="py-3 px-4 font-mono-tabular text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                        {task.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#0D0D12] dark:text-white">
                          {task.title}
                        </div>
                        {task.automatedSource && (
                          <div className="text-[11.5px] text-[#646275] dark:text-[#9D9AB2] mt-0.5">
                            Triggered by {task.automatedSource}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#4A485C] dark:text-[#C5C3D4]">
                        {task.department}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={owner.avatarUrl}
                            alt={owner.name}
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded-full object-cover border border-[#E6E4EE] dark:border-[#2A2A3B]"
                          />
                          <span className="text-[#0D0D12] dark:text-[#E8E6F2] whitespace-nowrap">
                            {owner.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${
                            task.priority === "Urgent"
                              ? "text-[#DC2626] dark:text-[#F87171]"
                              : task.priority === "High"
                                ? "text-[#D97706] dark:text-[#FBBF24]"
                                : "text-[#646275] dark:text-[#9D9AB2]"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          aria-label={`Status for ${task.title}`}
                          value={task.status}
                          onChange={(e) =>
                            onUpdateTaskStatus(
                              task.id,
                              e.target.value as TaskItem["status"]
                            )
                          }
                          className="rounded border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#171722] px-2 py-1 text-[12px] text-[#0D0D12] dark:text-white"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-[12px] text-[#646275] dark:text-[#9D9AB2] whitespace-nowrap">
                        {task.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={breakingDownId === task.id}
                            onClick={() => handleAiBreakdown(task)}
                            title="Generate AI subtasks"
                            className="inline-flex items-center gap-1 rounded border border-[#DDD6FE] dark:border-[#3A3059] bg-[#F5F2FF] dark:bg-[#221C38] px-2 py-1 text-[11.5px] font-medium text-[#4C1D95] dark:text-[#DDD6FE] hover:bg-[#EAE3FF] disabled:opacity-50"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>
                              {breakingDownId === task.id ? "..." : "Steps"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                            aria-label={`Delete ${task.title}`}
                            className="p-1.5 text-[#7A788C] hover:text-[#DC2626] dark:hover:text-[#F87171]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {task.subtasks.length > 0 && (
                      <tr className="bg-[#FAF9FD] dark:bg-[#14141D]">
                        <td />
                        <td colSpan={7} className="py-2.5 px-4">
                          <div className="space-y-1.5">
                            {task.subtasks.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => onToggleSubtask(task.id, st.id)}
                                className="flex items-center gap-2 text-[12.5px] text-left text-[#3F3D4F] dark:text-[#D5D3E3] hover:text-[#0D0D12] dark:hover:text-white"
                              >
                                <span
                                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                    st.done
                                      ? "bg-[#0D0D12] dark:bg-[#DDD6FE] border-[#0D0D12] dark:border-[#DDD6FE] text-white dark:text-[#0B0B10]"
                                      : "border-[#C7C3D9] dark:border-[#3A384D]"
                                  }`}
                                >
                                  {st.done && <Check className="h-3 w-3" />}
                                </span>
                                <span className={st.done ? "line-through opacity-60" : ""}>
                                  {st.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-[13px] text-[#646275] dark:text-[#9D9AB2]"
                  >
                    No tasks found. Use "+ Add Task" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {STATUSES.map((status) => {
            const colTasks = filtered.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className="rounded-lg bg-[#F5F4FA] dark:bg-[#13131C] border border-[#E6E4EE] dark:border-[#1E1E2B] p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="font-display text-[13px] font-semibold text-[#0D0D12] dark:text-white">
                    {status}
                  </span>
                  <span className="font-mono-tabular text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map((task) => {
                    const owner = getMember(task.assigneeId);
                    return (
                      <div
                        key={task.id}
                        className="rounded-md bg-white dark:bg-[#191924] border border-[#E6E4EE] dark:border-[#252536] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-mono-tabular text-[#646275] dark:text-[#9D9AB2]">
                            {task.id}
                          </span>
                          <span
                            className={`font-medium ${
                              task.priority === "Urgent"
                                ? "text-[#DC2626] dark:text-[#F87171]"
                                : task.priority === "High"
                                  ? "text-[#D97706] dark:text-[#FBBF24]"
                                  : "text-[#646275] dark:text-[#9D9AB2]"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="text-[13px] font-medium text-[#0D0D12] dark:text-white leading-snug">
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={owner.avatarUrl}
                              alt={owner.name}
                              referrerPolicy="no-referrer"
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span className="text-[11.5px] text-[#646275] dark:text-[#9D9AB2]">
                              {task.dueDate}
                            </span>
                          </div>
                          <select
                            aria-label={`Move ${task.id}`}
                            value={task.status}
                            onChange={(e) =>
                              onUpdateTaskStatus(
                                task.id,
                                e.target.value as TaskItem["status"]
                              )
                            }
                            className="rounded border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#12121A] px-1.5 py-0.5 text-[11px] text-[#0D0D12] dark:text-white"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="py-6 text-center text-[12px] text-[#7A788C]">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
