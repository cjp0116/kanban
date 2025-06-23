import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const { boardId } = await params
    const data = await db.getBoardWithData(boardId)
    console.log(data, 'board data')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json({ error: "Failed to fetch board" }, { status: 500 })
  }
}
