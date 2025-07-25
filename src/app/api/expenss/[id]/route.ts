import { connectDB } from "@/lib/database/dbConnection";
import Expenss from "@/lib/Schema/Expenss";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

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

    const isUser = await Expenss.findOne({ userId });
    if (!isUser) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Id not found!" }, { status: 400 });
    }

    const data = await Expenss.findById(id);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

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

    const isUser = await Expenss.findOne({ userId });
    if (!isUser) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Id not found!" }, { status: 400 });
    }

    await Expenss.findByIdAndDelete(id);
    return NextResponse.json({ Message: "Deleted !" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
