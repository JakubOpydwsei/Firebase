"use client";
import { useAuth } from "@/app/lib/AuthContext";
function VerifyEmail() {
  const { user } = useAuth();
  return (
    <>
      <h1>
        Email not verified. Verify clicking on link in email send to your
        address {user?.email}
      </h1>
    </>
  );
}

export default VerifyEmail;
