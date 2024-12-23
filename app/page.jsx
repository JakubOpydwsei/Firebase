"use client";
import Link from "next/link";
import { useAuth } from "./lib/AuthContext";
import UserControls from "./components/UserControls";

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <div className="text-primary-content p-10">
        <ul className="menu bg-base-300 rounded-box w-56 p-2">
          {user ? (
            <Link
              href="/user/signout"
              className="btn btn-neutral m-2"
            >
              <li>Sign out</li>
            </Link>
          ) : (
              <UserControls/>
          )}
        </ul>
      </div>
    </>
  );
}
