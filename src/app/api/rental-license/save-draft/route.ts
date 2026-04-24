import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { resumeToken, formData, email } = await request.json();

    if (!formData || !email) {
      return Response.json(
        { error: "Form data and email are required" },
        { status: 400 }
      );
    }

    // If we have a resume token, update the existing draft
    if (resumeToken) {
      const { error } = await supabaseAdmin
        .from("rental_license_applications")
        .update({
          form_data: formData,
          owner_email: email,
          property_address: formData.propertyAddress || "Draft",
          updated_at: new Date().toISOString(),
        })
        .eq("resume_token", resumeToken);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ success: true, resumeToken });
    }

    // Create a new draft with a unique resume token
    const newToken = crypto.randomBytes(16).toString("hex");

    const { error } = await supabaseAdmin
      .from("rental_license_applications")
      .insert({
        resume_token: newToken,
        form_data: formData,
        owner_email: email,
        property_address: formData.propertyAddress || "Draft",
        unit_count: parseInt(formData.unitCount) || 1,
        service_type: formData.serviceType || "license_only",
        status: "draft",
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, resumeToken: newToken });
  } catch (err) {
    console.error("Save draft error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("rental_license_applications")
    .select("form_data, resume_token, status, owner_email")
    .eq("resume_token", token)
    .single();

  if (error || !data) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  // Don't allow resuming completed applications
  if (data.status !== "draft") {
    return Response.json(
      { error: "This application has already been submitted" },
      { status: 400 }
    );
  }

  return Response.json({
    formData: data.form_data,
    resumeToken: data.resume_token,
    email: data.owner_email,
  });
}
