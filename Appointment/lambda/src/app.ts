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

    const params = event.queryStringParameters;

    console.log(event);

    switch (method) {
      case "POST":
        return await createAppointment(data);
      case "GET":
        switch (event.requestContext.resourcePath) {
          case "/appointment":
            return await retrieveAppointment(event.queryStringParameters);
          case "/appointments/patient":
            return await retrievePatientAppointments(event.queryStringParameters);
          case "/appointments/professional":
            return responseBuilder(500, "professional not built yet");
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
  return responseBuilder(200, JSON.stringify(appointments));
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
