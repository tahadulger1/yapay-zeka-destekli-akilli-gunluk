import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function PUT(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const body = await request.json();
    const { title, content, category } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;

    const updateResult = await prisma.note.updateMany({
      where: { id, demoUserId: demoUser.id },
      data: updateData,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Not bulunamadi" }, { status: 404 });
    }

    const note = await prisma.note.findFirst({
      where: { id, demoUserId: demoUser.id },
    });

    return NextResponse.json({ message: "Not guncellendi", note });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Not guncellenirken hata olustu" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { id } = await params;
    const deleteResult = await prisma.note.deleteMany({
      where: { id, demoUserId: demoUser.id },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Not bulunamadi" }, { status: 404 });
    }

    return NextResponse.json({ message: "Not silindi" });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Not silinirken hata olustu" }, { status: 500 });
  }
}
