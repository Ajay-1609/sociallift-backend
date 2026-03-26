const Contact = require("../models/Contact");
const validator = require("validator");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.submitContact = async (req, res) => {
  try {
    let { name, email, phone, message } = req.body;

    // ================= TRIM =================
    name = name?.trim();
    email = email?.trim();
    phone = phone?.trim();
    message = message?.trim();

    // ================= VALIDATIONS =================
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ error: "Invalid name length" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!/^[0-9]{10,15}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (message.length < 10 || message.length > 1000) {
      return res.status(400).json({ error: "Message length invalid" });
    }

    // ================= SAVE TO DB =================
    await Contact.create({ name, email, phone, message });

    // ================= SEND EMAIL TO YOU =================
    await resend.emails.send({
      from: "SocialLift <onboarding@resend.dev>", // default sender
      to: process.env.EMAIL_USER, // your email
      subject: "📩 New Contact Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px; border:1px solid #eee;">
            
            <h2 style="color:#3B82F6; margin-bottom:20px;">New Contact Submission</h2>
            
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            
            <div style="margin-top:20px; padding:15px; background:#f1f5f9; border-radius:8px;">
              <p style="margin:0;"><strong>Message:</strong></p>
              <p style="margin-top:10px;">${message}</p>
            </div>

            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

            <p style="font-size:12px; color:#888;">
              This message was sent from your SocialLift website contact form.
            </p>

          </div>
        </div>
      `,
    });

    // ================= AUTO REPLY TO USER =================
    await resend.emails.send({
      from: "SocialLift <onboarding@resend.dev>",
      to: email,
      subject: "We received your message - SocialLift",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px; border:1px solid #eee; text-align:center;">
            
            <h2 style="color:#3B82F6;">Thank You, ${name}!</h2>
            
            <p style="color:#555; margin:20px 0;">
              We’ve received your message and our team will get back to you within 24 hours.
            </p>

            <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin:20px 0;">
              <p style="margin:0;"><strong>Your Message:</strong></p>
              <p style="margin-top:10px;">${message}</p>
            </div>

            <a href="https://www.instagram.com/_sociallift.co?igsh=Ym9wZXl2NTd1ZHYz"
               style="display:inline-block; margin-top:20px; background:#3B82F6; color:white; padding:12px 20px; border-radius:8px; text-decoration:none;">
              Follow us on Instagram
            </a>

            <p style="margin-top:30px; font-size:12px; color:#888;">
              SocialLift Team • Digital Marketing Agency
            </p>

          </div>
        </div>
      `,
    });

    console.log("✅ Email sent via Resend");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};