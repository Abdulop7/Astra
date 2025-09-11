import { NextResponse } from "next/server";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../../../lib/cognitoClient"; // 👈 your configured Cognito client

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const command = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!, // app client id from Cognito
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
      ],
    });

    const response = await cognitoClient.send(command);

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
