import { model, Schema } from "dynamoose";
import { Document } from "dynamoose/dist/Document";

export interface Patient extends Document {
  email: string;
  name: string;
  password: string;
  phone: string;
  dob: Date;
  address: string;
  postalCode: Number;
  allergies?: string[];
  healthConditions?: string[];
  babies?: Baby[];
}

const PatientSchema = new Schema({
  email: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  postalCode: { type: Number, required: true },
  healthConditions: { type: Array, schema: [String] },
  allergies: { type: Array, schema: [String] },
});

export interface Baby extends Document {
  babyId: string;
  patientId: string;
  dueDate: Date;
  babyName: string;
  isBorn: boolean;
}

const BabySchema = new Schema({
  babyId: { type: String, required: true },
  patientId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  babyName: { type: String, required: true },
  isBorn: { type: Boolean, default: false, required: true },
});

export const PatientModel = model<Patient>("patient", PatientSchema, {
  create: false,
});
