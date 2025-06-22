import type { Column, Rule } from "@/types/kanban"
import { generateMockTasks } from "@/lib/mock-data"
import { generateId } from "@/lib/utils"

const STORAGE_KEYS = {
  COLUMNS: "kanban-columns",
  RULES: "kanban-rules",
  INITIALIZED: "kanban-initialized",
} as const

// Storage utilities
export const storage = {
  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const test = "__localStorage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  // Generic get/set methods with error handling
  getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
      return false
    }
  },

  removeItem(key: string): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
      return false
    }
  },
}

// Kanban-specific storage functions
export const kanbanStorage = {
  // Initialize with default data if first time
  initializeData(): { columns: Column[]; rules: Rule[] } {
    const isInitialized = storage.getItem(STORAGE_KEYS.INITIALIZED, false)

    if (!isInitialized) {
      // First time - create default data
      const mockTasks = generateMockTasks()

      const defaultColumns: Column[] = [
        {
          id: "column-1",
          title: "To Do",
          tasks: mockTasks["To Do"],
          color: "bg-blue-50 dark:bg-blue-900/30",
        },
        {
          id: "column-2",
          title: "In Progress",
          tasks: mockTasks["In Progress"],
          color: "bg-yellow-50 dark:bg-yellow-900/30",
        },
        {
          id: "column-3",
          title: "Blocked",
          tasks: mockTasks["Blocked"],
          color: "bg-red-50 dark:bg-red-900/30",
        },
        {
          id: "column-4",
          title: "Completed",
          tasks: mockTasks["Completed"],
          color: "bg-green-50 dark:bg-green-900/30",
        },
      ]

      const defaultRules: Rule[] = [
        {
          id: `rule-${generateId()}`,
          name: "Move overdue tasks to Blocked",
          condition: {
            type: "due-date",
            operator: "is-overdue",
          },
          action: {
            type: "move-to-column",
            targetColumnId: "column-3", // Blocked column
          },
          enabled: true,
        },
        {
          id: `rule-${generateId()}`,
          name: "Move completed tasks when all subtasks done",
          condition: {
            type: "subtasks-completed",
            operator: "all-completed",
          },
          action: {
            type: "move-to-column",
            targetColumnId: "column-4", // Completed column
          },
          enabled: true,
        },
      ]

      // Save to localStorage
      this.saveColumns(defaultColumns)
      this.saveRules(defaultRules)
      storage.setItem(STORAGE_KEYS.INITIALIZED, true)

      return { columns: defaultColumns, rules: defaultRules }
    }

    // Load existing data
    return {
      columns: this.loadColumns(),
      rules: this.loadRules(),
    }
  },

  // Column operations
  loadColumns(): Column[] {
    return storage.getItem<Column[]>(STORAGE_KEYS.COLUMNS, [])
  },

  saveColumns(columns: Column[]): boolean {
    return storage.setItem(STORAGE_KEYS.COLUMNS, columns)
  },

  // Rule operations
  loadRules(): Rule[] {
    return storage.getItem<Rule[]>(STORAGE_KEYS.RULES, [])
  },

  saveRules(rules: Rule[]): boolean {
    return storage.setItem(STORAGE_KEYS.RULES, rules)
  },

  // Clear all data
  clearAll(): boolean {
    const success = [
      storage.removeItem(STORAGE_KEYS.COLUMNS),
      storage.removeItem(STORAGE_KEYS.RULES),
      storage.removeItem(STORAGE_KEYS.INITIALIZED),
    ].every(Boolean)

    return success
  },

  // Export data
  exportData(): string {
    const data = {
      columns: this.loadColumns(),
      rules: this.loadRules(),
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }
    return JSON.stringify(data, null, 2)
  },

  // Import data
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)

      // Validate data structure
      if (!data.columns || !Array.isArray(data.columns)) {
        throw new Error("Invalid data format: missing or invalid columns")
      }

      if (!data.rules || !Array.isArray(data.rules)) {
        throw new Error("Invalid data format: missing or invalid rules")
      }

      // Save imported data
      const columnsSuccess = this.saveColumns(data.columns)
      const rulesSuccess = this.saveRules(data.rules)

      return columnsSuccess && rulesSuccess
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  },
}
