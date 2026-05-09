import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEMO_USER_HEADER = "x-demo-user-id";
export const DEMO_AI_QUOTA = 3;
export const DEMO_QUOTA_EXHAUSTED_MESSAGE = "Demo sorgu hakkınız doldu";

function normalizeDemoUserId(value) {
  const demoUserId = value?.trim();
  if (!demoUserId || demoUserId.length > 128) {
    return null;
  }

  return demoUserId;
}

export async function getOrCreateDemoUser(request, client = prisma) {
  const demoUserId = normalizeDemoUserId(request.headers.get(DEMO_USER_HEADER));

  if (!demoUserId) {
    const error = new Error("Demo kullanıcı kimliği eksik.");
    error.status = 400;
    throw error;
  }

  return client.demoUser.upsert({
    where: { id: demoUserId },
    update: {},
    create: { id: demoUserId, aiQuota: DEMO_AI_QUOTA },
  });
}

export function demoUserErrorResponse(error) {
  return NextResponse.json(
    { error: error.message || "Demo kullanıcı doğrulanamadı." },
    { status: error.status || 500 }
  );
}
