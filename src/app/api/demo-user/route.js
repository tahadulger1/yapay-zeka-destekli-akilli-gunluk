import { NextResponse } from "next/server";
import { demoUserErrorResponse, getOrCreateDemoUser } from "@/lib/demo-user-server";

export async function GET(request) {
  try {
    const demoUser = await getOrCreateDemoUser(request);

    return NextResponse.json({
      demoUser: {
        id: demoUser.id,
        aiQuota: demoUser.aiQuota,
      },
    });
  } catch (error) {
    return demoUserErrorResponse(error);
  }
}
