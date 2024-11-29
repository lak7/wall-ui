"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const videoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleVideoEnd = () => {
        router.push("/connect");
      };

      video.addEventListener("ended", handleVideoEnd);

      return () => {
        video.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [router]);

  return (
    <div className="relative w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-50"
        autoPlay
        muted
        playsInline
      >
        <source src="/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback background that will show after video ends or if video fails */}
      <div
        className="absolute top-0 left-0 w-full h-full z-[-1]"
        style={{
          backgroundImage: "url(/connect-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
