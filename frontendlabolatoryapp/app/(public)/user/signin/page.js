"use client";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

function login() {
  const auth = getAuth();
  const params = useSearchParams();
  const router = useRouter();
  const returnUrl = params.get("returnUrl");

  const [errorMessage, setErrorMessage] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    const email = e.target["name"].value;
    const password = e.target["password"].value;
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            if (
              !returnUrl ||
              typeof returnUrl !== "string" ||
              returnUrl.trim() === ""
            ) {
              router.push("/");
            } else {
              router.push(returnUrl);
            }
          })
          .catch((error) => {
            const errorCode = error.code;
            setErrorMessage(error.message);
            console.error(errorCode, errorMessage);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <div className="flex items-center justify-center  bg-base-200">
        <div className="card w-96 bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 lassname="card-title">Login</h2>
            {errorMessage && (
              <div role="alert" className="alert alert-error mt-4">
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
                <span>Error has occurred during login process</span>
              </div>
            )}
            <form onSubmit={onSubmit}>
              {/* <!-- Email Field --> */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="name"
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* <!-- Password Field --> */}
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* <!-- Submit Button --> */}
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default login;
