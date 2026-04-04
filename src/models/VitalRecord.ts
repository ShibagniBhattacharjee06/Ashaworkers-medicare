import mongoose from 'mongoose';

const VitalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Core Vitals
    heartRate: { type: Number },          // beats per minute
    bloodPressureSys: { type: Number },   // mmHg systolic
    bloodPressureDia: { type: Number },   // mmHg diastolic
    temperature: { type: Number },        // Fahrenheit
    spo2: { type: Number },               // %
    respiratoryRate: { type: Number },    // breaths per minute
    // Extended Vitals
    cholesterol: { type: Number },        // mg/dL total cholesterol
    sugarLevel: { type: Number },         // mg/dL (fasting blood glucose)
    weight: { type: Number },             // kg
    height: { type: Number },             // cm
    bmi: { type: Number },                // kg/m² (can be computed or entered)
    notes: { type: String },
  },
  { timestamps: true }
);

const VitalRecord = mongoose.models.VitalRecord || mongoose.model('VitalRecord', VitalRecordSchema);
export default VitalRecord;
