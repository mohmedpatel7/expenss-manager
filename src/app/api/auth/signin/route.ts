import { connectDB } from "@/lib/database/dbConnection";
import User from "@/lib/Schema/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.json();
    const { email, password } = data;

    const user = await User.find({ email: email });

    if (!user || user.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password !" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password !" },
        { status: 401 }
      );
    }

    const usertoken = jwt.sign({ id: user[0]._id }, process.env.JWT_SIGN!);

    return NextResponse.json({ usertoken, message: "Signin successful!" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
