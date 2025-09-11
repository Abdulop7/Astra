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
    } catch (err: any) {
      if (err.name === "UserNotFoundException") {
        return NextResponse.json({ exists: false });
      }
      console.log(err.message);
      
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
