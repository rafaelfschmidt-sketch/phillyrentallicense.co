import { NextRequest, NextResponse } from "next/server";
import { sendSlackNotification } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, propertyAddress, ownerName, ownerEmail, applicationId } = body;

    const dashboardLink = `${request.nextUrl.origin}/admin/rental-license-only`;

    switch (type) {
      case "onboarding_complete":
        await sendSlackNotification({
          title: "📋 Onboarding Form Submitted",
          propertyAddress,
          ownerName,
          ownerEmail,
          details: "Owner info, PHTIN status, and property details submitted. Client needs to provide PHTIN and upload documents next.",
          link: dashboardLink,
        });
        break;

      case "documents_complete":
        await sendSlackNotification({
          title: "✅ All Documents Submitted — Ready to Process",
          propertyAddress,
          ownerName,
          ownerEmail,
          details: "PHTIN provided, photo ID uploaded, and all documents submitted. *This application is ready for the team to start working on.*",
          link: dashboardLink,
        });
        break;

      case "phtin_stuck":
        await sendSlackNotification({
          title: "🚨 Owner Needs PHTIN Help",
          propertyAddress,
          ownerName,
          ownerEmail,
          details: "Owner indicated they don't have a PHTIN or are having trouble. May need a screen-sharing session.",
          link: dashboardLink,
        });
        break;

      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
