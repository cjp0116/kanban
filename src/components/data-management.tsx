"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useToast } from "@/hooks/use-toast"
import { kanbanStorage } from "@/lib/storage"

interface DataManagementProps {
  onDataImported: () => void
}

export default function DataManagement({ onDataImported }: DataManagementProps) {
  const { toast } = useToast()
  const [importData, setImportData] = useState("")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const handleExport = () => {
    try {
      const data = kanbanStorage.exportData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `kanban-board-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Data exported",
        description: "Your kanban board data has been downloaded",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste your JSON data to import",
        variant: "destructive",
      })
      return
    }

    const success = kanbanStorage.importData(importData)

    if (success) {
      toast({
        title: "Data imported",
        description: "Your kanban board data has been imported successfully",
      })
      setImportData("")
      setIsImportDialogOpen(false)
      onDataImported()
    } else {
      toast({
        title: "Import failed",
        description: "Failed to import data. Please check the format and try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  const handleClearAll = () => {
    const success = kanbanStorage.clearAll()

    if (success) {
      toast({
        title: "Data cleared",
        description: "All kanban board data has been cleared. The page will reload with default data.",
      })
      // Reload the page to reinitialize with default data
      setTimeout(() => window.location.reload(), 1000)
    } else {
      toast({
        title: "Clear failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium dark:text-gray-200">Data Management</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm dark:text-gray-300">Export Data</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Download your kanban board data as a JSON file</p>
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Import */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm dark:text-gray-300">Import Data</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Import kanban board data from a JSON file</p>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-200">Import Data</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Import your kanban board data from a JSON file or paste the JSON content directly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-import" className="dark:text-gray-300">
                    Upload JSON File
                  </Label>
                  <Input
                    id="file-import"
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="space-y-2">
                  <Label htmlFor="json-content" className="dark:text-gray-300">
                    Or Paste JSON Content
                  </Label>
                  <Textarea
                    id="json-content"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your JSON data here..."
                    rows={10}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-sm"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(false)}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  Cancel
                </Button>
                <Button onClick={handleImport}>Import Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clear All */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm dark:text-gray-300">Reset Board</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Clear all data and reset to default state</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-gray-200 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="dark:text-gray-400">
                  This action cannot be undone. This will permanently delete all your tasks, columns, and automation
                  rules, and reset the board to its default state.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>Yes, clear everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">Data Persistence</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Your kanban board data is automatically saved to your browser's local storage. Data will persist across
              browser sessions but may be lost if you clear your browser data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
