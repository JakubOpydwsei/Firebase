"use client"
import { useForm } from "react-hook-form";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function LogoutForm() {
  const { handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = () => {
    signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Logout</h2>
          <p>Are you sure you want to log out?</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
            <button type="submit" className="btn btn-error w-full">
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
