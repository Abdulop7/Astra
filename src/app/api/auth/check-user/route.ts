import { cognitoClient } from "@/lib/cognitoClient";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const command = new AdminGetUserCommand({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      Username: email,
    });

    try {
      await cognitoClient.send(command);
      return NextResponse.json({ exists: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "UserNotFoundException") {
        return NextResponse.json({ exists: false });
      }
      if(err instanceof Error) return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (err:unknown) {
    if(err instanceof Error) return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
