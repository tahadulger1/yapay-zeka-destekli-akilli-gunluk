import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function GET(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const tasks = await prisma.task.findMany({
      where: { demoUserId: demoUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Gorevler getirilirken hata olustu." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const body = await request.json();
    const { title, description, category, priority, status, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Baslik zorunludur." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        demoUserId: demoUser.id,
        title,
        description,
        category: category || "Genel",
        priority: priority || "normal",
        status: status || "pending",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ message: "Gorev olusturuldu", task }, { status: 201 });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json(
      { error: "Gorev olusturulurken hata olustu", details: error.message },
      { status: 500 }
    );
  }
}
