import React from 'react';

export const BotanicalBackdrop: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Deep radial ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-b from-emerald-950/20 via-amber-950/15 to-transparent blur-[120px] rounded-full animate-glow-pulse" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[350px] bg-emerald-950/25 blur-[100px] rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[350px] bg-amber-950/20 blur-[100px] rounded-full" />

      {/* 2. Swaying botanical wildflower silhouettes */}
      <div className="absolute bottom-0 inset-x-0 h-[480px] sm:h-[580px] flex items-end justify-between px-2 sm:px-12 opacity-65">
        {/* Left Botanical Cluster (Wild Cow Parsley / Umbel & Stems) */}
        <div className="w-[320px] sm:w-[460px] h-full animate-sway-1 origin-bottom-left shrink-0">
          <svg
            viewBox="0 0 400 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-contain object-bottom filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          >
            {/* Primary curved stem */}
            <path
              d="M120 500 Q 150 320 220 180 T 260 50"
              stroke="#524332"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Secondary branch */}
            <path
              d="M180 260 Q 230 200 290 120"
              stroke="#43392D"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M150 340 Q 90 280 60 190"
              stroke="#3D372E"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Umbel wildflower flowerhead radiating rays (Top) */}
            <g stroke="#8A6B47" strokeWidth="1.2" opacity="0.85">
              <line x1="260" y1="50" x2="210" y2="20" />
              <line x1="260" y1="50" x2="235" y2="10" />
              <line x1="260" y1="50" x2="260" y2="5" />
              <line x1="260" y1="50" x2="285" y2="10" />
              <line x1="260" y1="50" x2="310" y2="22" />
              <line x1="260" y1="50" x2="330" y2="45" />
              {/* Petal cluster beads */}
              <circle cx="210" cy="20" r="2.5" fill="#C59B63" />
              <circle cx="235" cy="10" r="3" fill="#E6BA7E" />
              <circle cx="260" cy="5" r="3.5" fill="#FDE68A" />
              <circle cx="285" cy="10" r="3" fill="#E6BA7E" />
              <circle cx="310" cy="22" r="2.5" fill="#C59B63" />
              <circle cx="330" cy="45" r="2" fill="#A27D4C" />
            </g>
            {/* Branch Umbel 2 */}
            <g stroke="#655541" strokeWidth="1" opacity="0.75">
              <line x1="290" y1="120" x2="270" y2="85" />
              <line x1="290" y1="120" x2="300" y2="80" />
              <line x1="290" y1="120" x2="325" y2="90" />
              <circle cx="270" cy="85" r="2" fill="#A27D4C" />
              <circle cx="300" cy="80" r="2.5" fill="#C59B63" />
              <circle cx="325" cy="90" r="2" fill="#A27D4C" />
            </g>
            {/* Left Umbel 3 */}
            <g stroke="#564D3F" strokeWidth="1" opacity="0.7">
              <line x1="60" y1="190" x2="35" y2="160" />
              <line x1="60" y1="190" x2="60" y2="150" />
              <line x1="60" y1="190" x2="85" y2="165" />
              <circle cx="35" cy="160" r="2" fill="#78664D" />
              <circle cx="60" cy="150" r="2.5" fill="#A27D4C" />
              <circle cx="85" cy="165" r="2" fill="#78664D" />
            </g>
            {/* Delicate fern leaflets */}
            <path
              d="M130 450 Q 170 430 190 410"
              stroke="#3A4432"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M110 470 Q 70 440 50 410"
              stroke="#303A2B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Center-Left Whispering Grasses */}
        <div className="hidden md:block w-[180px] h-[380px] animate-sway-3 origin-bottom shrink-0 opacity-40">
          <svg viewBox="0 0 160 380" fill="none" className="w-full h-full">
            <path d="M80 380 Q 90 220 120 100 T 140 30" stroke="#3E4A35" strokeWidth="1.5" />
            <path d="M70 380 Q 60 250 40 140 T 25 70" stroke="#333D2D" strokeWidth="1.2" />
            <circle cx="140" cy="30" r="2" fill="#849673" />
            <circle cx="25" cy="70" r="1.5" fill="#69775B" />
          </svg>
        </div>

        {/* Center-Right Whispering Golden Flower Head */}
        <div className="hidden lg:block w-[200px] h-[440px] animate-sway-1 origin-bottom shrink-0 opacity-45">
          <svg viewBox="0 0 180 440" fill="none" className="w-full h-full">
            <path d="M90 440 Q 80 270 110 130 T 130 40" stroke="#5C4D38" strokeWidth="1.8" />
            <g stroke="#96774C" strokeWidth="1">
              <line x1="130" y1="40" x2="105" y2="15" />
              <line x1="130" y1="40" x2="130" y2="5" />
              <line x1="130" y1="40" x2="155" y2="18" />
              <circle cx="105" cy="15" r="2" fill="#D4AF37" />
              <circle cx="130" cy="5" r="2.5" fill="#F3E5AB" />
              <circle cx="155" cy="18" r="2" fill="#D4AF37" />
            </g>
          </svg>
        </div>

        {/* Right Botanical Cluster (Tall Whispering Stems & Wildflower Beads) */}
        <div className="w-[300px] sm:w-[440px] h-full animate-sway-2 origin-bottom-right shrink-0">
          <svg
            viewBox="0 0 400 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-contain object-bottom filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          >
            {/* Primary arching stem */}
            <path
              d="M280 500 Q 250 330 180 190 T 140 45"
              stroke="#584936"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Secondary right branch */}
            <path
              d="M220 270 Q 280 210 330 130"
              stroke="#4A3F30"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Top Wildflower Radiance */}
            <g stroke="#96774C" strokeWidth="1.2" opacity="0.85">
              <line x1="140" y1="45" x2="90" y2="25" />
              <line x1="140" y1="45" x2="115" y2="10" />
              <line x1="140" y1="45" x2="140" y2="5" />
              <line x1="140" y1="45" x2="165" y2="12" />
              <line x1="140" y1="45" x2="190" y2="28" />
              {/* Golden bead petals */}
              <circle cx="90" cy="25" r="2.5" fill="#C59B63" />
              <circle cx="115" cy="10" r="3" fill="#E6BA7E" />
              <circle cx="140" cy="5" r="3.5" fill="#FEF08A" />
              <circle cx="165" cy="12" r="3" fill="#E6BA7E" />
              <circle cx="190" cy="28" r="2.5" fill="#C59B63" />
            </g>
            {/* Branch Umbel */}
            <g stroke="#6B5943" strokeWidth="1" opacity="0.75">
              <line x1="330" y1="130" x2="315" y2="95" />
              <line x1="330" y1="130" x2="345" y2="90" />
              <line x1="330" y1="130" x2="365" y2="105" />
              <circle cx="315" cy="95" r="2" fill="#A27D4C" />
              <circle cx="345" cy="90" r="2.5" fill="#D4AF37" />
              <circle cx="365" cy="105" r="2" fill="#A27D4C" />
            </g>
            {/* Lower branch leaflets */}
            <path
              d="M270 430 Q 320 400 350 370"
              stroke="#384330"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Deep Radial Vignette Overlay: Smooth fade to #070709 */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070709]/60 to-[#070709]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070709] to-transparent" />
    </div>
  );
};
