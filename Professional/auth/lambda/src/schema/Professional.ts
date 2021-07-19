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

export const ProfessionalModel = model<Professional>(
  "professional",
  ProfessionalSchema,
  {
    create: false,
  }
);
