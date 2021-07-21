import { model, Schema } from "dynamoose";
import { Document } from "dynamoose/dist/Document";

export interface Professional extends Document {
  email: string;
  type: "doctor" | "nurse";
  name: string;
  phone: string;
  education: string;
  medicalLicenseNo: string;
  clinicId: string;
  password: string;
  clinic?: Clinic;
}

const ProfessionalSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    validate: (val) => val === "doctor" || val === "nurse",
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  medicalLicenseNo: {
    type: String,
    required: true,
  },
  clinicId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export interface Clinic extends Document {
  clinicId?: string;
  clinicName: string;
  clinicAddress: string;
  clinicPostalCode: number;
}

export const ClinicSchema = new Schema({
  clinicId: {
    type: String,
    required: true,
  },
  clinicName: {
    type: String,
    required: true,
  },
  clinicAddress: {
    type: String,
    required: true,
  },
  clinicPostalCode: {
    type: Number,
    required: true,
  },
});

export const ProfessionalModel = model<Professional>(
  "professional",
  ProfessionalSchema,
  {
    create: false,
  }
);

export const ClinicModel = model<Clinic>("clinic", ClinicSchema, {
  create: false,
});