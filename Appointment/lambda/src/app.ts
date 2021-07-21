import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  Appointment,
  AppointmentModel,
  PatientModel,
  ProfessionalModel
} from "./schema/Appointment";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const data =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    console.log(event);

    switch (method) {
      case "POST":
        return await createAppointment(data);
      case "GET":
        switch (event.requestContext.resourcePath) {
          case "/appointment":
            return await retrieveAppointment(event.queryStringParameters);
          case "/appointments/patient":
            return await retrievePatientAppointments(
              event.queryStringParameters
            );
          case "/appointments/patient/upcoming":
            return await retrieveUpcomingPatientAppointments(
              event.queryStringParameters
            );
          case "/appointments/professional":
            return await retrieveProfessionalAppointments(
              event.queryStringParameters
            );
          case "/appointments/professional/upcoming":
            return await retrieveUpcomingProfessionalAppointments(
              event.queryStringParameters
            );
          case "/professional/doctors":
            return await retrieveDoctors();
          case "/professional/nurses":
            return await retrieveNurses();
          case "/professional/availability":
            return await getProfessionalAvailability(
              event.queryStringParameters
            );
          default:
            return responseBuilder(500, "not built yet");
        }
      case "PUT":
        return await updateAppointment(data);
      case "DELETE":
        return await deleteAppointment(data);
      case "OPTIONS":
        return responseBuilder(202, "");
      default:
        return responseBuilder(500, "Unknown Error");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

async function createAppointment(data: any): Promise<APIGatewayProxyResult> {
  const fields = data as Appointment;

  const queryPatient = await PatientModel.get(fields.patientId);

  const queryProfessional = await ProfessionalModel.get(fields.professionalId);

  if (!queryPatient) {
    return responseBuilder(500, "Patient not found");
  }

  if (!queryProfessional) {
    return responseBuilder(500, "Professional not found");
  }

  fields.patientName = queryPatient.name;
  fields.professionalName = queryProfessional.name;
  fields.appointmentId = uuidv4();
  fields.date = new Date(fields.date);

  const appointment = new AppointmentModel(fields);
  await appointment.save();

  return responseBuilder(
    202,
    `Appointment between ${fields.patientName} and ${fields.professionalName} on ${fields.date} created`
  );
}

async function updateAppointment(data: any): Promise<APIGatewayProxyResult> {
  const appointment = data as Appointment;
  const { appointmentId } = appointment;

  const appointmentToUpdate = await AppointmentModel.get(appointmentId);

  if (!appointmentToUpdate) {
    return responseBuilder(500, "Appointment not found");
  }

  appointment.date = new Date(appointment.date);

  delete data.appointmentId;
  await AppointmentModel.update({ appointmentId: appointmentId }, data);
  return responseBuilder(
    202,
    `Appointment ${appointmentId} successfully updated`
  );
}

async function deleteAppointment(data: any): Promise<APIGatewayProxyResult> {
  const appointment = data as Appointment;
  await AppointmentModel.delete({ appointmentId: appointment.appointmentId });
  return responseBuilder(
    202,
    `Appointment ${appointment.appointmentId} successfully deleted`
  );
}

async function retrieveAppointment(data: any): Promise<APIGatewayProxyResult> {
  const { appointmentId } = data;
  const appointment = await AppointmentModel.get(appointmentId);

  if (!appointment) {
    return responseBuilder(500, "Appointment not found");
  }

  return responseBuilder(200, JSON.stringify(appointment));
}

async function retrievePatientAppointments(
  data: any
): Promise<APIGatewayProxyResult> {
  const { patientId } = data;
  const appointments = await AppointmentModel.scan()
    .where("patientId")
    .eq(patientId)
    .exec();
  return responseBuilder(
    200,
    JSON.stringify(
      appointments.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      })
    )
  );
}

async function retrieveProfessionalAppointments(
  data: any
): Promise<APIGatewayProxyResult> {
  const { professionalId } = data;
  const appointments = await AppointmentModel.scan()
    .where("professionalId")
    .eq(professionalId)
    .exec();
  return responseBuilder(
    200,
    JSON.stringify(
      appointments.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      })
    )
  );
}

async function retrieveDoctors(): Promise<APIGatewayProxyResult> {
  const doctors = await ProfessionalModel.scan()
    .where("type")
    .eq("doctor")
    .exec();
  return responseBuilder(
    200,
    JSON.stringify(
      doctors.map((doctor) => {
        delete doctor.password;
        return doctor;
      })
    )
  );
}

async function retrieveNurses(): Promise<APIGatewayProxyResult> {
  const nurses = await ProfessionalModel.scan()
    .where("type")
    .eq("nurse")
    .exec();
  return responseBuilder(
    200,
    JSON.stringify(
      nurses.map((nurse) => {
        delete nurse.password;
        return nurse;
      })
    )
  );
}

async function retrieveUpcomingProfessionalAppointments(
  data: any
): Promise<APIGatewayProxyResult> {
  const { professionalId } = data;
  const appointments = await AppointmentModel.scan()
    .where("professionalId")
    .eq(professionalId)
    .exec();

  const upcoming = appointments.filter((appt) => {
    return new Date().getTime() - appt.date.getTime() <= 3600000;
  });

  return responseBuilder(200, JSON.stringify(upcoming));
}

async function retrieveUpcomingPatientAppointments(
  data: any
): Promise<APIGatewayProxyResult> {
  const { patientId } = data;
  const appointments = await AppointmentModel.scan()
    .where("patientId")
    .eq(patientId)
    .exec();

  const upcoming = appointments.filter((appt) => {
    return new Date().getTime() - appt.date.getTime() <= 3600000;
  });

  return responseBuilder(200, JSON.stringify(upcoming));
}

async function getProfessionalAvailability(
  data: any
): Promise<APIGatewayProxyResult> {
  const { date, professionalId } = data;

  let queryDate = new Date(date);

  console.log(queryDate.toLocaleDateString("en-SG"));

  /* Queries all appts first (no time to research how to query on same day only) */
  const appointments = await AppointmentModel.scan()
    .where("professionalId")
    .eq(professionalId)
    .exec();

  const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  const bookedSlots = appointments
    .filter((appt) => datesAreOnSameDay(appt.date, queryDate))
    .map((appt) => appt.date.getTime());

  console.log(bookedSlots);

  const fixedTimeslots = [
    [0, 0, 0, 0],
    [0, 30, 0, 0],
    [1, 0, 0, 0],
    [1, 30, 0, 0],
    [2, 0, 0, 0],
    [2, 30, 0, 0],
    [3, 0, 0, 0],
    [3, 30, 0, 0],
    [4, 0, 0, 0],
    [4, 30, 0, 0],
    [5, 0, 0, 0],
    [5, 30, 0, 0],
    [6, 0, 0, 0],
    [6, 30, 0, 0],
    [7, 0, 0, 0],
    [7, 30, 0, 0],
    [8, 0, 0, 0],
    [8, 30, 0, 0],
    [9, 0, 0, 0],
    [9, 30, 0, 0],
    [10, 0, 0, 0],
  ];

  const timeslots = fixedTimeslots
    .map(
      (slot) =>
        new Date(queryDate.setUTCHours(slot[0], slot[1], slot[2], slot[3]))
    )
    .map((slot) => slot.getTime());

  const availSlots = timeslots
    .filter((slot) => !bookedSlots.includes(slot))
    .map((slot) => new Date(slot));

  return responseBuilder(200, JSON.stringify(availSlots));
}

function responseBuilder(
  statusCode: number,
  msg: string
): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PUT, GET, DELETE OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    },
    body: msg,
  };
}
