import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema(
  {
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true,
      index: true,
    },
    userId: { // Optional: links to login credentials if they want self-access
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    occupation: { type: String },
    
    // Nutrition & Lifestyle
    nutritionStatus: { type: String, enum: ['Normal', 'Underweight', 'Overweight', 'Obese'], default: 'Normal' },
    foodHabits: { type: String },
    substanceUse: { type: [String], default: [] }, // e.g. ['Tobacco', 'Alcohol']
    anemiaStatus: { type: String, enum: ['Normal', 'Mild', 'Moderate', 'Severe'], default: 'Normal' },

    // Maternal Health
    maternalStatus: { type: String, enum: ['None', 'Pregnant', 'Postpartum'], default: 'None' },
    isHighRisk: { type: Boolean, default: false }, // high-risk pregnancy flag

    // Child Health
    childVaccinesStatus: { type: String, enum: ['Up to date', 'Pending', 'Missed'], default: 'Up to date' },
    
    // Disease Tracking
    chronicDiseases: { type: [String], default: [] },
    infectiousDiseases: { type: [String], default: [] }, // TB, Malaria, Dengue, Covid
    
    // Healthcare Access
    nearestPhc: { type: String },
    phcVisitsLastYear: { type: Number, default: 0 },
    
    // Government Schemes
    schemesAvailed: { type: [String], default: [] }, // Ayushman Bharat, etc.
    
    // Focus Groups
    isElderly: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
export default Patient;

