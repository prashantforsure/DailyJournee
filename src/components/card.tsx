import React from 'react'

interface CardProps {
  title: string
  description: string
  icon?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ title, description, icon }) => {
  return (
    <div className="relative max-w-[300px] max-h-[320px] bg-gradient-to-b from-[#c3e6ec] to-[#a7d1d9] rounded-lg p-6 m-3 overflow-hidden z-0 font-sans transition-all duration-300 ease-out group">
      <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#364a60] to-[#384c6c] h-8 w-8 rounded-full transform scale-100 origin-center transition-transform duration-300 ease-out z-[-1] group-hover:scale-[28]"></div>
      <p className="text-[#262626] text-2xl font-bold mb-2 transition-colors duration-500 ease-out group-hover:text-white">{title}</p>
      <p className="text-base font-normal leading-6 text-[#452c2c] transition-colors duration-500 ease-out group-hover:text-white/80">{description}</p>
      {icon && <div className="absolute bottom-4 left-4">{icon}</div>}
      <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 overflow-hidden bg-gradient-to-br from-[#6293c8] to-[#384c6c] rounded-bl-2xl rounded-tr-lg">
        <div className="-mt-1 -mr-1 text-white font-mono">→</div>
      </div>
    </div>
  )
}

export default Card