export type ViewId =
  | "overview"
  | "assistant"
  | "enquiries"
  | "tasks"
  | "workflows"
  | "analytics"
  | "media";

export type IndustryId =
  | "logistics"
  | "ecommerce"
  | "healthcare"
  | "services";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface EnquiryMessage {
  id: string;
  sender: string;
  role: "customer" | "team" | "ai-draft";
  body: string;
  timestamp: string;
}

export interface Enquiry {
  id: string;
  customerName: string;
  company: string;
  email: string;
  channel: "Email" | "Web Form" | "WhatsApp" | "Client Portal";
  subject: string;
  priority: "Urgent" | "High" | "Normal";
  status: "Open" | "In Progress" | "Resolved";
  assignedToId: string;
  receivedAt: string;
  slaMinutesLeft: number;
  industry: IndustryId;
  messages: EnquiryMessage[];
}

export interface TaskSubItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  department: string;
  priority: "Urgent" | "High" | "Normal";
  status: "To Do" | "In Progress" | "Review" | "Done";
  assigneeId: string;
  dueDate: string;
  automatedSource?: string;
  industry: IndustryId;
  subtasks: TaskSubItem[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  department: string;
  trigger: string;
  condition: string;
  action: string;
  active: boolean;
  runsThisMonth: number;
  hoursSavedPerWeek: number;
  lastRunAt: string;
  externalConnector?: string;
  industry: IndustryId;
}

export interface ExecutionLog {
  id: string;
  workflowName: string;
  timestamp: string;
  outcome: "Completed" | "Simulated";
  summary: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedTask?: {
    title: string;
    department: string;
    priority: string;
    dueDate: string;
    added?: boolean;
  } | null;
  suggestedWorkflow?: {
    name: string;
    trigger: string;
    condition: string;
    action: string;
    department: string;
    hoursSavedPerWeek: number;
    added?: boolean;
  } | null;
}

export interface ExternalConnector {
  id: string;
  name: string;
  category: string;
  status: "Not Connected";
  description: string;
}

export interface GeneratedMediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  prompt: string;
  specLabel: string;
  createdAt: string;
}
