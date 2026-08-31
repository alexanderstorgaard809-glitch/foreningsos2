import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const categories = ["plumbing", "electricity", "common", "other"];
const priorities = ["low", "medium", "urgent"];

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where: { associationId: auth.association.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      associationId: auth.association.id,
      title: body.title.trim(),
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      category: categories.includes(body.category) ? body.category : "other",
      priority: priorities.includes(body.priority) ? body.priority : "medium",
      reporter:
        typeof body.reporter === "string" && body.reporter.trim()
          ? body.reporter.trim()
          : null,
    },
  });

  return NextResponse.json(maintenanceRequest, { status: 201 });
}
