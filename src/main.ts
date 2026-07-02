import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getOverduePendingOrders } from "./queries/order_queries";
import { sendPendingOrderAlerts } from "./slack";

const PENDING_ORDER_ALERT_THRESHOLD_DAYS = 3;

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const overdueOrders = await getOverduePendingOrders(
    db,
    PENDING_ORDER_ALERT_THRESHOLD_DAYS
  );

  await sendPendingOrderAlerts(
    overdueOrders.map((order) => ({
      orderId: order.order_id,
      customerName: order.customer_name,
      phone: order.phone,
      daysPending: order.days_pending,
    }))
  );
}

main();
