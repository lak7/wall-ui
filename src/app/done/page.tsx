import React from "react";

const Page = () => {
  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center items-center p-1 pt-20 w-full px-8 text-green-500 text-5xl">
        DONE
      </div>
    </div>
  );
};

export default Page;
