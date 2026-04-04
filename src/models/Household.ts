import mongoose from 'mongoose';

export interface IHousehold {
  assignedAshaId: mongoose.Types.ObjectId;
  locality: string;
  familySize: number;
  socioEconomicStatus: 'BPL' | 'APL' | 'AAY' | 'Other';
  drinkingWaterSource: string;
  toiletAvailability: boolean;
  cleanlinessPractices: string;
  wasteDisposalMethod: string;
}

const HouseholdSchema = new mongoose.Schema(
  {
    assignedAshaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    locality: { type: String, required: true },
    familySize: { type: Number, required: true, default: 1 },
    socioEconomicStatus: {
      type: String,
      enum: ['BPL', 'APL', 'AAY', 'Other'],
      default: 'APL',
    },
    drinkingWaterSource: { type: String },
    toiletAvailability: { type: Boolean, default: false },
    cleanlinessPractices: { type: String },
    wasteDisposalMethod: { type: String },
  },
  { timestamps: true }
);

const Household = mongoose.models.Household || mongoose.model('Household', HouseholdSchema);
export default Household;
