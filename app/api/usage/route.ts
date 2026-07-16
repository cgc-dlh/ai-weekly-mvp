import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUsageStatus } from "@/lib/usage";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          used: 0,
          limit: 3,
          remaining: 3,
          percentage: 0,
          isLimitReached: false,
          isAnonymous: true,
        },
        { status: 200 }
      );
    }

    const status = await getUsageStatus(session.user.id);
    return NextResponse.json({
      ...status,
      isAnonymous: false,
    });
  } catch (error) {
    console.error("Get usage error:", error);
    return NextResponse.json(
      { error: "获取用量失败" },
      { status: 500 }
    );
  }
}
