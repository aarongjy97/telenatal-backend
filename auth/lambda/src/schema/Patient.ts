import { model, Schema } from "dynamoose";
import { Document } from "dynamoose/dist/Document";

export interface Patient extends Document {
  name: string;
  password: string;
  email: string;
}

const PatientSchema = new Schema({
  name: String,
  password: String,
  email: String
});

export const PatientModel = model<Patient>("patient", PatientSchema, {
  create: false,
});
