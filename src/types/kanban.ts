export interface Task {
  id: string
  title: string
  description?: string
  status: string
  dueDate: string | null
  subtasks: Subtask[]
  customFields: CustomField[]
  createdAt: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  _deleted?: boolean
}

export interface CustomField {
  id: string
  name: string
  value: string
  _deleted?: boolean
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
  color?: string
}

// Add new Rule interfaces for automation
export interface Rule {
  id: string
  name: string
  condition: RuleCondition
  action: RuleAction
  enabled: boolean
}

export interface RuleCondition {
  type: "due_date" | "subtasks_completed" | "custom_field"
  field?: string
  operator:
  | "equal"
  | "not_equal"
  | "contain"
  | "equals"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty"
  | "is_overdue"
  | "all_completed"
  | "is_not_overdue"
  | "all_not_completed"
  value?: string
}

export interface RuleAction {
  type: "move_to_column"
  targetColumnId: string
}
