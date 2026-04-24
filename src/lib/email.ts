// ============================================
// Email Service (Resend)
// ============================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "HubKey Real Estate <notifications@hubkey.co>";

// Reply-to addresses by context
const REPLY_TO = {
  license: "license@hubkey.co",
  leasing: "leasing@hubkey.co",
  operations: "operations@hubkey.co",
  support: "support@hubkey.co",
} as const;

type EmailContext = keyof typeof REPLY_TO;

// ---- Core send function ----

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = "license",
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: EmailContext;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: REPLY_TO[replyTo],
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ---- Email Templates ----

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f8f8fa;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="text-align:center;padding:20px 0;">
      <img src="https://hubkey-hub.vercel.app/hubkey-logo.png" alt="HubKey Real Estate" style="height:40px;" />
    </div>
    <!-- Content -->
    <div style="background:white;border-radius:8px;padding:32px;border:1px solid #e2e3e7;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;padding:20px 0;color:#6b6d7b;font-size:12px;">
      HubKey Real Estate &middot; Philadelphia, PA &middot;
      <a href="https://hubkey.co" style="color:#50b8a2;">hubkey.co</a>
    </div>
  </div>
</body>
</html>`;
}

// ---- Rental License Emails ----

export async function sendRentalLicenseFormRequest({
  to,
  ownerName,
  propertyAddress,
  intakeUrl,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  intakeUrl: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — Rental License Information Needed`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Rental License Information Needed</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">We need some information from you to get started on the rental license for <strong>${propertyAddress}</strong>.</p>
      <p style="color:#333543;">Please click the button below to fill out the form. It should take about 5 minutes.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${intakeUrl}" style="background:#50b8a2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
          Fill Out Rental License Form
        </a>
      </div>
      <p style="color:#6b6d7b;font-size:14px;">
        <strong>Important:</strong> You will need your Philadelphia Tax Identification Number (PHTIN) to complete this form.
        If you don't have one, the form will guide you through getting it.
      </p>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email or contact us at license@hubkey.co.</p>
    `),
  });
}

export async function sendPHTINReminder({
  to,
  ownerName,
  propertyAddress,
  phtinSetupUrl,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  phtinSetupUrl: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — We Still Need Your Philadelphia Tax ID`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Philadelphia Tax ID Needed</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">We're working on the rental license for <strong>${propertyAddress}</strong>, but we're unable to proceed without your Philadelphia Tax Identification Number (PHTIN).</p>
      <p style="color:#333543;">This is <strong>not</strong> your SSN, EIN, or OPA number — it's a separate number from the Philadelphia Tax Center.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${phtinSetupUrl}" style="background:#50b8a2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
          Get Your PHTIN — Step by Step Guide
        </a>
      </div>
      <p style="color:#6b6d7b;font-size:14px;">Once you have your PHTIN, please reply to this email with the number and we'll get started right away.</p>
      <p style="color:#6b6d7b;font-size:14px;">Need help? Reply to schedule a call with our team.</p>
    `),
  });
}

export async function sendStatusUpdate({
  to,
  ownerName,
  propertyAddress,
  stageName,
  message,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  stageName: string;
  message: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — Rental License Update`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Rental License Update</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">Here's an update on the rental license for <strong>${propertyAddress}</strong>:</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#166534;font-weight:bold;">Current Stage: ${stageName}</p>
        <p style="margin:8px 0 0;color:#166534;">${message}</p>
      </div>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email or contact us at license@hubkey.co.</p>
    `),
  });
}

export async function sendRLSIRequest({
  to,
  ownerName,
  propertyAddress,
  documensoUrl,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  documensoUrl: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — Please Sign the Rental License Supplemental Form`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Rental License Supplemental Form</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">Your Rental License Supplemental Information (RLSI) form for <strong>${propertyAddress}</strong> is ready for your signature.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${documensoUrl}" style="background:#50b8a2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
          Review & Sign Document
        </a>
      </div>
      <p style="color:#6b6d7b;font-size:14px;">This form is required by the City of Philadelphia as part of the rental license application.</p>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email or contact us at license@hubkey.co.</p>
    `),
  });
}

export async function sendPaymentConfirmation({
  to,
  ownerName,
  propertyAddress,
  amount,
  applicationId,
  onboardingUrl,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  amount: string;
  applicationId: string;
  onboardingUrl: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — Payment Received, Next Steps Inside`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Payment received — thank you!</h2>
      <p style="color:#333543;">Hi${ownerName ? " " + ownerName : ""},</p>
      <p style="color:#333543;">We received your payment of <strong>${amount}</strong> for the rental license at <strong>${propertyAddress}</strong>. Your application is officially in motion.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#166534;font-weight:bold;">Next step: Complete your application details</p>
        <p style="margin:8px 0 0;color:#166534;">We need a few more pieces of information to submit your application to L&amp;I. It takes about 5 minutes.</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${onboardingUrl}" style="background:#50b8a2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
          Complete Your Application
        </a>
      </div>
      <p style="color:#6b6d7b;font-size:14px;"><strong>What we&apos;ll need:</strong> Owner contact info, Philadelphia Tax ID (PHTIN), lead paint status, and property access details.</p>
      <p style="color:#6b6d7b;font-size:14px;">Reference: Application #${applicationId.slice(0, 8)}</p>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email or contact us at license@hubkey.co.</p>
    `),
  });
}

export async function sendOnboardingComplete({
  to,
  ownerName,
  propertyAddress,
  applicationId,
  hasPhtin,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  applicationId: string;
  hasPhtin: boolean;
}) {
  const phtinBlock = hasPhtin
    ? `<p style="color:#333543;">We have everything we need to start your application. Our Rental License Coordinator will review your submission and begin the compliance checks in the next business day.</p>`
    : `<div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;padding:16px;margin:16px 0;">
         <p style="margin:0;color:#92400e;font-weight:bold;">Action needed: Philadelphia Tax ID (PHTIN)</p>
         <p style="margin:8px 0 0;color:#92400e;">Before we can submit your license application, you&apos;ll need a PHTIN from the Philadelphia Tax Center. Our Operations Manager will reach out within 1 business day to walk you through the setup — a call usually takes 15 minutes.</p>
       </div>`;

  return sendEmail({
    to,
    subject: `${propertyAddress} — Application Received`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Application received</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">Thanks for completing the details for <strong>${propertyAddress}</strong>. Your application is now with our Rental License Coordinator.</p>
      ${phtinBlock}
      <div style="background:#f8f8fa;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#333543;font-weight:bold;">What happens next</p>
        <ul style="margin:8px 0 0;padding-left:20px;color:#333543;">
          <li>We run full compliance checks against city records (violations, CAL, lead cert)</li>
          <li>We send the RLSI form for your signature</li>
          <li>We submit the application through L&amp;I Eclipse</li>
          <li>You&apos;ll receive updates at every step</li>
        </ul>
      </div>
      <p style="color:#6b6d7b;font-size:14px;">Typical turnaround is 3–5 business days once we have your PHTIN and a clear tax account.</p>
      <p style="color:#6b6d7b;font-size:14px;">Reference: Application #${applicationId.slice(0, 8)}</p>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email or contact us at license@hubkey.co.</p>
    `),
  });
}

