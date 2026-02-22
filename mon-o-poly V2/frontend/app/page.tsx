import Feed from "@/components/Feed";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="h-screen w-full bg-black text-white relative">
      <Navbar />
      <Feed />
    </main>
  );
}
