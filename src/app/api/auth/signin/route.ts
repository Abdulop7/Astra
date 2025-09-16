import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION!,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        // If your client has a secret: add SECRET_HASH here
      },
    });

    const response = await cognitoClient.send(command);

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {

    if(error instanceof Error) return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
