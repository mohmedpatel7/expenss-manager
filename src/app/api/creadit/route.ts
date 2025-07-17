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
    account.history.push({
      type,
      amount: currentCredit,
      currentAmount: newCredit,
    });
    await account.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: `Credit Account ${type === "credit" ? "Credited" : "Debited"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Credit Account Update</h2>
          
          <div style="background-color: ${
            type === "credit" ? "#e8f5e8" : "#ffe8e8"
          }; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: ${
              type === "credit" ? "#2d5a2d" : "#5a2d2d"
            }; margin: 0 0 10px 0;">
              ${type === "credit" ? "💰 Credit Added" : "💸 Debit Deducted"}
            </h3>
            <p style="font-size: 18px; font-weight: bold; color: ${
              type === "credit" ? "#2d5a2d" : "#5a2d2d"
            }; margin: 0;">
              Amount: ₹${currentCredit.toLocaleString()}
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #333; margin: 0 0 10px 0;">Account Summary</h4>
            <p style="margin: 5px 0; color: #666;">
              <strong>Previous Balance:</strong> ₹${(
                account.currentCredit -
                (type === "credit" ? currentCredit : -currentCredit)
              ).toLocaleString()}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Current Balance:</strong> ₹${account.currentCredit.toLocaleString()}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Transaction Type:</strong> ${
                type.charAt(0).toUpperCase() + type.slice(1)
              }
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>This is an automated notification from your Expense Management System.</p>
            <p>If you didn't perform this transaction, please contact support immediately.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Credit updated", account });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get("usertoken");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SIGN!) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = decoded.id;

    const account = await CreditAccount.findOne({ userId });
    if (!account) {
      return NextResponse.json(
        { message: "Credit account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ account }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
