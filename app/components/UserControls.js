import Link from "next/link";
function UserControls() {
  return (
    <>
      <Link href="/user/signin" className="btn btn-neutral m-2">
        <li>Login</li>
      </Link>
      <Link href="/user/register" className="btn btn-neutral m-2">
        <li>Register now</li>
      </Link>
    </>
  );
}

export default UserControls;
