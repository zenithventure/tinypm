export const WORK_ITEM_TYPES = ["feature", "bug", "decision", "sales-insight", "ops-task"] as const
export type WorkItemType = (typeof WORK_ITEM_TYPES)[number]

export const WORK_ITEM_STATUSES = ["todo", "in-progress", "in-review", "done", "blocked", "cancelled"] as const
export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number]

export const WORK_ITEM_PRIORITIES = ["low", "medium", "high", "critical"] as const
export type WorkItemPriority = (typeof WORK_ITEM_PRIORITIES)[number]

export const ROADMAP_STATUSES = ["planned", "in-progress", "done", "parked"] as const
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number]

export const ARTEFACT_TYPES = ["google-doc", "github-issue", "github-pr", "meet-transcript", "other"] as const
export type ArtefactType = (typeof ARTEFACT_TYPES)[number]

export const WORKSPACE_ROLES = ["owner", "member"] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

export const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  blocked: "Blocked",
  cancelled: "Cancelled",
  planned: "Planned",
  parked: "Parked",
}

export const TYPE_LABELS: Record<string, string> = {
  feature: "Feature",
  bug: "Bug",
  decision: "Decision",
  "sales-insight": "Sales Insight",
  "ops-task": "Ops Task",
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}
