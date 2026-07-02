const SLACK_API_URL = "https://slack.com/api/chat.postMessage";
const ORDER_ALERTS_CHANNEL = "#order-alerts";

export interface PendingOrderAlert {
  orderId: number;
  customerName: string;
  phone: string | null;
  daysPending: number;
}

async function postToSlack(channel: string, text: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN environment variable is not set");
  }

  const response = await fetch(SLACK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });

  const result: any = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(`Slack API error: ${result.error ?? response.statusText}`);
  }
}

export async function sendPendingOrderAlerts(
  orders: PendingOrderAlert[]
): Promise<void> {
  if (orders.length === 0) {
    return;
  }

  const lines = orders.map(
    (order) =>
      `• Order #${order.orderId} — ${order.customerName} (${
        order.phone ?? "no phone on file"
      }) — pending ${Math.floor(order.daysPending)} days`
  );

  const text = [
    `:rotating_light: *${orders.length} order(s) pending more than 3 days* — please follow up:`,
    ...lines,
  ].join("\n");

  await postToSlack(ORDER_ALERTS_CHANNEL, text);
}
