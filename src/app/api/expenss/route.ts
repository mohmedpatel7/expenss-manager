import { connectDB } from "@/lib/database/dbConnection";
import Expenss from "@/lib/Schema/Expenss";
import CreaditAmount from "@/lib/Schema/CreaditAmount";
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

    // Get usertoken header
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

    // Find user's credit account
    const creditAccount = await CreaditAmount.findOne({ userId });
    if (!creditAccount) {
      return NextResponse.json({
        message: "Credit account not found!.",
        status: 404,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const email = user.email;

    // Parse request body
    const { title, amount: rawAmount } = await req.json();
    const amount = Number(rawAmount);

    if (isNaN(amount) || !title || amount <= 0) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // Check if user has sufficient credit
    if (creditAccount.currentCredit < amount) {
      return NextResponse.json(
        { message: "Insufficient credit balance" },
        { status: 400 }
      );
    }

    // Find or create expense category
    let expenseCategory = await Expenss.findOne({
      userId,
      title: title,
    });

    if (!expenseCategory) {
      expenseCategory = new Expenss({
        userId,
        title: title,
        creditAccountId: creditAccount._id,
        expenses: [],
      });
    }

    // Add expense to category
    expenseCategory.expenses.push({
      amount,
      type: "debit",
      date: new Date(),
      currentAmount: creditAccount.currentCredit - amount,
    });

    await expenseCategory.save();

    // Deduct amount from credit account
    creditAccount.currentCredit -= amount;
    creditAccount.history.push({
      type: "debit",
      amount,
      date: new Date(),
      currentAmount: creditAccount.currentCredit,
    });
    await creditAccount.save();

    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Expense Recorded - Credit Deducted",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Expense Recorded</h2>
          
          <div style="background-color: #ffe8e8; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #5a2d2d; margin: 0 0 10px 0;">
              💸 Expense Deducted
            </h3>
            <p style="font-size: 18px; font-weight: bold; color: #5a2d2d; margin: 0;">
              Amount: ₹${amount.toLocaleString()}
            </p>
            <p style="font-size: 16px; color: #5a2d2d; margin: 10px 0 0 0;">
              Category: ${title.charAt(0).toUpperCase() + title.slice(1)}
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #333; margin: 0 0 10px 0;">Account Summary</h4>
            <p style="margin: 5px 0; color: #666;">
              <strong>Previous Balance:</strong> ₹${(
                creditAccount.currentCredit + amount
              ).toLocaleString()}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Current Balance:</strong> ₹${creditAccount.currentCredit.toLocaleString()}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Transaction Type:</strong> Expense (Debit)
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>This is an automated notification from your Expense Management System.</p>
            <p>If you didn't perform this transaction, please contact support immediately.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Expense recorded successfully",
      expense: expenseCategory,
      remainingCredit: creditAccount.currentCredit,
    });
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

    const result = await Expenss.find({ userId });

    return NextResponse.json({ status: 200, expenss: result });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
