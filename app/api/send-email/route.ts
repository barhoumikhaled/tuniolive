import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(
  req: Request,

) {
  try {
    const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
    if (!rateLimit(ip, 3, 60_000)) { // 3 emails per minute per IP
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  const contactData = await req.json() as ContactModel
    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Then in the handler, validate and sanitize:
    const { name, email, subject, message } = contactData;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#16a34a;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;">New Inquiry Received!</h1>
        </div>
        <div style="padding:20px;">
          <p><strong>Customer:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      port: 465,
      host: `${process.env.SMTP_HOST}`,
      auth: {
        user: `${process.env.APP_USER}`,
        pass: `${process.env.APP_PASSWORD}`,
      },
      secure: true,
    })

    const mailData = {
      from: `${contactData.email}`,
      sender: `${contactData.email}`,
      to: `${process.env.APP_SEND_TO}`,
      subject: `Message from website: ${contactData.subject}`,
      html: html
    }

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailData, function (err, info) {

        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          console.log(info)
          resolve(info)
        }
      })
    })

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/send-email]", error); // full error server-side only
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
