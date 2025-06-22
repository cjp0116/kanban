import type { Task } from "@/types/kanban"
import { generateId } from "@/lib/utils"

// Mock data for initial tasks
export const generateMockTasks = (): { [key: string]: Task[] } => {
  // Helper to create a date string (past or future)
  const createDate = (daysFromNow: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString()
  }

  // To Do tasks
  const todoTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Research competitor products",
      description: "Analyze top 5 competitor products and create a comparison report",
      status: "To Do",
      dueDate: createDate(5),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Identify top competitors", completed: false },
        { id: `subtask-${generateId()}`, title: "Create comparison criteria", completed: false },
        { id: `subtask-${generateId()}`, title: "Gather product information", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Estimated Hours", value: "8" },
      ],
      createdAt: createDate(-2),
    },
    {
      id: `task-${generateId()}`,
      title: "Design new landing page",
      description: "Create wireframes and mockups for the new product landing page",
      status: "To Do",
      dueDate: createDate(7),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Research design trends", completed: false },
        { id: `subtask-${generateId()}`, title: "Create wireframes", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Assigned To", value: "Sarah" },
      ],
      createdAt: createDate(-1),
    },
    {
      id: `task-${generateId()}`,
      title: "Update documentation",
      description: "Update the user documentation with the latest features",
      status: "To Do",
      dueDate: createDate(3),
      subtasks: [],
      customFields: [{ id: `field-${generateId()}`, name: "Priority", value: "Low" }],
      createdAt: createDate(-3),
    },
  ]

  // In Progress tasks
  const inProgressTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Implement authentication flow",
      description: "Create login, registration, and password reset functionality",
      status: "In Progress",
      dueDate: createDate(2),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Design authentication screens", completed: true },
        { id: `subtask-${generateId()}`, title: "Implement login functionality", completed: true },
        { id: `subtask-${generateId()}`, title: "Implement registration", completed: false },
        { id: `subtask-${generateId()}`, title: "Implement password reset", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Assigned To", value: "Michael" },
        { id: `field-${generateId()}`, name: "Story Points", value: "8" },
      ],
      createdAt: createDate(-5),
    },
    {
      id: `task-${generateId()}`,
      title: "Optimize database queries",
      description: "Improve performance of slow database queries on the dashboard",
      status: "In Progress",
      dueDate: createDate(1),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Identify slow queries", completed: true },
        { id: `subtask-${generateId()}`, title: "Add indexes", completed: false },
        { id: `subtask-${generateId()}`, title: "Rewrite complex queries", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Estimated Hours", value: "6" },
      ],
      createdAt: createDate(-4),
    },
  ]

  // Blocked tasks
  const blockedTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Fix payment integration",
      description: "Resolve issues with the Stripe payment integration",
      status: "Blocked",
      dueDate: createDate(-1), // Overdue
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Investigate error logs", completed: true },
        { id: `subtask-${generateId()}`, title: "Contact Stripe support", completed: true },
        { id: `subtask-${generateId()}`, title: "Update API integration", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Critical" },
        { id: `field-${generateId()}`, name: "Blocker", value: "Waiting for API documentation" },
      ],
      createdAt: createDate(-7),
    },
    {
      id: `task-${generateId()}`,
      title: "Finalize third-party integrations",
      description: "Complete integration with analytics and marketing tools",
      status: "Blocked",
      dueDate: createDate(-2), // Overdue
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Set up Google Analytics", completed: true },
        { id: `subtask-${generateId()}`, title: "Integrate Mailchimp", completed: false },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Blocker", value: "Waiting for API keys" },
      ],
      createdAt: createDate(-6),
    },
  ]

  // Completed tasks
  const completedTasks: Task[] = [
    {
      id: `task-${generateId()}`,
      title: "Create project proposal",
      description: "Draft and finalize the project proposal document",
      status: "Completed",
      dueDate: createDate(-5),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Research market needs", completed: true },
        { id: `subtask-${generateId()}`, title: "Define project scope", completed: true },
        { id: `subtask-${generateId()}`, title: "Create budget estimate", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Completed On", value: createDate(-6).split("T")[0] },
      ],
      createdAt: createDate(-10),
    },
    {
      id: `task-${generateId()}`,
      title: "Set up development environment",
      description: "Configure development, staging, and production environments",
      status: "Completed",
      dueDate: createDate(-8),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Set up local environment", completed: true },
        { id: `subtask-${generateId()}`, title: "Configure staging server", completed: true },
        { id: `subtask-${generateId()}`, title: "Set up CI/CD pipeline", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "Medium" },
        { id: `field-${generateId()}`, name: "Completed By", value: "David" },
      ],
      createdAt: createDate(-12),
    },
    {
      id: `task-${generateId()}`,
      title: "Initial user research",
      description: "Conduct interviews and surveys with potential users",
      status: "Completed",
      dueDate: createDate(-15),
      subtasks: [
        { id: `subtask-${generateId()}`, title: "Create research questions", completed: true },
        { id: `subtask-${generateId()}`, title: "Recruit participants", completed: true },
        { id: `subtask-${generateId()}`, title: "Analyze results", completed: true },
      ],
      customFields: [
        { id: `field-${generateId()}`, name: "Priority", value: "High" },
        { id: `field-${generateId()}`, name: "Participants", value: "12" },
      ],
      createdAt: createDate(-20),
    },
  ]

  return {
    "To Do": todoTasks,
    "In Progress": inProgressTasks,
    Blocked: blockedTasks,
    Completed: completedTasks,
  }
}