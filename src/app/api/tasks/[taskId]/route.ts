import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = await params
    const body = await request.json()

    // Handle different update types
    if (body.type === "move") {
      await db.moveTask(taskId, body.columnId, body.position)
    } else {
      await db.updateTask(taskId, {
        title: body.title,
        description: body.description,
        status: body.status,
        dueDate: body.dueDate,
        columnId: body.columnId,
      })
    }

    // Handle subtasks updates
    if (body.subtasks) {
      for (const subtask of body.subtasks) {
        if (subtask._deleted) {
          // Only delete if the ID is a valid UUID (exists in database)
          const isValidUUID = subtask.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subtask.id)
          if (isValidUUID) {
            await db.deleteSubtask(subtask.id)
          }
        } else {
          await db.upsertSubtask({
            id: subtask.id,
            title: subtask.title,
            completed: subtask.completed,
            taskId: taskId,
            position: subtask.position || 0,
          })
        }
      }
    }

    // Handle custom fields updates
    if (body.customFields) {
      for (const field of body.customFields) {
        if (field._deleted) {
          // Only delete if the ID is a valid UUID (exists in database)
          const isValidUUID = field.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(field.id)
          if (isValidUUID) {
            await db.deleteCustomField(field.id)
          }
        } else {
          await db.upsertCustomField({
            id: field.id,
            name: field.name,
            value: field.value,
            taskId: taskId,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = await params

    await db.deleteTask(taskId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
