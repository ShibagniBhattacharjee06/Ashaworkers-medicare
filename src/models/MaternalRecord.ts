import mongoose from 'mongoose';

const MaternalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
      index: true,
    },
    pregnancyStatus: { type: String, enum: ['Pregnant', 'Postpartum', 'None'], default: 'None' },
    antenatalCheckups: { type: Number, default: 0 },
    expectedDeliveryDate: { type: Date },
    ironFolicAcidIntake: { type: Boolean, default: false },
    isHighRisk: { type: Boolean, default: false },
    plannedDeliveryPlace: { type: String, enum: ['Home', 'PHC', 'Hospital'], default: 'Hospital' },
    actualDeliveryPlace: { type: String },
  },
  { timestamps: true }
);

const MaternalRecord = mongoose.models.MaternalRecord || mongoose.model('MaternalRecord', MaternalRecordSchema);
export default MaternalRecord;
