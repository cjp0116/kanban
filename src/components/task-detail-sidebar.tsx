"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Trash2, Plus, CheckSquare, Square, Edit, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, Column, Subtask, CustomField } from "@/types/kanban"
import { formatDate, generateId } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TaskDetailSidebarProps {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (task: Task) => void
  columns: Column[]
}

export default function TaskDetailSidebar({
  task,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
}: TaskDetailSidebarProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [newCustomFieldName, setNewCustomFieldName] = useState("")
  const [newCustomFieldValue, setNewCustomFieldValue] = useState("")
  const [isAddingCustomField, setIsAddingCustomField] = useState(false)

  // Sync editedTask with task prop when it changes (e.g., after server updates)
  useEffect(() => {
    setEditedTask({ ...task })
  }, [task])

  const handleTitleSave = () => {
    if (editedTask.title.trim()) {
      onUpdate(editedTask)
      setIsEditingTitle(false)
    }
  }

  const handleDescriptionSave = () => {
    onUpdate(editedTask)
    setIsEditingDescription(false)
  }

  const handleStatusChange = (status: string) => {
    const updatedTask = { ...editedTask, status }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedTask = {
      ...editedTask,
      dueDate: date ? date.toISOString() : null,
    }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    )

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `subtask-${generateId()}`,
      title: newSubtaskTitle,
      completed: false,
    }

    const updatedTask = {
      ...editedTask,
      subtasks: [...editedTask.subtasks, newSubtask],
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)
    setNewSubtaskTitle("")
    setIsAddingSubtask(false)
  }

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = editedTask.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, _deleted: true } : subtask
    )

    const updatedTask = { ...editedTask, subtasks: updatedSubtasks }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const addCustomField = () => {
    if (!newCustomFieldName.trim()) return

    const newField: CustomField = {
      id: `field-${generateId()}`,
      name: newCustomFieldName,
      value: newCustomFieldValue,
    }

    const updatedTask = {
      ...editedTask,
      customFields: [...editedTask.customFields, newField],
    }

    setEditedTask(updatedTask)
    onUpdate(updatedTask)
    setNewCustomFieldName("")
    setNewCustomFieldValue("")
    setIsAddingCustomField(false)
  }

  const updateCustomField = (fieldId: string, value: string) => {
    const updatedFields = editedTask.customFields.map((field) => (field.id === fieldId ? { ...field, value } : field))

    const updatedTask = { ...editedTask, customFields: updatedFields }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const deleteCustomField = (fieldId: string) => {
    const updatedFields = editedTask.customFields.map((field) =>
      field.id === fieldId ? { ...field, _deleted: true } : field
    )

    const updatedTask = { ...editedTask, customFields: updatedFields }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handleDeleteTask = () => {
    onDelete(task.id)
  }

  const handleDuplicateTask = () => {
    onDuplicate(task)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-lg border-l dark:border-gray-700 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-gray-200">Task Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle ? (
              <div className="space-y-2">
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleTitleSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingTitle(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium dark:text-gray-200">{editedTask.title}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsEditingTitle(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Status</label>
            <Select value={editedTask.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.title}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editedTask.dueDate ? formatDate(editedTask.dueDate) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                  onSelect={handleDueDateChange}
                  initialFocus
                  className="dark:bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              {!isEditingDescription && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={4}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingDescription(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md min-h-[60px]">
                {editedTask.description || "No description provided."}
              </div>
            )}
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingSubtask(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>

            {isAddingSubtask && (
              <div className="mb-3 space-y-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Subtask title"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addSubtask}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingSubtask(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedTask.subtasks.filter(subtask => !subtask._deleted).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No subtasks yet.</p>
              ) : (
                (() => {
                  const filteredSubtasks = editedTask.subtasks
                    .filter(subtask => !subtask._deleted)
                    .filter((subtask, index, self) =>
                      self.findIndex(s => s.id === subtask.id) === index
                    )

                  if (filteredSubtasks.length !== editedTask.subtasks.filter(subtask => !subtask._deleted).length) {
                    console.warn('Duplicate subtasks detected and filtered:', {
                      original: editedTask.subtasks.filter(subtask => !subtask._deleted).length,
                      filtered: filteredSubtasks.length,
                      duplicates: editedTask.subtasks.filter(subtask => !subtask._deleted).length - filteredSubtasks.length
                    })
                  }

                  return filteredSubtasks.map((subtask, index) => (
                    <div
                      key={`${subtask.id}-${index}`}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                    >
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-2"
                          onClick={() => toggleSubtask(subtask.id)}
                        >
                          {subtask.completed ? (
                            <CheckSquare className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                        <span
                          className={`text-sm ${subtask.completed ? "line-through text-gray-500 dark:text-gray-400" : "dark:text-gray-200"}`}
                        >
                          {subtask.title}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        onClick={() => deleteSubtask(subtask.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                })()
              )}
            </div>
          </div>

          <Separator className="dark:bg-gray-700" />

          {/* Custom Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Fields</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingCustomField(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>

            {isAddingCustomField && (
              <div className="mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={newCustomFieldName}
                    onChange={(e) => setNewCustomFieldName(e.target.value)}
                    placeholder="Field name"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                  <Input
                    value={newCustomFieldValue}
                    onChange={(e) => setNewCustomFieldValue(e.target.value)}
                    placeholder="Field value"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCustomField}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingCustomField(false)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {editedTask.customFields.filter(field => !field._deleted).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No custom fields yet.</p>
              ) : (
                (() => {
                  const filteredFields = editedTask.customFields
                    .filter(field => !field._deleted)
                    .filter((field, index, self) =>
                      self.findIndex(f => f.id === field.id) === index
                    )

                  if (filteredFields.length !== editedTask.customFields.filter(field => !field._deleted).length) {
                    console.warn('Duplicate custom fields detected and filtered:', {
                      original: editedTask.customFields.filter(field => !field._deleted).length,
                      filtered: filteredFields.length,
                      duplicates: editedTask.customFields.filter(field => !field._deleted).length - filteredFields.length
                    })
                  }

                  return filteredFields.map((field, index) => (
                    <div
                      key={`${field.id}-${index}`}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md"
                    >
                      <div className="grid grid-cols-2 gap-2 flex-1 mr-2">
                        <div className="text-sm font-medium dark:text-gray-200">{field.name}:</div>
                        <Input
                          value={field.value || ""}
                          onChange={(e) => updateCustomField(field.id, e.target.value)}
                          className="h-7 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        onClick={() => deleteCustomField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                })()
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t dark:border-gray-700 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 dark:border-gray-600 dark:text-gray-200"
          onClick={handleDuplicateTask}
        >
          <Copy className="h-4 w-4 mr-2" /> Duplicate
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-gray-200">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-400">
                This action cannot be undone. This will permanently delete the task and all its subtasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
