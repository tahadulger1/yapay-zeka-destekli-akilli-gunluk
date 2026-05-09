import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function PUT(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const body = await request.json();
    const { title, description, location, startDate, endDate, category } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (category !== undefined) updateData.category = category;

    const updateResult = await prisma.event.updateMany({
      where: { id, demoUserId: demoUser.id },
      data: updateData,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Etkinlik bulunamadi" }, { status: 404 });
    }

    const event = await prisma.event.findFirst({
      where: { id, demoUserId: demoUser.id },
    });

    return NextResponse.json({ message: "Etkinlik guncellendi", event });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Etkinlik guncellenirken hata olustu" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const deleteResult = await prisma.event.deleteMany({
      where: { id, demoUserId: demoUser.id },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Etkinlik bulunamadi" }, { status: 404 });
    }

    return NextResponse.json({ message: "Etkinlik silindi" });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Etkinlik silinirken hata olustu" }, { status: 500 });
  }
}
