import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_SIZE = 4 * 1024 * 1024;

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { associationId: auth.association.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file.name !== "string" || !file.name.trim()) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Files must be 4 MB or smaller" },
      { status: 400 }
    );
  }

  const originalName = file.name.trim();

  const extMatch = originalName.match(/\.([a-zA-Z0-9]{1,10})$/);
  const safeExt = extMatch ? `.${extMatch[1].toLowerCase()}` : "";
  const storedName = `${randomUUID()}${safeExt}`;

  const bytes = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    const blob = await put(storedName, bytes, {
      access: "public",
      addRandomSuffix: false,
    });
    url = blob.url;
  } catch {
    return NextResponse.json(
      { error: "Upload failed — storage is not configured" },
      { status: 500 }
    );
  }

  const document = await prisma.document.create({
    data: {
      associationId: auth.association.id,
      name: originalName,
      storedName,
      url,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    },
  });

  return NextResponse.json(
    { id: document.id, name: document.name },
    { status: 201 }
  );
}
