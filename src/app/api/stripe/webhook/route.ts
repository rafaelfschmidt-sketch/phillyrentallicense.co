import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-server";
import { sendSlackNotification } from "@/lib/slack";
import { createClientFolder } from "@/lib/google-drive";
import { sendPaymentConfirmation } from "@/lib/email";
import { captureServer } from "@/lib/posthog";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  // If webhook secret is configured, verify signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // No webhook secret — parse the event directly (dev/testing)
    event = JSON.parse(body) as Stripe.Event;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const applicationId = session.metadata?.application_id;

    if (applicationId) {
      // Update application status to paid
      await supabaseAdmin
        .from("rental_license_applications")
        .update({
          status: "paid",
          stripe_payment_intent_id: session.payment_intent as string,
          paid_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      // Fetch the full application to get owner details
      const { data: app } = await supabaseAdmin
        .from("rental_license_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      const propertyAddress = app?.property_address || session.metadata?.property_address || "Unknown";
      const ownerName = app ? `${app.owner_first_name || ""} ${app.owner_last_name || ""}`.trim() : "";
      const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "amount confirmed";

      // Log payment in activity
      await supabaseAdmin.from("application_notes").insert({
        application_id: applicationId,
        author: "System",
        content: `Payment received — ${amount}. Ready for onboarding form.`,
        is_system: true,
      });

      // Create Google Drive folder for this client
      let folderUrl: string | null = null;
      if (ownerName) {
        const folder = await createClientFolder(propertyAddress, ownerName);
        if (folder) {
          folderUrl = folder.folderUrl;

          // Save folder URL to the application record
          await supabaseAdmin
            .from("rental_license_applications")
            .update({ google_drive_folder_url: folderUrl })
            .eq("id", applicationId);

          await supabaseAdmin.from("application_notes").insert({
            application_id: applicationId,
            author: "System",
            content: `Google Drive folder created: ${folderUrl}`,
            is_system: true,
          });
        }
      }

      // Build dashboard link — deep-link to this specific application
      const origin = process.env.NEXT_PUBLIC_APP_URL || "https://hubkey-hub.vercel.app";
      const dashboardLink = `${origin}/admin/rental-license-only?app=${applicationId}`;

      // Build links array for Slack
      const links = [
        { label: "View Submission", url: dashboardLink },
      ];
      if (folderUrl) {
        links.push({ label: "Google Drive Folder", url: folderUrl });
      }

      // Slack notification with all links
      await sendSlackNotification({
        title: "New Rental License Submission",
        propertyAddress,
        ownerName: ownerName || undefined,
        ownerEmail: session.customer_email || app?.owner_email || undefined,
        details: `Payment of *${amount}* received. Application is in the dashboard and ready to work.`,
        links,
      });

      // Payment confirmation email to client
      const clientEmail = session.customer_email || app?.owner_email;
      if (clientEmail) {
        const applyOrigin = process.env.NEXT_PUBLIC_APPLY_URL || origin;
        const onboardingUrl = `${applyOrigin}/apply/rental-license/onboarding?application_id=${applicationId}`;
        await sendPaymentConfirmation({
          to: clientEmail,
          ownerName,
          propertyAddress,
          amount,
          applicationId,
          onboardingUrl,
        }).catch((err) => {
          console.error("Payment confirmation email failed:", err);
        });
      }

      // PostHog server-side event
      await captureServer("checkout_complete", clientEmail || applicationId, {
        application_id: applicationId,
        property_address: propertyAddress,
        amount_cents: session.amount_total,
      });
    }
  }

  return NextResponse.json({ received: true });
}
