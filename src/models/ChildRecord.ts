import mongoose from 'mongoose';

const ChildRecordSchema = new mongoose.Schema(
  {
    patientId: { // Each child will actually be a Patient member first
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
      index: true,
    },
    motherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    birthWeightKg: { type: Number },
    isBreastfeeding: { type: Boolean, default: true },
    nutritionStatus: { type: String, enum: ['Normal', 'SAM', 'MAM'], default: 'Normal' }, // Severe Acute Malnutrition, Moderate Acute Malnutrition
    immunizationStatus: { type: String, enum: ['Up to date', 'Pending', 'Missed'], default: 'Pending' },
    missedVaccines: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ChildRecord = mongoose.models.ChildRecord || mongoose.model('ChildRecord', ChildRecordSchema);
export default ChildRecord;
