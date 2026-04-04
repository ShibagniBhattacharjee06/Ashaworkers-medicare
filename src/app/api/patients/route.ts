import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db/mongodb';
import Patient from '@/models/Patient';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const householdId = searchParams.get('householdId');

    await dbConnect();
    
    let query: any = {};
    if (householdId) {
      query.householdId = householdId;
    }
    
    // If it's a specific patient accessing their own record
    if ((session.user as any).role === 'patient') {
      query.userId = (session.user as any).id;
    }

    const patients = await Patient.find(query);
    return NextResponse.json(patients, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'asha_worker') {
      return NextResponse.json({ error: 'Unauthorized: Only ASHA workers can add patients' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    const newPatient = await Patient.create(body);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
