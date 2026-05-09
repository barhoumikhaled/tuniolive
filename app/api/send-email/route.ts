import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(
  req: Request,

) {
  try {
  const contactData = await req.json() as ContactModel

    const transporter = nodemailer.createTransport({
      port: 465,
      host: `${process.env.SMTP_HOST}`,
      auth: {
        user: `${process.env.APP_USER}`,
        pass: `${process.env.APP_PASSWORD}`,
      },
      secure: true,
    })
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#16a34a;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;">New Inquirie Received!</h1>
        </div>
        <div style="padding:20px;">
          <h2 style="color:#333;">Inquirie Details</h2>
          <p><strong>Customer:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>

          ${contactData.message}

        </div>
      </div>
    `;

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
    console.error("Email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
