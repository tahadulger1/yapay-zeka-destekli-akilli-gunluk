import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function PUT(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const body = await request.json();
    const { status, title, description, category, priority, dueDate } = body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updateResult = await prisma.task.updateMany({
      where: { id, demoUserId: demoUser.id },
      data: updateData,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Gorev bulunamadi" }, { status: 404 });
    }

    const task = await prisma.task.findFirst({
      where: { id, demoUserId: demoUser.id },
    });

    return NextResponse.json({ message: "Gorev guncellendi", task });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Gorev guncellenirken hata olustu" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const deleteResult = await prisma.task.deleteMany({
      where: { id, demoUserId: demoUser.id },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Gorev bulunamadi" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gorev silindi" });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Gorev silinirken hata olustu" }, { status: 500 });
  }
}
