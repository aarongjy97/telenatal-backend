import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { PatientModel } from './schema/Patient';

export const lambdaHandler = async (
  event: any
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.requestContext.http.method;

    switch (method) {
      case 'POST':
        const registerData = JSON.parse(event.body);
        break;
      case 'GET':
        const loginData = JSON.parse(event.body);
        return await login(loginData);
        break;
      case 'PUT':
        return responseBuilder(500, 'Not built')
      case 'DELETE':
        return responseBuilder(500, 'Not built')
      default:
        return responseBuilder(500, 'Unknown Error');
    }
  } catch (error) {
    return responseBuilder(500, JSON.stringify(error));
  }
}

async function login(data: any) : Promise<APIGatewayProxyResult> {
  const { email, password } = data;
  const patient = await PatientModel.scan("email").eq(email).exec();
  return responseBuilder(200, JSON.stringify(patient));
}

function responseBuilder(statusCode: number, msg: string) : APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    body: msg
  };
}