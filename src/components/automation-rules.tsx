"use client"

import { useState } from "react"
import { Plus, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Rule, Column } from "@/types/kanban"
import { generateId } from "@/lib/utils"

interface AutomationRulesProps {
  rules: Rule[]
  columns: Column[]
  onAddRule: (rule: Rule) => void
  onUpdateRule: (ruleId: string, updates: Partial<Rule>) => void
  onDeleteRule: (ruleId: string) => void
}

export default function AutomationRules({
  rules,
  columns,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: AutomationRulesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newRule, setNewRule] = useState<Rule>({
    id: `rule-${generateId()}`,
    name: "",
    condition: {
      type: "due-date",
      operator: "is-overdue",
    },
    action: {
      type: "move-to-column",
      targetColumnId: columns[0]?.id || "",
    },
    enabled: true,
  })

  const handleAddRule = () => {
    if (!newRule.name.trim()) return

    onAddRule(newRule)
    setNewRule({
      id: `rule-${generateId()}`,
      name: "",
      condition: {
        type: "due-date",
        operator: "is-overdue",
      },
      action: {
        type: "move-to-column",
        targetColumnId: columns[0]?.id || "",
      },
      enabled: true,
    })
    setIsOpen(false)
  }

  const toggleRuleEnabled = (ruleId: string, enabled: boolean) => {
    onUpdateRule(ruleId, { enabled })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2 dark:text-gray-300" />
          <h3 className="text-lg font-medium dark:text-gray-200">Automation Rules</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-200">Create Automation Rule</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Create a rule to automatically move tasks based on conditions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="dark:text-gray-300">
                  Rule Name
                </Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Move overdue tasks to Blocked"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                />
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-2">
                <Label className="dark:text-gray-300">When (Condition)</Label>
                <Select
                  value={newRule.condition.type}
                  onValueChange={(value: "due-date" | "subtasks-completed" | "custom-field") =>
                    setNewRule({
                      ...newRule,
                      condition: {
                        ...newRule.condition,
                        type: value,
                        operator:
                          value === "due-date"
                            ? "is-overdue"
                            : value === "subtasks-completed"
                              ? "all-completed"
                              : "equals",
                      },
                    })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="due-date">Due Date</SelectItem>
                    <SelectItem value="subtasks-completed">Subtasks</SelectItem>
                    <SelectItem value="custom-field">Custom Field</SelectItem>
                  </SelectContent>
                </Select>

                {newRule.condition.type === "due-date" && (
                  <Select
                    value={newRule.condition.operator}
                    onValueChange={(value: "is-overdue") =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition, operator: value },
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="is-overdue">Is Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {newRule.condition.type === "subtasks-completed" && (
                  <Select
                    value={newRule.condition.operator}
                    onValueChange={(value: "all-completed") =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition, operator: value },
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all-completed">All Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {newRule.condition.type === "custom-field" && (
                  <>
                    <Input
                      placeholder="Field name"
                      value={newRule.condition.field || ""}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, field: e.target.value },
                        })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                    <Select
                      value={newRule.condition.operator}
                      onValueChange={(value: "equals" | "not-equals" | "contains") =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, operator: value },
                        })
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not-equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={newRule.condition.value || ""}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          condition: { ...newRule.condition, value: e.target.value },
                        })
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </>
                )}
              </div>

              <Separator className="dark:bg-gray-700" />

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Then (Action)</Label>
                <Select
                  value={newRule.action.targetColumnId}
                  onValueChange={(value) =>
                    setNewRule({
                      ...newRule,
                      action: { ...newRule.action, targetColumnId: value },
                    })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <SelectValue placeholder="Move to column" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        Move to {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="dark:border-gray-600 dark:text-gray-200"
              >
                Cancel
              </Button>
              <Button onClick={handleAddRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No automation rules yet. Create one to automate your workflow.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700"
            >
              <div className="flex-1">
                <div className="font-medium dark:text-gray-200">{rule.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {rule.condition.type === "due-date" && "When task is overdue"}
                  {rule.condition.type === "subtasks-completed" && "When all subtasks are completed"}
                  {rule.condition.type === "custom-field" &&
                    `When ${rule.condition.field} ${rule.condition.operator} ${rule.condition.value}`}
                  {" → "}
                  Move to {columns.find((col) => col.id === rule.action.targetColumnId)?.title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRuleEnabled(rule.id, checked)}
                  aria-label={rule.enabled ? "Disable rule" : "Enable rule"}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => onDeleteRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
