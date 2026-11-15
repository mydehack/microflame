import { createHmac, randomUUID } from "node:crypto";

type Workflow = "new-student" | "goal-reminder" | "weekly-review";
const webhookFor: Record<Workflow, string | undefined> = {
  "new-student": process.env.N8N_NEW_STUDENT_WEBHOOK_URL,
  "goal-reminder": process.env.N8N_GOAL_REMINDER_WEBHOOK_URL,
  "weekly-review": process.env.N8N_WEEKLY_REVIEW_WEBHOOK_URL,
};

export async function emitN8nEvent(workflow: Workflow, event: string, data: Record<string, unknown>) {
  const url = webhookFor[workflow];
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({ eventId: randomUUID(), event, occurredAt: new Date().toISOString(), data });
  const signature = createHmac("sha256", secret).update(timestamp + "." + body).digest("hex");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-campusconnect-timestamp": timestamp, "x-campusconnect-signature": signature },
        body,
        signal: AbortSignal.timeout(900),
      });
      if (response.ok) return;
      await response.body?.cancel();
      if (response.status < 500 && response.status !== 429) {
        console.warn("n8n workflow rejected event:", workflow, response.status);
        return;
      }
      if (attempt === 1) console.warn("n8n workflow delivery failed:", workflow, response.status);
    } catch {
      if (attempt === 1) console.warn("n8n workflow delivery unavailable:", workflow);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
