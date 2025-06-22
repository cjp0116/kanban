import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const task = await db.createTask({
      title: body.title,
      description: body.description,
      columnId: body.columnId,
      boardId: body.boardId,
      dueDate: body.dueDate,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
