import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  createDraft,
  deleteRecipient,
  getDocument,
  getDocumentUrl,
  buildPrefill,
  RLSI_TEMPLATE_ID,
  RLSI_RECIPIENT_IDS,
  RLSI_FIELDS,
} from "@/lib/documenso";
import { sendSlackNotification } from "@/lib/slack";
import { sendRLSIRequest } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return Response.json({ error: "applicationId required" }, { status: 400 });
    }

    // Get the application from Supabase
    const { data: app, error: appError } = await supabaseAdmin
      .from("rental_license_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return Response.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Build owner name + address
    const ownerName = [app.owner_first_name, app.owner_last_name]
      .filter(Boolean)
      .join(" ");
    const ownerEmail = app.owner_email || "";

    // Parse mailing address into address line + city/state/zip
    const mailingParts = (app.owner_mailing_address || "").split(",").map((s: string) => s.trim());
    const mailingAddress = mailingParts[0] || "";
    const cityStateZip = mailingParts.slice(1).join(", ") || "";

    // Build prefill values
    const fieldValues: Record<string, string> = {
      owner_1_name: ownerName,
      owner_1_mailing_address: mailingAddress,
      owner_1_city_state_zip: cityStateZip,
      total_units: String(app.unit_count || 1),
      number_of_units: String(app.unit_count || 1),
    };

    // Check compliance report for OPA owner_2
    const compliance = app.compliance_report;
    if (compliance?.opaData?.owner_2) {
      const owner2Raw = compliance.opaData.owner_2;
      // Title case the OPA name
      const owner2 = owner2Raw
        .toLowerCase()
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      fieldValues.owner_2_name = owner2;
    }

    const prefillFields = buildPrefill(fieldValues, RLSI_FIELDS);

    // Build recipients
    const recipients = [
      {
        id: RLSI_RECIPIENT_IDS.owner_1,
        email: ownerEmail,
        name: ownerName,
      },
    ];

    // Only include owner 2 if we have their info
    // (for now, just the name from OPA — no email)

    const title = `${app.property_address} - Rental License Supplemental Information`;

    // Create draft
    const result = await createDraft(
      RLSI_TEMPLATE_ID,
      recipients,
      prefillFields,
      title
    );
    const docId = result.id;
    const docUrl = getDocumentUrl(docId);

    // Clean up placeholder recipients
    const doc = await getDocument(docId);
    const placeholders = (doc.recipients || []).filter(
      (r: { email: string }) => r.email.includes("@placeholder.documenso.com")
    );
    let deletedCount = 0;
    for (const pr of placeholders) {
      const deleted = await deleteRecipient(pr.id);
      if (deleted) deletedCount++;
    }

    // Send signing request email to owner
    if (ownerEmail) {
      await sendRLSIRequest({
        to: ownerEmail,
        ownerName,
        propertyAddress: app.property_address,
        documensoUrl: docUrl,
      });
    }

    // Add note to application
    await supabaseAdmin.from("application_notes").insert({
      application_id: applicationId,
      author: "System",
      content: `RLSI form generated and sent to ${ownerName} (${ownerEmail}). [View in Documenso](${docUrl})`,
      is_system: true,
    });

    // Slack notification
    await sendSlackNotification({
      title: "RLSI Form Generated",
      propertyAddress: app.property_address,
      ownerName,
      ownerEmail,
      details: `RLSI draft created for ${ownerName}.\n<${docUrl}|Open in Documenso>`,
      link: docUrl,
    });

    return Response.json({
      success: true,
      documentId: docId,
      url: docUrl,
      deletedPlaceholders: deletedCount,
    });
  } catch (err) {
    console.error("Generate RLSI error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
