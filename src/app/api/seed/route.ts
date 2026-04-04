import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Household from '@/models/Household';

export async function GET() {
  try {
    await dbConnect();

    // ── Admin ──────────────────────────────────────────────────────────────
    const adminExists = await User.findOne({ email: 'admin@medicare.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@medicare.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      });
    }

    // ── ASHA Worker ────────────────────────────────────────────────────────
    let ashaUser = await User.findOne({ email: 'asha@medicare.com' });
    if (!ashaUser) {
      ashaUser = await User.create({
        name: 'Kamala Devi',
        email: 'asha@medicare.com',
        password: await bcrypt.hash('asha123', 10),
        role: 'asha_worker',
      });
    }

    // ── Patient User ───────────────────────────────────────────────────────
    let patientUser = await User.findOne({ email: 'patient@medicare.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'Priya Sharma',
        email: 'patient@medicare.com',
        password: await bcrypt.hash('patient123', 10),
        role: 'patient',
      });
    }

    // ── Demo Household (linked to ASHA worker) ─────────────────────────────
    let demoHousehold = await Household.findOne({ locality: 'Demo Village' });
    if (!demoHousehold) {
      demoHousehold = await Household.create({
        locality: 'Demo Village',
        familySize: 3,
        drinkingWaterSource: 'Borewell',
        hasToilet: true,
        assignedAshaId: ashaUser._id,
      });
    }

    // ── Patient Record (linked to patient user) ────────────────────────────
    const patientExists = await Patient.findOne({ userId: patientUser._id });
    if (!patientExists) {
      await Patient.create({
        householdId: demoHousehold._id,
        userId: patientUser._id,
        name: 'Priya Sharma',
        age: 28,
        gender: 'Female',
        occupation: 'Homemaker',
        nutritionStatus: 'Normal',
        anemiaStatus: 'Mild',
        maternalStatus: 'None',
        isHighRisk: false,
        childVaccinesStatus: 'Up to date',
        chronicDiseases: ['Hypertension'],
        infectiousDiseases: [],
        nearestPhc: 'Rampur PHC',
        phcVisitsLastYear: 3,
        schemesAvailed: ['Ayushman Bharat', 'Janani Suraksha Yojana'],
        isElderly: false,
        isDisabled: false,
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      credentials: {
        admin:   { email: 'admin@medicare.com',   password: 'admin123' },
        asha:    { email: 'asha@medicare.com',    password: 'asha123' },
        patient: { email: 'patient@medicare.com', password: 'patient123' },
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

