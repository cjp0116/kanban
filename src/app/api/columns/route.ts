import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const column = await db.createColumn({
      title: body.title,
      color: body.color,
      boardId: body.boardId,
    })

    return NextResponse.json(column)
  } catch (error) {
    console.error("Error creating column:", error)
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 })
  }
}
