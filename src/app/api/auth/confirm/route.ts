import { NextResponse } from "next/server";
import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../../../lib/cognitoClient";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      Username: email,
      ConfirmationCode: code,
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
