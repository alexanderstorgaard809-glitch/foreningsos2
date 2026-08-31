import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const categories = ["plumbing", "electricity", "common", "other"];
const priorities = ["low", "medium", "urgent"];
const statuses = ["new", "in_progress", "done"];

export async function PATCH(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    data.description =
      typeof body.description === "string" ? body.description.trim() : "";
  }
  if (body.category !== undefined) {
    data.category = categories.includes(body.category) ? body.category : "other";
  }
  if (body.reporter !== undefined) {
    data.reporter =
      typeof body.reporter === "string" && body.reporter.trim()
        ? body.reporter.trim()
        : null;
  }
  if (body.priority !== undefined) {
    data.priority = priorities.includes(body.priority)
      ? body.priority
      : "medium";
  }
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
    data.completedAt = body.status === "done" ? new Date() : null;
  }

  const maintenanceRequest = await prisma.maintenanceRequest.update({
    where: { id, associationId: auth.association.id },
    data,
  });

  return NextResponse.json(maintenanceRequest);
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.maintenanceRequest.delete({
    where: { id, associationId: auth.association.id },
  });
  return NextResponse.json({ ok: true });
}
