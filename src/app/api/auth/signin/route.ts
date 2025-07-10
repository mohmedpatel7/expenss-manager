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

    // We use [0] because User.find() returns an array of users matching the query.
    // Since email should be unique, we expect at most one user, so we access the first element.
    if (!user || user.length === 0)
      return NextResponse.json({ message: "Invalid email or password !" });

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch)
      return NextResponse.json({ message: "Invalid email or password !" });

    // Use user[0]._id because user is an array returned by User.find()
    // The exclamation mark (!) after process.env.JWT_SIGN tells TypeScript that we are sure JWT_SIGN is defined (not undefined)
    const usertoken = jwt.sign({ id: user[0]._id }, process.env.JWT_SIGN!);

    return NextResponse.json({ usertoken });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
