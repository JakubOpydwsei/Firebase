"use client"; // Ensure this is a client-side component
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getAuth } from "firebase/auth";

// Wrap the component in Suspense to handle client-side hooks like useSearchParams
function Login() {
  const [isClient, setIsClient] = useState(false); // To check if it's running on the client
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();
  const params = useSearchParams();
  const router = useRouter();
  const returnUrl = params.get("returnUrl");

  useEffect(() => {
    setIsClient(true); // Update the client-side flag after mounting
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const email = e.target["email"].value;
    const password = e.target["password"].value;

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then(() => {
        setIsLoading(false);
        if (!auth.currentUser.emailVerified) {
          router.push("/user/verify");
        } else {
          router.push(returnUrl && returnUrl.trim() ? returnUrl : "/");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMessage(error.message);
        console.error("Error during login:", error.message);
      });
  };

  if (!isClient) {
    return <div>Loading...</div>; // Render a fallback until the component is mounted
  }

  return (
    <div className="flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center">Login</h2>
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
              <span>{errorMessage}</span>
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                required
              />
            </div>

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

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrap the Login component in Suspense for proper client-side handling
export default function SuspenseLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}
