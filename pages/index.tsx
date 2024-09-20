import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main>
      <h2>Welcome to My SmartChat App</h2>
      <a href="/login">Login</a>
      <br/>
      <a href="/register">Signup</a>
    </main>
  );
}
