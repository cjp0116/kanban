// API client for frontend to communicate with backend
export const apiClient = {
  // Board operations
  async getBoard(boardId: string) {
    const response = await fetch(`/api/boards/${boardId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch board")
    }
    return response.json()
  },

  // Task operations
  async createTask(task: {
    title: string
    description?: string
    columnId: string
    boardId: string
    dueDate?: string | null
  }) {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    })
    if (!response.ok) {
      throw new Error("Failed to create task")
    }
    return response.json()
  },

  async updateTask(taskId: string, updates: any) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error("Failed to update task")
    }
    return response.json()
  },

  async deleteTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete task")
    }
    return response.json()
  },

  async moveTask(taskId: string, columnId: string, position: number) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "move",
        columnId,
        position,
      }),
    })
    if (!response.ok) {
      throw new Error("Failed to move task")
    }
    return response.json()
  },

  // Column operations
  async createColumn(column: {
    title: string
    color?: string
    boardId: string
  }) {
    const response = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(column),
    })
    if (!response.ok) {
      throw new Error("Failed to create column")
    }
    return response.json()
  },

  async updateColumn(
    columnId: string,
    updates: {
      title?: string
      color?: string
    },
  ) {
    const response = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error("Failed to update column")
    }
    return response.json()
  },

  async deleteColumn(columnId: string) {
    const response = await fetch(`/api/columns/${columnId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete column")
    }
    return response.json()
  },

  // Automation rules
  async getRules(boardId: string) {
    const response = await fetch(`/api/boards/${boardId}/rules`)
    if (!response.ok) {
      throw new Error("Failed to fetch rules")
    }
    return response.json()
  },

  async createRule(boardId: string, rule: any) {
    const response = await fetch(`/api/boards/${boardId}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    })
    if (!response.ok) {
      throw new Error("Failed to create rule")
    }
    return response.json()
  },

  async updateRule(ruleId: string, updates: any) {
    const response = await fetch(`/api/rules/${ruleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      throw new Error("Failed to update rule")
    }
    return response.json()
  },

  async deleteRule(ruleId: string) {
    const response = await fetch(`/api/rules/${ruleId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete rule")
    }
    return response.json()
  },
}
