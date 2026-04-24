import { NextRequest, NextResponse } from "next/server";
import { searchOPAAddresses } from "@/lib/api/philly/client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchOPAAddresses(q);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Autocomplete failed:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
