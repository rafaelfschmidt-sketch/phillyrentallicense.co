import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { formatCents } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Get the application from Supabase
    const { data: app, error } = await supabaseAdmin
      .from("rental_license_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error || !app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (app.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Application has already been paid" },
        { status: 400 }
      );
    }

    // Get unit details for the line items
    const { data: units } = await supabaseAdmin
      .from("application_units")
      .select("*")
      .eq("application_id", applicationId);

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: app.service_type === "leasing_only"
              ? "Rental License — Leasing Client (discounted)"
              : "Rental License Only — Service Fee",
            description: `Philadelphia rental license service for ${app.property_address}`,
          },
          unit_amount: app.service_fee_cents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "License Fee",
            description: `City license fee — ${app.unit_count} unit(s) × $69.00`,
          },
          unit_amount: 6900,
        },
        quantity: app.unit_count,
      },
    ];

    // Add lead paint line items per unit (if applicable)
    if (app.lead_paint_required && units) {
      for (const unit of units) {
        if (unit.lead_paint_fee_cents > 0) {
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: `Lead Paint Test — ${unit.unit_label}`,
                description: `${unit.bedroom_count === 0 ? "Studio" : `${unit.bedroom_count} bedroom(s)`}`,
              },
              unit_amount: unit.lead_paint_fee_cents,
            },
            quantity: 1,
          });
        }
      }
    }

    const origin = request.nextUrl.origin;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: app.owner_email || undefined,
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: `By checking this box, I agree to the [Rental License Procurement Agreement](${origin}/legal/rental-license-agreement)`,
        },
      },
      metadata: {
        application_id: applicationId,
        property_address: app.property_address,
      },
      success_url: `${origin}/apply/rental-license/onboarding?application_id=${applicationId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/apply/rental-license?cancelled=true`,
    });

    // Save the checkout session ID to the application
    await supabaseAdmin
      .from("rental_license_applications")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", applicationId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
