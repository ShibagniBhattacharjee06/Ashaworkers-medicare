import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Patient from "@/models/Patient";
import Household from "@/models/Household";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Force dynamic rendering — this route reads session headers
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
    }

    await dbConnect();

    // 1. Group patient registrations by Month for velocity chart
    // A simple approach since we only have created timestamps:
    const velocityAggregation = await Patient.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          patients: { $sum: 1 },
          maternal: { 
            $sum: { 
              $cond: [ { $in: ["$maternalStatus", ["Pregnant", "Postpartum"]] }, 1, 0 ] 
            } 
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const velocityData = velocityAggregation.map(item => ({
      name: months[item._id - 1] || "Unk",
      patients: item.patients,
      maternal: item.maternal
    }));

    // If empty DB, provide empty default
    if (velocityData.length === 0) {
        velocityData.push({ name: months[new Date().getMonth()], patients: 0, maternal: 0 });
    }

    // 2. Aggregate Diseases
    const diseasesAggr = await Patient.aggregate([
        { $project: { diseases: { $concatArrays: [ { $ifNull: ["$chronicDiseases", []] }, { $ifNull: ["$infectiousDiseases", []] } ] } } },
        { $unwind: "$diseases" },
        { $group: { _id: "$diseases", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    const diseaseData = diseasesAggr.map(item => ({
        condition: item._id,
        count: item.count
    }));

    // Some defaults if empty so chart doesn't look broken
    if (diseaseData.length === 0) {
        diseaseData.push({ condition: "None Recorded", count: 0 });
    }

    return NextResponse.json({ velocityData, diseaseData }, { status: 200 });

  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
