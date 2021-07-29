import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { Clinic, ClinicModel, ProfessionalModel } from "./schema/Clinic";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const data =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    switch (event.httpMethod) {
      case "POST":
        switch (event.requestContext.resourcePath) {
          case "/clinic":
            return await createClinic(data);
          default:
            return responseBuilder(500, "Unknown Error");
        }
      case "GET":
        switch (event.requestContext.resourcePath) {
          case "/clinic":
            return await getClinic(event.queryStringParameters);
          case "/clinics":
            return await getClinics();
          case "/clinic/professionals":
            return await getProfessionals(event.queryStringParameters);
          default:
            return responseBuilder(500, "Unknown Error");
        }
      case "PUT":
        return updateClinic(data);
      default:
        return responseBuilder(500, "Unknown Error");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

async function createClinic(data: any): Promise<APIGatewayProxyResult> {
  const fields = data as Clinic;
  fields.clinicId = uuidv4();
  const clinic = new ClinicModel(fields);
  await clinic.save();
  return responseBuilder(202, fields.clinicId);
}

async function updateClinic(data: any): Promise<APIGatewayProxyResult> {
  const clinic = data as Clinic;
  const { clinicId } = clinic;

  const clinicToUpdate = await ClinicModel.get(clinicId);

  if (!clinicToUpdate) {
    return responseBuilder(500, "Clinic not found");
  }

  delete data.clinicId;
  await ClinicModel.update({ clinicId: clinicId }, data);
  return responseBuilder(202, `Clinic ${clinicId} successfully updated`);
}

async function getClinics(): Promise<APIGatewayProxyResult> {
  const clinics = await ClinicModel.scan().exec();
  return responseBuilder(200, JSON.stringify(clinics));
}

async function getClinic(data: any) {
  const { clinicId } = data;
  const clinic = await ClinicModel.get(clinicId);
  return clinic
    ? responseBuilder(200, JSON.stringify(clinic))
    : responseBuilder(500, "Clinic not found");
}

async function getProfessionals(data: any) {
  const { clinicId } = data;
  const clinic = await ClinicModel.get(clinicId);

  if (!clinic) return responseBuilder(500, "Clinic not found");

  const professionals = await ProfessionalModel.scan()
    .where("clinicId")
    .eq(clinicId)
    .exec();
  return responseBuilder(
    200,
    JSON.stringify(
      professionals.map((professional) => {
        delete professional.password;
        return professional;
      })
    )
  );
}

function responseBuilder(
  statusCode: number,
  msg: string
): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    },
    body: msg,
  };
}
