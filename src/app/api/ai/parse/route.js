import { NextResponse } from "next/server";
import { parseNaturalLanguage } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import {
  DEMO_QUOTA_EXHAUSTED_MESSAGE,
  demoUserErrorResponse,
  getOrCreateDemoUser,
} from "@/lib/demo-user-server";

const DEMO_QUOTA_EXHAUSTED_CODE = "DEMO_QUOTA_EXHAUSTED";

function quotaExhaustedError() {
  const error = new Error(DEMO_QUOTA_EXHAUSTED_MESSAGE);
  error.code = DEMO_QUOTA_EXHAUSTED_CODE;
  return error;
}

async function createParsedRecord(tx, result, demoUserId) {
  if (result.type === "task") {
    return tx.task.create({
      data: {
        demoUserId,
        title: result.title,
        description: result.description || "",
        priority: result.priority || "normal",
        category: result.category || "Genel",
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
      },
    });
  }

  if (result.type === "event") {
    return tx.event.create({
      data: {
        demoUserId,
        title: result.title,
        description: result.description || "",
        category: result.category || "Genel",
        startDate: result.startDate ? new Date(result.startDate) : new Date(),
      },
    });
  }

  if (result.type === "note") {
    return tx.note.create({
      data: {
        demoUserId,
        title: result.title,
        content: result.description || "",
        category: result.category || "Genel",
      },
    });
  }

  return null;
}

export async function POST(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);
    const { text } = await request.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Metin alani bos olamaz." },
        { status: 400 }
      );
    }

    if (demoUser.aiQuota <= 0) {
      return NextResponse.json(
        { error: DEMO_QUOTA_EXHAUSTED_MESSAGE },
        { status: 403 }
      );
    }

    const localReferenceTime = new Date();
    const result = await parseNaturalLanguage(text, localReferenceTime);

    if (!["task", "event", "note"].includes(result.type)) {
      return NextResponse.json(
        { error: "Metin kategorize edilemedi (task, event veya note)." },
        { status: 400 }
      );
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const quotaUpdate = await tx.demoUser.updateMany({
        where: {
          id: demoUser.id,
          aiQuota: { gt: 0 },
        },
        data: {
          aiQuota: { decrement: 1 },
        },
      });

      if (quotaUpdate.count === 0) {
        throw quotaExhaustedError();
      }

      const savedRecord = await createParsedRecord(tx, result, demoUser.id);
      const updatedDemoUser = await tx.demoUser.findUnique({
        where: { id: demoUser.id },
        select: { id: true, aiQuota: true },
      });

      return { savedRecord, demoUser: updatedDemoUser };
    });

    return NextResponse.json({
      message: "Metin basariyla analiz edildi ve kaydedildi",
      result,
      savedRecord: transactionResult.savedRecord,
      demoUser: transactionResult.demoUser,
    });
  } catch (error) {
    console.error("Parse Error:", error);

    if (error.status) {
      return demoUserErrorResponse(error);
    }

    if (error.code === DEMO_QUOTA_EXHAUSTED_CODE) {
      return NextResponse.json(
        { error: DEMO_QUOTA_EXHAUSTED_MESSAGE },
        { status: 403 }
      );
    }

    if (error.status === 429 || error.name === "RateLimitError") {
      return NextResponse.json(
        { error: "API limitine takildik. Lutfen biraz bekleyip tekrar deneyin.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Islem su an gerceklestirilemiyor, lutfen tekrar deneyin" },
      { status: 500 }
    );
  }
}
