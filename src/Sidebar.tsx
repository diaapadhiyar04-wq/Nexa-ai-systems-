import React from "react";
import {
  Activity,
  Bot,
  CheckSquare,
  Film,
  GitBranch,
  Inbox,
  LayoutDashboard,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { INDUSTRIES } from "../data/demoData";
import { IndustryId, ViewId } from "../types";

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  selectedIndustry: IndustryId | "all";
  onSelectIndustry: (industry: IndustryId | "all") => void;
  openEnquiriesCount: number;
  pendingTasksCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "overview", label: "Business Overview", icon: LayoutDashboard },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "enquiries", label: "Customer Enquiries", icon: Inbox },
  { id: "tasks", label: "Task Management", icon: CheckSquare },
  { id: "workflows", label: "Workflow Automation", icon: GitBranch },
  { id: "analytics", label: "Analytics", icon: Activity },
  { id: "media", label: "Media Studio", icon: Film },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  selectedIndustry,
  onSelectIndustry,
  openEnquiriesCount,
  pendingTasksCount,
  darkMode,
  onToggleDarkMode,
  mobileOpen,
  onCloseMobile,
}) => {
  const sidebarBody = (
    <div className="flex h-full w-[256px] flex-col bg-[#0B0B10] text-[#F5F4FA] border-r border-[#1D1D28]">
      <div className="flex h-14 items-center justify-between px-5 border-b border-[#1D1D28]">
        <button
          type="button"
          onClick={() => {
            onSelectView("overview");
            onCloseMobile();
          }}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD] rounded"
        >
          <span className="font-display text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
            NEXA AI SYSTEMS
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 text-[#A5A3B8] hover:text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-3 border-b border-[#1D1D28]">
        <label
          htmlFor="industry-scope"
          className="block text-[11px] font-medium text-[#9A98AE] mb-1.5"
        >
          Industry workspace (demo)
        </label>
        <select
          id="industry-scope"
          value={selectedIndustry}
          onChange={(e) =>
            onSelectIndustry(e.target.value as IndustryId | "all")
          }
          className="w-full rounded-md bg-[#14141D] border border-[#272736] px-2.5 py-2 text-[13px] text-[#F5F4FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD]"
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const count =
            item.id === "enquiries"
              ? openEnquiriesCount
              : item.id === "tasks"
                ? pendingTasksCount
                : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD] ${
                isActive
                  ? "bg-[#DDD6FE] text-[#0B0B10]"
                  : "text-[#B6B4C9] hover:bg-[#161620] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-[#0B0B10]" : "text-[#9A98AE]"
                  }`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              {count !== null && (
                <span
                  className={`font-mono-tabular text-[12px] pl-2 shrink-0 ${
                    isActive ? "text-[#0B0B10] font-semibold" : "text-[#8E8CA3]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1D1D28] space-y-3">
        <div className="text-[12px] text-[#9A98AE] leading-relaxed">
          <div className="font-medium text-[#E4DFFF]">Live AI & Demo Mode</div>
          <div className="mt-0.5 text-[#8E8CA3]">
            Assistant & Media use Gemini API. External CRM & webhooks are simulated.
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-[#272736] bg-[#14141D] text-[13px] text-[#E4E3EE] hover:border-[#3A3A4F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4B5FD]"
        >
          <span className="whitespace-nowrap">
            {darkMode ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
          </span>
          {darkMode ? (
            <Sun className="h-4 w-4 text-[#DDD6FE] shrink-0" />
          ) : (
            <Moon className="h-4 w-4 text-[#DDD6FE] shrink-0" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  );
};
