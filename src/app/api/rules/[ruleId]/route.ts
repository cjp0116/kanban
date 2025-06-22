import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { ruleId: string } }) {
  try {
    const { ruleId } = await params
    const body = await request.json()

    await db.updateAutomationRule(ruleId, body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating rule:", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { ruleId: string } }) {
  try {
    const { ruleId } = await params

    await db.deleteAutomationRule(ruleId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting rule:", error)
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
