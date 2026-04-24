import { NextRequest, NextResponse } from "next/server";
import { getComplianceReport, UpstreamPhillyError } from "@/lib/api/philly/client";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required", code: "MISSING_ADDRESS" },
      { status: 400 }
    );
  }

  try {
    const report = await getComplianceReport(address);
    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof UpstreamPhillyError) {
      console.error("Philly upstream failed:", error.message);
      return NextResponse.json(
        {
          error:
            "Philadelphia's city data service is temporarily unavailable. Try again in a minute.",
          code: "UPSTREAM_UNAVAILABLE",
        },
        { status: 503 }
      );
    }
    console.error("Compliance check failed:", error);
    return NextResponse.json(
      { error: "Failed to run compliance check", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
