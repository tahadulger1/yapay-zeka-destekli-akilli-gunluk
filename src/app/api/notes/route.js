import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function GET(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const notes = await prisma.note.findMany({
      where: { demoUserId: demoUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json({ error: "Notlar getirilirken hata olustu." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const body = await request.json();
    const { title, content, category } = body;

    if (!title) {
      return NextResponse.json({ error: "Baslik zorunludur." }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        demoUserId: demoUser.id,
        title,
        content: content || "",
        category: category || "Genel",
      },
    });

    return NextResponse.json({ message: "Not olusturuldu", note }, { status: 201 });
  } catch (error) {
    if (error.status) return demoUserErrorResponse(error);
    return NextResponse.json(
      { error: "Not olusturulurken hata olustu", details: error.message },
      { status: 500 }
    );
  }
}
