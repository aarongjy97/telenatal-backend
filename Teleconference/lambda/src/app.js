import * as Chime from "aws-sdk/clients/chime";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyResult } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import * as AWS from "aws-sdk";

const region = "us-east-1";

export const lambdaHandler = async (event) => {
  try {
    const method = event.requestContext.http.method;
    switch (method) {
      case "POST":
        return await createChimeMeeting(event.queryStringParameters);
      case "DELETE":
        return await deleteChimeMeeting(event.queryStringParameters);
      case "PUT":
        return await joinChimeMeeting(event.queryStringParameters);
      default:
        return responseBuilder(500, "Unknown Error");
    }
  } catch (error) {
    console.log(error);
    return responseBuilder(500, error.message);
  }
};

function responseBuilder(statusCode, msg) {
  return {
    statusCode: statusCode,
    body: msg,
  };
}

async function createChimeMeeting() {
  AWS.config.credentials = new AWS.Credentials(acccessKeyId, secretAccessKey);
  const chime = new Chime({ region: region });
  chime.endpoint = new AWS.Endpoint(
    "https://service.chime.aws.amazon.com/console"
  );
  var meeting = await chime.createMeeting({
    ClientRequestToken: uuidv4(),
  });

  const joinInfo = {
    JoinInfo: {
      Meeting: meeting,
    },
  };

  return responseBuilder(200, JSON.stringify(meeting));
}

async function joinChimeMeeting(query) {
  AWS.config.credentials = new AWS.Credentials(acccessKeyId, secretAccessKey);
  const chime = new Chime({ region: region });
  chime.endpoint = new AWS.Endpoint(
    "https://service.chime.aws.amazon.com/console"
  );

  var meeting;
  var meetingId;

  // initialise meeting
  if (!query.meetingId) {
    //new meeting
    meetingId = uuidv4();
    meeting = await chime
      .createMeeting({
        ClientRequestToken: meetingId,
        MediaRegion: region,
        ExternalMeetingId: meetingId,
      })
      .promise();
  } else {
    //join to existing meeting
    meetingId = query.meetingId;
    meeting = await chime
      .getMeeting({
        MeetingId: meetingId,
      })
      .promise();
  }

  // add attendees
  const attendee = await chime
    .createAttendee({
      //ID of the meeting
      MeetingId: meeting.Meeting.MeetingId,
      //User ID that we want to associate to
      ExternalUserId: uuidv4(),
    })
    .promise();

  const joinInfo = {
    JoinInfo: {
      Meeting: meeting,
      Attendee: attendee,
    },
  };

  return responseBuilder(200, JSON.stringify(joinInfo));
}

async function deleteChimeMeeting(query) {
  AWS.config.credentials = new AWS.Credentials(acccessKeyId, secretAccessKey);
  const chime = new Chime({ region: region });
  chime.endpoint = new AWS.Endpoint(
    "https://service.chime.aws.amazon.com/console"
  );

  await chime.deleteMeeting({
    MeetingId: query.meetingId,
  });
  return responseBuilder(200, "successfully deleted chime meeting");
}
