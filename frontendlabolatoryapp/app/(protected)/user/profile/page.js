"use client";
import { useAuth } from "@/app/lib/AuthContext";
import Link from "next/link";

function UserProfile() {
  const { user } = useAuth();

  return (
    <>
      {user && (
        <div className="mt-6 p-4 bg-base-300 text-center space-y-2 rounded-lg shadow">
          <h2 className="text-lg font-bold">Your Profile</h2>
          <p>
            <strong>Display Name:</strong> {user.displayName || "Not set"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "Not available"}
          </p>
          {user.photoURL && (
            <div className="mt-2">
              <strong>Photo:</strong>
              <br />
              <div className="avatar mt-2">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={user.photoURL} alt="Profile" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Link className="btn btn-primary" href="/user/profile/edit">
        Edit profile
      </Link>
    </>
  );
}

export default UserProfile;
