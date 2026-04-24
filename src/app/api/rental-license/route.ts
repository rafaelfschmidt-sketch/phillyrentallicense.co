import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { calculatePrice, type UnitInput } from "@/lib/pricing";
import { getOPAProperty } from "@/lib/api/philly/client";

// POST: Create a new license-only application (Step 1 — pricing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, propertyAddress, units, serviceType } = body as {
      email: string;
      propertyAddress: string;
      units: UnitInput[];
      serviceType?: string;
    };

    const resolvedServiceType = serviceType === "leasing_only" ? "leasing_only" : "license_only";

    if (!propertyAddress || !units || units.length === 0) {
      return NextResponse.json(
        { error: "Property address and unit details are required" },
        { status: 400 }
      );
    }

    // Look up property from OPA
    const opaResults = await getOPAProperty(propertyAddress);
    const opaData = opaResults[0] || null;
    const yearBuilt = opaData?.year_built ? parseInt(String(opaData.year_built), 10) : null;
    const leadPaintRequired = yearBuilt != null && yearBuilt > 0 && yearBuilt <= 1978;
    const opaOwner1 = opaData?.owner_1 || null;
    const opaOwner2 = opaData?.owner_2 || null;

    // Calculate pricing
    const price = calculatePrice(units, leadPaintRequired, resolvedServiceType);

    // Save application to Supabase
    const { data: application, error: appError } = await supabaseAdmin
      .from("rental_license_applications")
      .insert({
        property_address: propertyAddress.toUpperCase().trim(),
        owner_email: email?.trim() || null,
        unit_count: units.length,
        year_built: yearBuilt,
        lead_paint_required: leadPaintRequired,
        service_type: resolvedServiceType,
        service_fee_cents: price.serviceFee,
        license_fee_cents: price.licenseFee,
        lead_paint_fee_cents: price.leadPaintFee,
        total_cents: price.total,
        status: "pending_payment",
      })
      .select()
      .single();

    if (appError) {
      console.error("Failed to create application:", appError);
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    // Save unit details
    const unitRows = units.map((u, i) => ({
      application_id: application.id,
      unit_label: u.label,
      bedroom_count: u.bedroomCount,
      lead_paint_fee_cents: price.leadPaintPerUnit[i].fee,
    }));

    const { error: unitError } = await supabaseAdmin
      .from("application_units")
      .insert(unitRows);

    if (unitError) {
      console.error("Failed to save units:", unitError);
    }

    // Log system note
    await supabaseAdmin.from("application_notes").insert({
      application_id: application.id,
      author: "System",
      content: `Application created for ${propertyAddress.toUpperCase().trim()}. ${units.length} unit(s). ${leadPaintRequired ? `Year built: ${yearBuilt} — lead paint test required.` : "No lead paint test required."}`,
      is_system: true,
    });

    return NextResponse.json({
      application,
      pricing: price,
      yearBuilt,
      leadPaintRequired,
      opaOwner1,
      opaOwner2,
    });
  } catch (error) {
    console.error("Rental license API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
