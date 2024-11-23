import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="text-primary-content p-10">
        <ul className="menu bg-base-300 rounded-box w-56 p-2">
          <Link href="/user/signin" className="btn btn-neutral m-2">
            <li>Login</li>
          </Link>
          <Link href="/user/register" className="btn btn-neutral m-2">
            <li>Register now</li>
          </Link>
        </ul>
      </div>
    </>
  );
}
