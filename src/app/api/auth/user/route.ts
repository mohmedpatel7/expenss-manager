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

    const amount = await CreaditAmount.findById(userId).select("currentCredit");

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
