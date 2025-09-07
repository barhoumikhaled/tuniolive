import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const appPwd = "ujodtmgjbqjyykbz"
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

    const mailData = {
      from: `${contactData.email}`,
      sender: `${contactData.email}`,
      to: `${process.env.APP_SEND_TO}`,
      subject: `${contactData.subject}`,
      text: `${contactData.subject}` + ` | Sent from: ${contactData.email}` ,
      html: `
        <div>Contact email: ${contactData.email} </div>
        <div>Inquiry: ${contactData.message} </div>
        `
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
