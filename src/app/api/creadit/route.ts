import { connectDB } from "@/lib/database/dbConnection";
import CreditAccount from "@/lib/Schema/CreaditAmount";
import User from "@/lib/Schema/User";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
// @ts-expect-error: nodemailer has no ESM types
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
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
    await connectDB();

    // Get the usertoken header
    const token = req.headers.get("usertoken");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token and extract user id
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const email = user.email;

    // Parse request body
    const { currentCredit: rawCredit, type } = await req.json();
    const currentCredit = Number(rawCredit);
    if (isNaN(currentCredit) || !type) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 400 }
      );
    }
    if (!["credit", "debit"].includes(type)) {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    // Find or create the user's credit account
    let account = await CreditAccount.findOne({ userId });
    if (!account) {
      account = new CreditAccount({
        userId,
        currentCredit: 0,
        history: [],
      });
    }

    // Update currentCredit and add to history
    let newCredit = account.currentCredit;
    if (type === "credit") {
      newCredit += currentCredit;
    } else if (type === "debit") {
      newCredit -= currentCredit;
      if (newCredit < 0) newCredit = 0;
    }
    account.currentCredit = newCredit;
    account.history.push({ type, amount: currentCredit });
    await account.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Amount updated",
      html: ``,
    });

    return NextResponse.json({ message: "Credit updated", account });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
