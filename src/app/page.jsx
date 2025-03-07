import Hero from "@/components/home/Hero";
import JoinUs from "@/components/home/JoinUs";
import Networks from "@/components/home/Networks";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="page-wrapper flex flex-col justify-start items-center w-full overflow-hidden">
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <Networks />
      <JoinUs />
      <Footer />
    </div>
  );
}
