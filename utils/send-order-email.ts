import nodemailer from "nodemailer";

interface OrderItem {
  name: string;
  quantity: number;
  amount: number;
}

interface ShippingDetails {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  method: string;
  cost: number;
}

interface OrderDetails {
  sessionId: string;
  customerEmail: string;
  customerName: string;
  amountTotal: number;
  currency: string;
  items: OrderItem[];
  shipping?: ShippingDetails;
}

export async function sendOrderNotification(order: OrderDetails) {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.SMTP_HOST,
    auth: {
      user: process.env.APP_USER,
      pass: process.env.APP_PASSWORD,
    },
    secure: true,
  });

  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${item.amount.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const shippingSection = order.shipping
    ? `
        <h2 style="color:#333;margin-top:20px;">Shipping Details</h2>
        <table style="width:100%;border-collapse:collapse;margin:10px 0;">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:140px;">Address</td>
            <td style="padding:8px;border:1px solid #ddd;">${order.shipping.address}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">City</td>
            <td style="padding:8px;border:1px solid #ddd;">${order.shipping.city}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Province</td>
            <td style="padding:8px;border:1px solid #ddd;">${order.shipping.province}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Postal Code</td>
            <td style="padding:8px;border:1px solid #ddd;">${order.shipping.postalCode}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Shipping Method</td>
            <td style="padding:8px;border:1px solid #ddd;">${order.shipping.method}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Shipping Cost</td>
            <td style="padding:8px;border:1px solid #ddd;">$${order.shipping.cost.toFixed(2)} ${order.shipping.cost === 0 ? "(Free)" : ""}</td>
          </tr>
        </table>
      `
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#16a34a;color:white;padding:20px;text-align:center;">
        <h1 style="margin:0;">New Order Received!</h1>
      </div>
      <div style="padding:20px;">
        <h2 style="color:#333;">Order Details</h2>
        <p><strong>Session ID:</strong> ${order.sessionId}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        
        ${shippingSection}
        
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;text-align:right;">
          <strong style="font-size:18px;">Total: $${order.amountTotal.toFixed(2)} ${order.currency.toUpperCase()}</strong>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.APP_USER,
    to: process.env.APP_SEND_TO,
    subject: `TuniOlive - New Order from ${order.customerName} ($${order.amountTotal.toFixed(2)})`,
    html,
  });
}
