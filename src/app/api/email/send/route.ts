import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  sendRentalLicenseFormRequest,
  sendPHTINReminder,
  sendStatusUpdate,
  sendRLSIRequest,
  sendLicenseComplete,
  sendOnboardingComplete,
  sendAbandonedCartRecovery,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, applicationId, ...params } = body;

    // Get application data if applicationId provided
    let app = null;
    if (applicationId) {
      const { data } = await supabaseAdmin
        .from("rental_license_applications")
        .select("*")
        .eq("id", applicationId)
        .single();
      app = data;
    }

    const ownerName = params.ownerName || (app ? `${app.owner_first_name || ""} ${app.owner_last_name || ""}`.trim() : "Property Owner");
    const ownerEmail = params.to || app?.owner_email;
    const propertyAddress = params.propertyAddress || app?.property_address || "";

    if (!ownerEmail) {
      return Response.json({ error: "No email address found" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "rental_license_form":
        result = await sendRentalLicenseFormRequest({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          intakeUrl: params.intakeUrl || (app?.service_type === "managed"
            ? "https://hubkey-hub.vercel.app/apply/rental-license/managed"
            : "https://hubkey-hub.vercel.app/apply/rental-license/intake"),
        });
        break;

      case "phtin_reminder":
        result = await sendPHTINReminder({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          phtinSetupUrl: params.phtinSetupUrl || "https://hubkey-hub.vercel.app/apply/rental-license/phtin-setup",
        });
        break;

      case "status_update":
        result = await sendStatusUpdate({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          stageName: params.stageName || "In Progress",
          message: params.message || "Your application is being processed.",
        });
        break;

      case "rlsi_request":
        result = await sendRLSIRequest({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          documensoUrl: params.documensoUrl || "",
        });
        break;

      case "license_complete":
        result = await sendLicenseComplete({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          licenseNumber: params.licenseNumber || "",
          expirationDate: params.expirationDate || "",
        });
        break;

      case "onboarding_complete":
        result = await sendOnboardingComplete({
          to: ownerEmail,
          ownerName,
          propertyAddress,
          applicationId: applicationId || "",
          hasPhtin: Boolean(params.hasPhtin ?? app?.has_phtin),
        });
        break;

      case "abandoned_cart":
        result = await sendAbandonedCartRecovery({
          to: ownerEmail,
          address: params.address || propertyAddress,
          checkoutUrl:
            params.checkoutUrl ||
            `${process.env.NEXT_PUBLIC_APPLY_URL || "https://apply.hubkey.co"}/apply/rental-license`,
        });
        break;

      default:
        return Response.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    // Log the email in application notes
    if (applicationId && result.success) {
      await supabaseAdmin.from("application_notes").insert({
        application_id: applicationId,
        author: "System",
        content: `Email sent to ${ownerEmail}: ${type.replace(/_/g, " ")}`,
        is_system: true,
      });
    }

    return Response.json(result);
  } catch (err) {
    console.error("Email API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
