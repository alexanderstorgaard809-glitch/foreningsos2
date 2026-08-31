import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, associationId: auth.association.id },
  });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let bytes: Buffer;
  try {
    const blobRes = await fetch(document.url);
    if (!blobRes.ok) throw new Error();
    bytes = Buffer.from(await blobRes.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: "File is missing in storage" },
      { status: 404 }
    );
  }

  const inline =
    document.mimeType === "application/pdf" ||
    (document.mimeType.startsWith("image/") &&
      document.mimeType !== "image/svg+xml");

  const asciiName = document.name
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");
  const utf8Name = encodeURIComponent(document.name);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": document.mimeType || "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
      "Content-Length": String(bytes.length),
      "Content-Security-Policy": "sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
