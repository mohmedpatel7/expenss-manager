import { connectDB } from "@/lib/database/dbConnection";
import User from "@/lib/Schema/User";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import CreaditAmount from "@/lib/Schema/CreaditAmount";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await req.headers.get("usertoken");
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

    const user = await User.findById(userId).select("_id name email pic dob");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const amount = await CreaditAmount.findOne({ userId }).select(
      "currentCredit"
    );

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      dob: user.dob,
      creadit: amount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const token = await req.headers.get("usertoken");
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
    const { name, dob } = await req.json();

    // Validate required fields
    if (!name || !dob) {
      return NextResponse.json(
        { message: "Name and date of birth are required" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { message: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate date of birth
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Check if date is in the future
    if (dobDate > new Date()) {
      return NextResponse.json(
        { message: "Date of birth cannot be in the future" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        dob: dobDate,
      },
      { new: true }
    ).select("_id name email pic dob");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        dob: updatedUser.dob,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
