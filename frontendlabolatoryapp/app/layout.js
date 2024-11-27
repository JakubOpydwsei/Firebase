import localFont from "next/font/local";
import "./globals.css";
import Nav from "./Nav";
import Footer from "./Footer";
import { AuthProvider } from "@/app//lib/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-mono`}
      >
        <div className="flex flex-col h-screen">
          <div className="flex flex-1">
            <aside className="w-46 bg-base-300">
              <Nav />
            </aside>

            <main className="flex-1 p-4 bg-base-200 place-items-center">
            <AuthProvider>{children}</AuthProvider>
            </main>
          </div>

          <footer className="bg-base-300 p-4">
            <Footer />
          </footer>
        </div>
      </body>
    </html>
  );
}