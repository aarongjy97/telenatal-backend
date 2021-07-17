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
  allergies?: Allergy[];
  healthConditions?: HealthCondition[];
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
});

export interface Allergy extends Document {
  allergyId?: string;
  name: string;
  description: string;
  patientId: string;
}

const AllergySchema = new Schema({
  allergyId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  patientId: { type: String, required: true },
});

export interface HealthCondition extends Document {
  healthConditionId: { type: String; required: true };
  name: { type: String; required: true };
  description: { type: String; required: true };
  patientId: { type: String; required: true };
}

const HealthConditionSchema = new Schema({
  healthConditionId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  patientId: { type: String, required: true },
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

export const AllergyModel = model<Allergy>("allergy", AllergySchema, {
  create: false,
});

export const HealthConditionModel = model<HealthCondition>(
  "health-condition",
  HealthConditionSchema,
  {
    create: false,
  }
);

export const BabyModel = model<Baby>("babies", BabySchema, {
  create: false,
});
