import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/dbConnection";
import User from "@/lib/Schema/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// @ts-expect-error: nodemailer has no ESM types
import nodemailer from "nodemailer";

// In-memory OTP store
const setOtp: { [email: string]: { otp: string; expiry: number } } = {};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();
    const { name, email, otp, dob, password } = data;

    if (!name || !email || !otp || !dob || !password) {
      return NextResponse.json(
        { message: "Missing required fields !" },
        { status: 400 }
      );
    }

    // Validate OTP
    const otpData = setOtp[email];
    if (!otpData) {
      return NextResponse.json(
        { message: "OTP not sent or expired" },
        { status: 400 }
      );
    }
    if (otpData.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
    if (Date.now() > otpData.expiry) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      dob,
      password: hashedPassword,
    });
    await user.save();

    // Clear OTP
    delete setOtp[email];

    // Generate JWT
    const usertoken = jwt.sign({ id: user._id }, process.env.JWT_SIGN!);

    return NextResponse.json({ usertoken }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Invalid Email..!" },
        { status: 400 }
      );
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = Date.now() + 2 * 60 * 1000; // 2 minutes
    setOtp[email] = { otp, expiry };
    // Here you would send the OTP via email (e.g., using nodemailer)
    // For demo, just return the OTP

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "otp for expenss manager signup.",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 32px;">
          <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #0001; padding: 32px 24px;">
            <h2 style="color: #2563eb; margin-bottom: 12px;">Expenss Manager Signup Verification</h2>
            <p style="font-size: 16px; color: #222; margin-bottom: 24px;">Dear User,</p>
            <p style="font-size: 15px; color: #444; margin-bottom: 18px;">Your OTP for signup verification is:</p>
            <div style="font-size: 2.2rem; font-weight: bold; color: #2563eb; letter-spacing: 8px; background: #e0e7ff; padding: 16px 0; border-radius: 8px; text-align: center; margin-bottom: 24px;">${otp}</div>
            <p style="font-size: 14px; color: #888;">Do not share this OTP with anyone. It is valid for 2 minutes.</p>
            <div style="margin-top: 32px; text-align: center;">
              <span style="font-size: 13px; color: #b0b8c1;">Expenss Manager &copy; ${new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      `,
    });
    return NextResponse.json({ message: "OTP sent to your email." });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Disable Next.js default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
