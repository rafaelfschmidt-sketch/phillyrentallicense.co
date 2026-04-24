// ============================================
// PostHog — client + server analytics helpers
// ============================================

import { PostHog } from "posthog-node";

let _serverClient: PostHog | null = null;

export function getServerPostHog(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (!_serverClient) {
    _serverClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _serverClient;
}

export async function captureServer(
  event: string,
  distinctId: string,
  properties: Record<string, unknown> = {}
) {
  const client = getServerPostHog();
  if (!client) return;
  client.capture({ event, distinctId, properties });
  await client.flush().catch(() => {});
}
