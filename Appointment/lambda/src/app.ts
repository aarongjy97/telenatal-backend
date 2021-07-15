import { APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  Appointment,
  AppointmentModel,
  PatientModel,
  ProfessionalModel
} from "./schema/Appointment";

export const lambdaHandler = async (
  event: any
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.requestContext.http.method;
    const data =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    console.log(event);

    switch (method) {
      case "POST":
        return await createAppointment(data);
      case "GET":
        switch (event.requestContext.http.path) {
          case "/appointment":
            return await retrieveAppointment(data);
          case "/appointments/patient":
            return await retrievePatientAppointments(data);
          case "/appointments/professional":
            return responseBuilder(500, "professional not built yet");
          default:
            return responseBuilder(500, "not built yet");
        }
      case "PUT":
        return await updateAppointment(data);
      case "DELETE":
        return await deleteAppointment(data);
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

  const queryPatient = await PatientModel.scan("email")
    .eq(fields.patientId)
    .limit(1)
    .exec();

  const queryProfessional = await ProfessionalModel.scan("email")
    .eq(fields.professionalId)
    .limit(1)
    .exec();

  if (queryPatient.length === 0) {
    return responseBuilder(500, "Patient not found");
  }

  if (queryProfessional.length == 0) {
    return responseBuilder(500, "Professional not found");
  }

  fields.appointmentId = uuidv4();
  const allergy = new AppointmentModel(fields);
  await allergy.save();

  return responseBuilder(
    202,
    `Appointment between ${fields.patientId} and ${fields.professionalId} on ${fields.date} created`
  );
}

async function updateAppointment(data: any): Promise<APIGatewayProxyResult> {
  const appointment = data as Appointment;
  const { appointmentId } = appointment;
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
    body: msg,
  };
}
