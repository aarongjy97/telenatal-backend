import { model, Schema } from "dynamoose";
import { Document } from "dynamoose/dist/Document";

export interface Patient extends Document {
  name: string,
  password: string,
  email: string,
  phone: string,
  dob: Date,
  address: string,
  postalCode: Number,
  allergies?: Allergy[],
  healthConditions?: HealthCondition[],
  babies?: Baby[]
}

const PatientSchema = new Schema({
  name: String,
  password: String,
  email: String,
  phone: String,
  dob: Date,
  address: String,
  postalCode: Number,
});

export interface Allergy extends Document {
  allergyId: string,
  name: string,
  description: string,
  patientId: string
}

const AllergySchema = new Schema({
  allergyId: String,
  name: String,
  description: String,
  patientId: String
})

export interface HealthCondition extends Document {
  healthConditionId: string,
  name: string,
  description: string,
  patientId: string
}

const HealthConditionSchema = new Schema({
  healthConditionId: String,
  name: String,
  description: String,
  patientId: String
})

export interface Baby extends Document {
  babyId: string,
  patientId: string,
  dueDate: Date,
  babyName: string,
  isBorn: boolean
}

const BabySchema = new Schema({
  babyId: String,
  patientId: String,
  dueDate: Date,
  babyName: String,
  isBorn: Boolean
})

export const PatientModel = model<Patient>("patient", PatientSchema, {
  create: false,
});

export const AllergyModel = model<Allergy>("allergy", AllergySchema, {
  create: false,
})

export const HealthConditionModel = model<HealthCondition>("health-condition", HealthConditionSchema, {
  create: false,
})

export const BabyModel = model<Baby>("babies", BabySchema, {
  create: false,
})
