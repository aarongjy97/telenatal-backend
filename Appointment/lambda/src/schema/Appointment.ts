import { model, Schema } from "dynamoose";
import { Document } from "dynamoose/dist/Document";

export interface Appointment extends Document {
  appointmentId?: string;
  date: Date;
  location: string;
  postalCode: number;
  purpose?: string;
  remarks?: string;
  notes?: string;

  patientId: string;
  professionalId: string;

  patientName: string;
  professionalName: string;

  meetingId?: string;

  consultationRecord?: ConsultationRecord;
  healthRecord?: HealthRecord;
  testRecord?: TestRecord;
  ultrasoundRecord?: UltrasoundRecord;
  imagePath?: string;
  imageBuffer?: Buffer;
}

export interface TestRecord extends Document {
  time?: Date;
  testName?: string;
  notes?: string;
}

export interface HealthRecord extends Document {
  weight?: number;
  waistMeasurement?: number;
  heartRate?: number;
  bloodPressure?: number;
  notes?: string;
  dateTime?: Date;
}

export interface ConsultationRecord extends Document {
  diagnosis?: string;
  medication?: string;
  notes?: string;
}

export interface UltrasoundRecord extends Document {
  center_x_mm?: number;
  center_y_mm?: number;
  semi_axes_a_mm?: number;
  semi_axes_b_mm?: number;
  angle_rad?: number;
}

const AppointmentSchema = new Schema({
  appointmentId: {
    type: String,
    required: true,
  },
  date: Date,
  location: {
    type: String,
    required: true,
  },
  postalCode: Number,
  purpose: String,
  remarks: String,
  notes: String,
  meetingId: String,

  patientName: {
    type: String,
    required: true,
  },
  professionalName: {
    type: String,
    required: true,
  },

  patientId: {
    type: String,
    required: true,
  },
  professionalId: {
    type: String,
    required: true,
  },

  healthRecord: {
    type: Object,
    schema: {
      weight: Number,
      waistMeasurement: Number,
      heartRate: Number,
      bloodPressure: Number,
      notes: String,
      dateTime: Date,
    },
  },
  
  testRecord: {
    type: Object,
    schema: {
      time: Date,
      testName: String,
      notes: String
    }
  },

  consultationRecord: {
    type: Object,
    schema: {
      diagnosis: String,
      medication: String,
      notes: String,
    },
  },

  imagePath: String,

  ultrasoundRecord: {
    type: Object,
    schema: {
      center_x_mm: Number,
      center_y_mm: Number,
      semi_axes_a_mm: Number,
      semi_axes_b_mm: Number,
      angle_rad: Number,
    }
  }
});

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

export interface Professional extends Document {
  email: string;
  type: "doctor" | "nurse";
  name: string;
  phone: string;
  education: string;
  medicalLicenseNo: string;
  clinicId: string;
  password?: string;
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

export const PatientModel = model<Patient>("patient", PatientSchema, {
  create: false,
});

export const AppointmentModel = model<Appointment>(
  "appointments",
  AppointmentSchema,
  {
    create: false,
  }
);

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