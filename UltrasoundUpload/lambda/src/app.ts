import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3 } from 'aws-sdk';
import { AppointmentModel } from "./schema/Ultrasound";

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {    
    const s3 = new S3();
    switch (event.httpMethod) {
      case "POST":
        return uploadImage(s3, JSON.parse(event.body));
      default:
        return responseBuilder(404, "Method not found");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

async function uploadImage(s3: S3, data: any): Promise<APIGatewayProxyResult> {
  try {
    const { patientId, appointmentId, ultrasound } = data;

    const appointment = await AppointmentModel.get(appointmentId);

    if (appointment) {
      
      const key = `ultrasound/${appointment.patientId}/${appointmentId}/ultrasound.png`;

      await s3.putObject({
        "Body": Buffer.from(ultrasound, 'base64'),
        "Bucket": 'telehealth-ultrasound',
        "Key": key,
      }).promise();

      appointment.imagePath = key;

      delete appointment.appointmentId;
      await AppointmentModel.update({ appointmentId: appointmentId }, appointment);
    
      return responseBuilder(200, 'Uploading of image successful');

    } else {
      return responseBuilder(500, 'Appointment not found');
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
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
