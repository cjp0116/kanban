import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = await params
    const body = await request.json()

    await db.updateColumn(columnId, {
      title: body.title,
      color: body.color,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating column:", error)
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { columnId: string } }) {
  try {
    const { columnId } = await params

    await db.deleteColumn(columnId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting column:", error)
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 })
  }
}
