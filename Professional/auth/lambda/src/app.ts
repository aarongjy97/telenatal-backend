import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import { ClinicModel, Professional, ProfessionalModel } from "./schema/Professional";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {    
    switch (event.requestContext.resourcePath) {
      case "/auth/professional/register":
        const registerData = JSON.parse(event.body);
        return await register(registerData);
      case "/auth/professional/login":
        const loginData = JSON.parse(event.body);
        return await login(loginData);
      default:
        return responseBuilder(500, "Unknown Error");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

async function login(data: any): Promise<APIGatewayProxyResult> {
  const { email, password } = data;
  const professional = await ProfessionalModel.get(email);

  if (professional) {
    const passwordCheck = await bcrypt.compare(password, professional.password);

    if (passwordCheck) {
      delete professional.password;
      professional.clinic = await ClinicModel.get(professional.clinicId);
      return responseBuilder(200, JSON.stringify(professional));
    } else {
      return responseBuilder(401, "Invalid credentials");
    }
  } else {
    return responseBuilder(401, "User not found");
  }
}

async function register(data: any): Promise<APIGatewayProxyResult> {
  const fields = data as Professional;

  const query = await ProfessionalModel.get(fields.email)

  if (query) {
    return responseBuilder(422, "User already exists");
  }

  const clinic = await ClinicModel.get(fields.clinicId);

  if (!clinic) {
    return responseBuilder(500, "Clinic not found");
  }

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(fields.password, salt);
  fields.password = hash;
  const professional = new ProfessionalModel(fields);
  await professional.save();

  return responseBuilder(
    202,
    `Professional ${fields.email} successfully registered`
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
