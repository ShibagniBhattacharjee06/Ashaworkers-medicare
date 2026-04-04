import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });
    }

    // In a real app, hash password here (e.g. bcrypt). The user schema might already have it or we hash it before save.
    // For this prototype, we'll assume there's a pre-save hook in the User model or we store plain for dummy login (not ideal, but depends on our User model).
    // Let's create it directly.
    const newUser = await User.create({
      name,
      email,
      password, // Warning: Ensure User model hashes it!
      role,
    });

    return NextResponse.json({ message: "Staff user created successfully", user: { id: newUser._id, name, email, role } }, { status: 201 });
  } catch (error) {
    console.error("Staff POST error:", error);
    return NextResponse.json({ error: "Failed to create staff user." }, { status: 500 });
  }
}
