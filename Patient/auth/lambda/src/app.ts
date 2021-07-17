import { APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import { Patient, PatientModel } from "./schema/Patient";

export const lambdaHandler = async (
  event: any
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.requestContext.http.method;

    switch (method) {
      case "POST":
        const registerData = JSON.parse(event.body);
        return await register(registerData);
      case "GET":
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
  const patient = await PatientModel.get(email);

  if (patient) {
    const passwordCheck = await bcrypt.compare(password, patient.password);

    if (passwordCheck) {
      patient.password = "";
      return responseBuilder(200, JSON.stringify(patient));
    } else {
      return responseBuilder(401, "Invalid credentials");
    }
  } else {
    return responseBuilder(401, "User not found");
  }
}

async function register(data: any): Promise<APIGatewayProxyResult> {
  const fields = data as Patient;

  const query = await PatientModel.scan("email")
    .eq(fields.email)
    .limit(1)
    .exec();

  if (query.length != 0) {
    return responseBuilder(422, "User already exists");
  }

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(fields.password, salt);
  fields.password = hash;
  const patient = new PatientModel(fields);
  await patient.save();

  return responseBuilder(
    202,
    `Patient ${fields.email} successfully registered`
  );
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