export async function sendAbandonedCartRecovery({
  to,
  address,
  checkoutUrl,
}: {
  to: string;
  address: string;
  checkoutUrl: string;
}) {
  return sendEmail({
    to,
    subject: `Still need a rental license for ${address}?`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">We saved your spot</h2>
      <p style="color:#333543;">You started a rental license application for <strong>${address}</strong> but didn&apos;t finish. No worries — it&apos;s still here.</p>
      <p style="color:#333543;">Philadelphia fines unlicensed rentals up to <strong>$2,000 per day</strong>, and rent collected without a license isn&apos;t legally recoverable. The sooner you&apos;re compliant, the better.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${checkoutUrl}" style="background:#50b8a2;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
          Pick Up Where You Left Off
        </a>
      </div>
      <p style="color:#6b6d7b;font-size:14px;"><strong>Why HubKey:</strong> 100+ licenses processed, 3–5 day turnaround (after PHTIN), flat $500 service fee plus city fees.</p>
      <p style="color:#6b6d7b;font-size:14px;">Questions? Reply to this email — a real person will respond.</p>
    `),
  });
}

export async function sendLicenseComplete({
  to,
  ownerName,
  propertyAddress,
  licenseNumber,
  expirationDate,
}: {
  to: string;
  ownerName: string;
  propertyAddress: string;
  licenseNumber: string;
  expirationDate: string;
}) {
  return sendEmail({
    to,
    subject: `${propertyAddress} — Your Rental License is Ready!`,
    replyTo: "license",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#333543;">Your Rental License is Ready!</h2>
      <p style="color:#333543;">Hi ${ownerName},</p>
      <p style="color:#333543;">Great news — the rental license for <strong>${propertyAddress}</strong> has been issued by the City of Philadelphia.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#166534;"><strong>License Number:</strong> ${licenseNumber}</p>
        <p style="margin:8px 0 0;color:#166534;"><strong>Expiration Date:</strong> ${expirationDate}</p>
      </div>
      <p style="color:#333543;">A copy has been saved to your property file. No action is needed on your part.</p>
      <p style="color:#6b6d7b;font-size:14px;">Thank you for choosing HubKey Real Estate!</p>
    `),
  });
}
