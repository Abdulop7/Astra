import { NextResponse } from "next/server";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../../../lib/cognitoClient"; // 👈 your configured Cognito client

export async function POST(req: Request) {
  try {
    const { email, password,name } = await req.json();

    const command = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!, // app client id from Cognito
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name }
      ],
    });

    const response = await cognitoClient.send(command);

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    if(error instanceof Error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
