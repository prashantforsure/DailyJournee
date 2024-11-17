import React from 'react'

export default function PaperCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[190px] h-[254px] bg-transparent relative shadow-md overflow-hidden rounded-[10px] group">
      <div className="cursor-default w-full h-full relative z-[2] flex items-center justify-center text-[34px] uppercase tracking-[2px] text-[#212121] bg-[rgba(255,255,255,0.074)] border border-[rgba(255,255,255,0.222)] backdrop-blur-[20px] rounded-[10px] transition-all duration-300 ease-in-out">
        {children}
      </div>
      <div className="absolute w-[100px] h-[100px] rounded-full transition-all duration-500 linear top-[-20px] left-[-20px] bg-[rgba(125,214,66,0.603)] animate-[animFirst_5s_linear_infinite] group-hover:left-[80px] group-hover:scale-[1.2]"></div>
      <div className="absolute w-[100px] h-[100px] rounded-full transition-all duration-500 linear top-[70%] left-[70%] bg-[rgb(226,223,54)] animate-[animSecond_5s_linear_infinite] animation-delay-[3s] group-hover:left-[-10px] group-hover:scale-[1.2]"></div>
    </div>
  )
}