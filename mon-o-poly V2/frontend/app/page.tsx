import Feed from "@/components/Feed";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="h-screen w-full bg-[#0E091C] text-white relative">
      <Navbar />
      <Feed />
    </main>
  );
}
