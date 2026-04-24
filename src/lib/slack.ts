// ============================================
// Slack Notifications
// ============================================

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackLink {
  label: string;
  url: string;
}

interface SlackNotification {
  title: string;
  propertyAddress: string;
  ownerName?: string;
  ownerEmail?: string;
  details: string;
  /** Single link (backward compat) */
  link?: string;
  /** Multiple link buttons */
  links?: SlackLink[];
}

export async function sendSlackNotification(notification: SlackNotification): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set — skipping notification");
    return;
  }

  // Build action buttons from links array or single link
  const buttons: SlackLink[] = notification.links || [];
  if (!buttons.length && notification.link) {
    buttons.push({ label: "View in Dashboard", url: notification.link });
  }

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: notification.title,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Property:*\n${notification.propertyAddress}`,
        },
        ...(notification.ownerName
          ? [
              {
                type: "mrkdwn",
                text: `*Owner:*\n${notification.ownerName}${notification.ownerEmail ? ` (${notification.ownerEmail})` : ""}`,
              },
            ]
          : []),
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: notification.details,
      },
    },
    ...(buttons.length > 0
      ? [
          {
            type: "actions",
            elements: buttons.map((btn) => ({
              type: "button",
              text: {
                type: "plain_text",
                text: btn.label,
              },
              url: btn.url,
            })),
          },
        ]
      : []),
  ];

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}
