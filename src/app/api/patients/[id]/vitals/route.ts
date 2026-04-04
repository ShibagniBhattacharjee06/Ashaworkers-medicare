import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import VitalRecord from "@/models/VitalRecord";
import Patient from "@/models/Patient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const vitals = await VitalRecord.find({ patientId: params.id }).sort({ createdAt: -1 });
    return NextResponse.json(vitals, { status: 200 });
  } catch (error) {
    console.error("Vitals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // verify patient exists
    const patientExists = await Patient.findById(params.id);
    if (!patientExists) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();
    const userId = (session.user as any).id || "unknown";

    const newRecord = await VitalRecord.create({
      ...body,
      patientId: params.id,
      recordedBy: userId,
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Vitals POST error:", error);
    return NextResponse.json({ error: "Failed to create vital record" }, { status: 500 });
  }
}
