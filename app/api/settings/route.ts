import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const associationName =
    typeof body.associationName === "string"
      ? body.associationName.trim()
      : "";

  if (!associationName) {
    return NextResponse.json(
      { error: "Association name is required" },
      { status: 400 }
    );
  }
  if (associationName.length > 100) {
    return NextResponse.json(
      { error: "Association name must be 100 characters or fewer" },
      { status: 400 }
    );
  }

  const address = typeof body.address === "string" ? body.address.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const contactEmail =
    typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";

  if (contactEmail && !emailPattern.test(contactEmail)) {
    return NextResponse.json(
      { error: "Contact email is not a valid email address" },
      { status: 400 }
    );
  }

  const association = await prisma.association.update({
    where: { id: auth.association.id },
    data: {
      name: associationName,
      address: address || null,
      city: city || null,
      contactEmail: contactEmail || null,
    },
  });

  return NextResponse.json(association);
}
