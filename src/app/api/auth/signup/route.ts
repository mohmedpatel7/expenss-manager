import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database/dbConnection";
import User from "@/lib/Schema/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
// @ts-expect-error: nodemailer has no ESM types
import nodemailer from "nodemailer";

// In-memory OTP store
const setOtp: { [email: string]: { otp: string; expiry: number } } = {};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();
    const { name, email, otp, dob, password, picBase64 } = data;

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

    // Handle profile picture (base64)
    let profilePic: string | null = null;
    if (picBase64) {
      const buffer = Buffer.from(picBase64, "base64");
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}.png`;
      const filePath = path.join(process.cwd(), "public", "upload", fileName);
      await fs.writeFile(filePath, buffer);
      profilePic = "/upload/" + fileName;
    }

    // Create user
    const user = new User({
      name,
      email,
      dob,
      password: hashedPassword,
      pic: profilePic,
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
      text: `Dear User,Your OTP for signup verification is:${otp}. Do not share it with anyone.`,
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
