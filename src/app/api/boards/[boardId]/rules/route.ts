import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const { boardId } = await params
    const rules = await db.getAutomationRules(boardId)

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { boardId: string } }) {
  try {
    const { boardId } = await params
    const body = await request.json()

    const rule = await db.createAutomationRule({
      name: body.name,
      enabled: body.enabled,
      conditionType: body.condition.type,
      conditionOperator: body.condition.operator,
      conditionField: body.condition.field,
      conditionValue: body.condition.value,
      actionType: body.action.type,
      actionTargetColumnId: body.action.targetColumnId,
      boardId,
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error creating rule:", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}
