"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import Column from "./column"
import TaskDetailSidebar from "./task-detail-sidebar"
import AutomationRules from "./automation-rules"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Task, Column as ColumnType, Rule } from "@/types/kanban"
import { apiClient } from "@/lib/api-client"

// Default board ID from our seed data
const DEFAULT_BOARD_ID = "550e8400-e29b-41d4-a716-446655440001"

export default function KanbanBoard() {
  const { toast } = useToast()
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [rules, setRules] = useState<Rule[]>([])
  const [activeTab, setActiveTab] = useState("board")
  const [isLoading, setIsLoading] = useState(true)
  const [boardId] = useState(DEFAULT_BOARD_ID)

  // Load data from database
  const loadBoardData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Load board with columns and tasks
      const boardData = await apiClient.getBoard(boardId)
      setColumns(boardData.columns)

      // Load automation rules
      const rulesData = await apiClient.getRules(boardId)
      setRules(rulesData)
    } catch (error) {
      console.error("Error loading board data:", error)
      toast({
        title: "Error loading data",
        description: "Failed to load board data from database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [boardId, toast])

  // Initial data load
  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  // Process automation rules (simplified for now)
  useEffect(() => {
    if (rules.length === 0 || isLoading) return
    // Automation logic would go here - for now we'll keep it simple
    // In a real app, this might be handled by a background job
  }, [columns, rules, isLoading])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    try {
      // Optimistic update
      const sourceColumn = columns.find((col) => col.id === source.droppableId)
      const destColumn = columns.find((col) => col.id === destination.droppableId)

      if (!sourceColumn || !destColumn) return

      const newColumns = [...columns]
      const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId)
      const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId)

      const task = sourceColumn.tasks.find((t) => t.id === draggableId)
      if (!task) return

      // Remove from source
      newColumns[sourceColIndex] = {
        ...sourceColumn,
        tasks: sourceColumn.tasks.filter((t) => t.id !== draggableId),
      }

      // Add to destination
      const updatedTask = { ...task, status: destColumn.title }
      newColumns[destColIndex] = {
        ...destColumn,
        tasks: [
          ...destColumn.tasks.slice(0, destination.index),
          updatedTask,
          ...destColumn.tasks.slice(destination.index),
        ],
      }

      setColumns(newColumns)

      // Update in database
      await apiClient.moveTask(draggableId, destination.droppableId, destination.index)

      // Update selected task if it's the one being moved
      if (selectedTask && selectedTask.id === draggableId) {
        setSelectedTask(updatedTask)
      }

      toast({
        title: "Task moved",
        description: `"${task.title}" moved to ${destColumn.title}`,
      })
    } catch (error) {
      console.error("Error moving task:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
      // Reload data to sync with database
      loadBoardData()
    }
  }

  const addTask = async (columnId: string, task: Omit<Task, "id" | "createdAt">) => {
    try {
      const newTask = await apiClient.createTask({
        title: task.title,
        description: task.description,
        columnId,
        boardId,
        dueDate: task.dueDate,
      })

      // Update local state
      const newColumns = columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, newTask].filter((task, index, self) =>
              self.findIndex(t => t.id === task.id) === index
            ),
          }
        }
        return column
      })
      setColumns(newColumns)

      toast({
        title: "Task created",
        description: `"${task.title}" added to ${columns.find((col) => col.id === columnId)?.title}`,
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (updatedTask: Task) => {
    try {
      await apiClient.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        subtasks: updatedTask.subtasks,
        customFields: updatedTask.customFields,
      })

      // Refetch the task to get updated data with real UUIDs
      const boardData = await apiClient.getBoard(boardId)
      const updatedTaskFromServer = boardData.columns
        .flatMap((col: { tasks: Task[] }) => col.tasks)
        .find((task: Task) => task.id === updatedTask.id)

      if (updatedTaskFromServer) {
        // Update local state with the server data
        const newColumns = columns.map((column) => {
          return {
            ...column,
            tasks: column.tasks
              .filter((task, index, self) =>
                self.findIndex(t => t.id === task.id) === index
              )
              .map((task) => (task.id === updatedTask.id ? updatedTaskFromServer : task)),
          }
        })
        setColumns(newColumns)
        setSelectedTask(updatedTaskFromServer)
      }
      // else {
      //   // Fallback to the original approach if refetch fails
      //   const newColumns = columns.map((column) => {
      //     return {
      //       ...column,
      //       tasks: column.tasks
      //         .filter((task, index, self) =>
      //           self.findIndex(t => t.id === task.id) === index
      //         )
      //         .map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      //     }
      //   })
      //   setColumns(newColumns)
      //   setSelectedTask(updatedTask)
      // }

      toast({
        title: "Task updated",
        description: `"${updatedTask.title}" has been updated`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId)

      // Update local state
      const newColumns = columns.map((column) => {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }
      })
      setColumns(newColumns)
      setSelectedTask(null)

      toast({
        title: "Task deleted",
        description: "The task has been deleted",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const duplicateTask = async (task: Task, columnId?: string) => {
    const targetColumnId = columnId || columns.find((col) => col.tasks.some((t) => t.id === task.id))?.id

    if (targetColumnId) {
      const duplicatedTask = {
        title: `${task.title} (Copy)`,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        subtasks: task.subtasks,
        customFields: task.customFields,
      }

      await addTask(targetColumnId, duplicatedTask)
    }
  }

  const addColumn = async () => {
    if (!newColumnTitle.trim()) {
      toast({
        title: "Error",
        description: "Column title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const newColumn = await apiClient.createColumn({
        title: newColumnTitle,
        boardId,
      })

      setColumns([...columns, newColumn])
      setNewColumnTitle("")
      setIsAddingColumn(false)

      toast({
        title: "Column added",
        description: `"${newColumnTitle}" column has been added`,
      })
    } catch (error) {
      console.error("Error creating column:", error)
      toast({
        title: "Error",
        description: "Failed to create column. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateColumn = async (columnId: string, updates: Partial<ColumnType>) => {
    try {
      await apiClient.updateColumn(columnId, updates)

      // Update local state
      const newColumns = columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column))
      setColumns(newColumns)
    } catch (error) {
      console.error("Error updating column:", error)
      toast({
        title: "Error",
        description: "Failed to update column. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteColumn = async (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (column && column.tasks.length > 0) {
      toast({
        title: "Cannot delete column",
        description: "Please move or delete all tasks in this column first",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.deleteColumn(columnId)

      setColumns(columns.filter((col) => col.id !== columnId))
      toast({
        title: "Column deleted",
        description: `"${column?.title}" column has been deleted`,
      })
    } catch (error) {
      console.error("Error deleting column:", error)
      toast({
        title: "Error",
        description: "Failed to delete column. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addRule = async (rule: Omit<Rule, "id">) => {
    try {
      const newRule = await apiClient.createRule(boardId, rule)
      setRules([...rules, newRule])

      toast({
        title: "Rule created",
        description: `"${rule.name}" has been added`,
      })
    } catch (error) {
      console.error("Error creating rule:", error)
      toast({
        title: "Error",
        description: "Failed to create rule. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateRule = async (ruleId: string, updates: Partial<Rule>) => {
    try {
      await apiClient.updateRule(ruleId, updates)

      const newRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
      setRules(newRules)
    } catch (error) {
      console.error("Error updating rule:", error)
      toast({
        title: "Error",
        description: "Failed to update rule. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteRule = async (ruleId: string) => {
    try {
      await apiClient.deleteRule(ruleId)

      setRules(rules.filter((rule) => rule.id !== ruleId))
      toast({
        title: "Rule deleted",
        description: "The automation rule has been deleted",
      })
    } catch (error) {
      console.error("Error deleting rule:", error)
      toast({
        title: "Error",
        description: "Failed to delete rule. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your kanban board...</p>
        </div>
      </div>
    )
  }

  // Board content for the "board" tab
  const renderBoardContent = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        {columns.map((column) => (
          <Column
            key={`column-${column.id}`}
            column={column}
            onAddTask={addTask}
            onTaskClick={setSelectedTask}
            onDeleteColumn={() => deleteColumn(column.id)}
            onUpdateColumn={updateColumn}
            onDuplicateTask={duplicateTask}
          />
        ))}

        <div className="shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border dark:border-gray-700">
              <Label htmlFor="column-title" className="dark:text-gray-200">
                Column Title
              </Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addColumn}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingColumn(false)}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-2 w-full h-12 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  )

  // Automation content for the "automation" tab
  const renderAutomationContent = () => (
    <div className="max-w-4xl mx-auto">
      <AutomationRules
        rules={rules}
        columns={columns}
        onAddRule={addRule}
        onUpdateRule={updateRule}
        onDeleteRule={deleteRule}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Kanban Board</h1>
          <ThemeToggle />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-lg grid-cols-2">
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            {renderBoardContent()}
          </TabsContent>

          <TabsContent value="automation" className="mt-4">
            {renderAutomationContent()}
          </TabsContent>
        </Tabs>
      </header>

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          columns={columns}
        />
      )}
    </div>
  )
}
