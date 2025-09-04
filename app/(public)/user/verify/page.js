"use client";
import { useAuth } from "@/app/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useEffect, useState } from "react";

function VerifyEmail() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      if (!user.emailVerified) {
        signOut(auth)
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }, [user]);

  return (
    <>
      {!user?.emailVerified ? (
        <h1>
          Email not verified. Please verify by clicking the link sent to your
          address {email}.
        </h1>
      ) : (
        <h1>Your email is verified!</h1>
      )}
    </>
  );
}

export default VerifyEmail;
