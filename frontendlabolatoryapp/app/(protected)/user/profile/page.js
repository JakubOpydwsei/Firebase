"use client";
import { useAuth } from "@/app/lib/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

function UserProfile() {
  const { user } = useAuth();
  
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?.uid) return;

      const snapshot = await getDoc(doc(db, "users", user.uid));
      setAddress(snapshot.data().address || "Address not set");
    };

    fetchUserAddress();
  }, [user?.uid]);

  

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

          <div className="mt-2">
            <strong>Photo:</strong>
            {user.photoURL ? (
              <>
                <br />
                <div className="avatar mt-2">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={user.photoURL} alt="Profile" />
                  </div>
                </div>
              </>
            ) : (
              " Not set"
            )}
          </div>
          <h2><strong>City: </strong> {address.city || "Not set"}</h2>
          <h2><strong>Street: </strong> {address.street || "Not set"}</h2>
          <h2><strong>ZipCode: </strong> {address.zipCode || "Not set"}</h2>
        </div>
      )}
      <Link className="btn btn-primary" href="/user/profile/edit">
        Edit profile
      </Link>
    </>
  );
}

export default UserProfile;
