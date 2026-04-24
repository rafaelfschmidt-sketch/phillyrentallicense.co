import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getComplianceReport } from "@/lib/api/philly/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Resume token (if converting a draft)
      resumeToken,

      // Service type
      serviceType,

      // Property info
      propertyAddress,
      unitCount,
      unitDetails,
      yearBuilt,
      leadPaintRequired,
      isNewConstruction,

      // Owner info
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone,
      ownerDob,
      ownerMailingAddress,

      // Title / Entity
      titleType,
      companyName,
      ein,
      isSingleMemberLLC,
      isDisregardedEntity,
      ownerCount,
      partnerRelationship,
      owner2Name,
      owner2MailingAddress,

      // Tax & Compliance
      hasPhtin,
      phtin,
      hasCAL,
      calNumber,
      hasRentalLicense,
      rentalLicenseNumber,
      hasLeadPaintTest,
      hasLeadPaintCopy,

      // Property details
      bedBathDetails,
      propertyAccessNotes,
      unitsOccupied,
      tenantContactInfo,
      hasNaturalGas,
      hasPGWEnrollment,

      // Notes
      notes,

      // Optional: force a specific status (e.g., pending_payment for Stripe flow)
      forceStatus,
    } = body;

    // Validation
    if (!propertyAddress || !ownerEmail || !serviceType) {
      return Response.json(
        { error: "Property address, email, and service type are required" },
        { status: 400 }
      );
    }

    // Run compliance report
    let complianceReport = null;
    try {
      complianceReport = await getComplianceReport(propertyAddress);
    } catch {
      // Non-fatal — we'll proceed without it
    }

    // Determine initial status
    let status = forceStatus || "intake_complete";
    if (!forceStatus && (hasPhtin === "no" || hasPhtin === "not_sure")) {
      status = "awaiting_phtin";
    }

    // Calculate fees
    const isPayingClient = serviceType === "license_only" || serviceType === "leasing_only";
    const serviceFee = isPayingClient ? 50000 : 0; // $500 for non-managed
    const licenseFee = (unitCount || 1) * 6900; // $69 per unit

    // Lead paint: use actual per-bedroom pricing from price sheet
    const LEAD_PAINT_PRICES: Record<number, number> = {
      0: 13000, 1: 16000, 2: 19500, 3: 22000, 4: 25500, 5: 28000,
    };
    let leadPaintFee = 0;
    if (leadPaintRequired && unitDetails && Array.isArray(unitDetails)) {
      leadPaintFee = unitDetails.reduce((sum: number, u: { bedroomCount: number }) => {
        const beds = Math.min(u.bedroomCount || 1, 5);
        return sum + (LEAD_PAINT_PRICES[beds] || LEAD_PAINT_PRICES[5]);
      }, 0);
    } else if (leadPaintRequired) {
      // Fallback if no unit details — use 2BR price × unit count
      leadPaintFee = (unitCount || 1) * 19500;
    }
    const total = serviceFee + licenseFee + leadPaintFee;

    // Build application data
    const appData = {
        property_address: propertyAddress,
        unit_count: unitCount || 1,
        year_built: yearBuilt,
        lead_paint_required: leadPaintRequired || false,
        service_type: serviceType,
        service_fee_cents: serviceFee,
        license_fee_cents: licenseFee,
        lead_paint_fee_cents: leadPaintFee,
        total_cents: total,
        // For managed clients, mark as paid (no Stripe needed)
        paid_at: serviceType === "managed" ? new Date().toISOString() : null,
        // Owner details
        owner_first_name: ownerFirstName,
        owner_last_name: ownerLastName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        owner_dob: ownerDob || null,
        owner_mailing_address: ownerMailingAddress,
        title_type: titleType || "personal",
        has_phtin: hasPhtin === "yes",
        phtin: phtin || null,
        has_lead_paint_test: hasLeadPaintTest === "yes",
        has_commercial_activity_license: hasCAL === "yes",
        property_access_notes: propertyAccessNotes || null,
        units_occupied: unitsOccupied === "yes",
        has_natural_gas: hasNaturalGas === "yes",
        status,
        compliance_report: complianceReport,
        compliance_checked_at: complianceReport ? new Date().toISOString() : null,
        form_data: null, // Clear draft form data
    };

    // If resuming a draft, update the existing row. Otherwise insert new.
    let app;
    let appError;

    if (resumeToken) {
      const result = await supabaseAdmin
        .from("rental_license_applications")
        .update(appData)
        .eq("resume_token", resumeToken)
        .select()
        .single();
      app = result.data;
      appError = result.error;
    } else {
      const result = await supabaseAdmin
        .from("rental_license_applications")
        .insert(appData)
        .select()
        .single();
      app = result.data;
      appError = result.error;
    }

    if (appError) {
      console.error("Insert error:", appError);
      return Response.json({ error: appError.message }, { status: 500 });
    }

    // Insert unit details if provided
    if (unitDetails && Array.isArray(unitDetails) && app) {
      const unitRows = unitDetails.map(
        (u: { label: string; bedroomCount: number; leadPaintFee?: number }) => ({
          application_id: app.id,
          unit_label: u.label,
          bedroom_count: u.bedroomCount,
          lead_paint_fee_cents: u.leadPaintFee || 0,
        })
      );
      await supabaseAdmin.from("application_units").insert(unitRows);
    }

    // Add initial note
    if (app) {
      const noteContent = serviceType === "managed"
        ? `PM client intake submitted. ${hasPhtin === "yes" ? "Has PHTIN." : "PHTIN needed — awaiting owner."}`
        : `License Only intake submitted. ${hasPhtin === "yes" ? "Has PHTIN." : "PHTIN needed — awaiting owner."}`;

      await supabaseAdmin.from("application_notes").insert({
        application_id: app.id,
        author: "System",
        content: noteContent,
        is_system: true,
      });

      // Add extra details as notes
      const extras = [];
      if (companyName) extras.push(`Company: ${companyName}`);
      if (ein) extras.push(`EIN: ${ein}`);
      if (ownerCount && ownerCount > 1) extras.push(`${ownerCount} owners. ${partnerRelationship || ""}`);
      if (owner2Name) extras.push(`Owner #2: ${owner2Name}`);
      if (calNumber) extras.push(`CAL #: ${calNumber}`);
      if (rentalLicenseNumber) extras.push(`Rental License #: ${rentalLicenseNumber}`);
      if (bedBathDetails) extras.push(`Bed/Bath: ${bedBathDetails}`);
      if (tenantContactInfo) extras.push(`Tenant Contact: ${tenantContactInfo}`);
      if (hasPGWEnrollment) extras.push(`PGW Enrolled: ${hasPGWEnrollment}`);
      if (notes) extras.push(`Notes: ${notes}`);

      if (extras.length > 0) {
        await supabaseAdmin.from("application_notes").insert({
          application_id: app.id,
          author: "System",
          content: extras.join("\n"),
          is_system: true,
        });
      }
    }

    return Response.json({
      success: true,
      applicationId: app?.id,
      status,
      complianceScore: complianceReport?.readinessScore,
    });
  } catch (err) {
    console.error("Intake error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
