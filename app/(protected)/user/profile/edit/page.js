"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/lib/AuthContext";
import { updateProfile } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";
import { collection, addDoc, setDoc, getDoc, doc } from "firebase/firestore";

function EditProfile() {
  const [error, setError] = useState(null);
  const [address, setAddress] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user?.uid) return;

      const snapshot = await getDoc(doc(db, "users", user.uid));
      setAddress(snapshot.data().address || "Address not set");
    };

    fetchUserAddress();
  }, [user?.uid]);

  useEffect(() => {
    reset({
      city: address.city || "",
      street: address.street || "",
      zipCode: address.zipCode || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    });
  }, [address, user]);


  const onSubmit = async (data) => {
    updateProfile(user, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    })
      .then(() => {
        console.log("Profile updated");
        router.push("/user/profile");
      })
      .catch((e) => {
        setError(e.message);
      });

    try {
      const docRef = await setDoc(doc(db, "users", user?.uid), {
        address: {
          city: data.city,
          street: data.street,
          zipCode: data.zipCode,
        },
      });
      console.log("Document written with ID: ", docRef?.uid);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <>
      {error && (
        <div className="alert alert-error mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Display Name</span>
          </label>
          <input
            type="text"
            {...register("displayName", {
              required: "Display name is required",
            })}
            placeholder="Enter your display name"
            className={`input input-bordered w-full ${
              errors.displayName ? "input-error" : ""
            }`}
          />
          {errors.displayName && (
            <span className="text-error text-sm">
              {errors.displayName.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Photo URL</span>
          </label>
          <input
            type="text"
            {...register("photoURL", { required: "Photo URL is required" })}
            placeholder="Enter your photo URL"
            className={`input input-bordered w-full ${
              errors.photoURL ? "input-error" : ""
            }`}
          />
          {errors.photoURL && (
            <span className="text-error text-sm">
              {errors.photoURL.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span>City</span>
          </label>
          <input
            type="text"
            {...register("city", {
              required: "City is required",
            })}
            className={`input input-bordered w-full`}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span>Street</span>
          </label>
          <input
            type="text"
            {...register("street", {
              required: "Street is required",
            })}
            className={`input input-bordered w-full`}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span>zipCode</span>
          </label>
          <input
            type="text"
            {...register("zipCode", {
              required: "ZipCode is required",
            })}
            className={`input input-bordered w-full`}
          />
        </div>

        <div className="form-control">
          <button type="submit" className="btn btn-primary w-full">
            Update Profile
          </button>
        </div>
      </form>
    </>
  );
}
export default EditProfile;
