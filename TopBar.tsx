import React from "react";
import { Menu, Plus } from "lucide-react";
import { ViewId } from "../types";

interface TopBarProps {
  activeView: ViewId;
  industryLabel: string;
  onOpenMobileMenu: () => void;
  onQuickCreateTask: () => void;
}

const VIEW_TITLES: Record<ViewId, string> = {
  overview: "Business Overview",
  assistant: "AI Automation Assistant",
  enquiries: "Customer Enquiry Management",
  tasks: "Task Management",
  workflows: "Workflow Automation",
  analytics: "Analytics Dashboard",
  media: "Creative & Media Studio",
};

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  industryLabel,
  onOpenMobileMenu,
  onQuickCreateTask,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#0D0D13]/95 backdrop-blur border-b border-[#E6E4EE] dark:border-[#1E1E2B] px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-md text-[#181820] dark:text-[#E8E6F2] hover:bg-[#F3F1FA] dark:hover:bg-[#191924] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-[13px] min-w-0">
          <span className="hidden sm:inline text-[#6E6C80] dark:text-[#9895AD] whitespace-nowrap shrink-0">
            {industryLabel}
          </span>
          <span
            className="hidden sm:inline text-[#C5C2D4] dark:text-[#3A384D]"
            aria-hidden="true"
          >
            /
          </span>
          <h1 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white truncate">
            {VIEW_TITLES[activeView]}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onQuickCreateTask}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-3.5 py-2 text-[13px] font-medium text-white dark:text-[#0B0B10] hover:bg-[#23232F] dark:hover:bg-[#E9E3FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
