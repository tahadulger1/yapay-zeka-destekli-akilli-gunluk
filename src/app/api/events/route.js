import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function GET(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const events = await prisma.event.findMany({
      where: { demoUserId: demoUser.id },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Etkinlikler getirilirken hata olustu." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const body = await request.json();
    const { title, description, location, startDate, endDate, category } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "Baslik ve baslama tarihi zorunludur." }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        demoUserId: demoUser.id,
        title,
        description: description || "",
        location: location || "",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        category: category || "Genel",
      },
    });

    return NextResponse.json({ message: "Etkinlik olusturuldu", event }, { status: 201 });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json(
      { error: "Etkinlik olusturulurken hata olustu", details: error.message },
      { status: 500 }
    );
  }
}
