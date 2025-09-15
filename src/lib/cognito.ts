import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

export function getUserPool() {
  return new CognitoUserPool({
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  });
}

export function signIn(email: string, password: string) {
  const pool = getUserPool();
  const user = new CognitoUser({ Username: email, Pool: pool }); // pass email here
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
    });
  });
}

export function handleLogout() {
  const pool = getUserPool();
  const currentUser = pool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
    console.log("User logged out");
    // Optional: redirect to login page
    window.location.href = "/log-in-or-create-account/"; 
  }
}


export async function isSignedIn(): Promise<boolean> {
  if (typeof window === "undefined"){
    console.log(`window undefined`);
    
     return false;
    } // only run in browser

  const pool = getUserPool();
  const user = pool.getCurrentUser();
  if (!user){
    console.log(`user undefined`);
     return false;
    }

  return new Promise((resolve) => {
    // getSession is async and ensures the session is valid
    user.getSession((err, session) => {
      if (err) {
        console.log("Session error:", err);
        resolve(false);
      } else if (!session || !session.isValid()) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
