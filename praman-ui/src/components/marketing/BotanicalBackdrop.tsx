import React from 'react';

export const BotanicalBackdrop: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-visible z-10"
      aria-hidden="true"
    >
      {/* 1. Natural Soft Amber Sunbeam Glow (Clean radial/conic light, NO hard polygon stripes) */}
      <div className="absolute -top-12 -left-12 w-[480px] h-[400px] bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.22)_0%,_rgba(217,119,6,0.08)_50%,_transparent_75%)] blur-[60px] pointer-events-none" />

      {/* Fresh Emerald Waterfall & Forest Glow on Right */}
      <div className="absolute top-[15%] -right-10 w-[420px] h-[360px] bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.18)_0%,_rgba(5,150,105,0.06)_50%,_transparent_75%)] blur-[70px] pointer-events-none" />

      {/* 2. Floating Golden Sunlit Pollen Dust Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[28%] left-[7%] w-1.5 h-1.5 rounded-full bg-amber-300/90 blur-[0.5px] shadow-[0_0_8px_#F59E0B] animate-pollen-1" />
        <div className="absolute top-[45%] left-[13%] w-1.5 h-1.5 rounded-full bg-yellow-200/95 blur-[0.5px] shadow-[0_0_6px_#FBBF24] animate-pollen-2" />
        <div className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-amber-400/80 blur-[1px] shadow-[0_0_10px_#D97706] animate-pollen-3" />
        <div className="absolute top-[60%] left-[5%] w-1.5 h-1.5 rounded-full bg-yellow-100/90 blur-[0.5px] shadow-[0_0_6px_#FDE047] animate-pollen-4" />
        <div className="absolute top-[35%] right-[9%] w-2 h-2 rounded-full bg-amber-300/80 blur-[0.5px] shadow-[0_0_8px_#F59E0B] animate-pollen-2" />
        <div className="absolute top-[50%] right-[6%] w-1.5 h-1.5 rounded-full bg-yellow-200/85 blur-[0.5px] shadow-[0_0_6px_#FBBF24] animate-pollen-4" />
      </div>

      {/* 3. Floating Drifting Golden Petals (Gently tumbling across the air) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[22%] left-[12%] w-3.5 h-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-petal-1 pointer-events-none" />
        <div className="absolute bottom-[30%] right-[14%] w-3 h-1.8 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.6)] animate-petal-2 pointer-events-none" />
        <div className="absolute bottom-[16%] left-[22%] w-4 h-2 rounded-full bg-gradient-to-r from-yellow-200 to-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.5)] animate-petal-3 pointer-events-none" />
      </div>

      {/* 4. Left Wildflower Cluster (Flanking the Left Side of the Window Frame) */}
      <div className="absolute -bottom-2 -left-10 sm:-left-16 w-[240px] sm:w-[320px] h-[440px] sm:h-[490px] animate-flower-sway-1 origin-bottom-left shrink-0 pointer-events-none z-10">
        <svg
          viewBox="0 0 340 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain object-bottom filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]"
        >
          <defs>
            <linearGradient id="forestStemGradL" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#152B1B" />
              <stop offset="50%" stopColor="#2D5C38" />
              <stop offset="100%" stopColor="#4E915E" />
            </linearGradient>
            <radialGradient id="sunGoldPetalL" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
            <radialGradient id="sunGoldPetalMid" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
          </defs>

          {/* Stems */}
          <path d="M90 500 Q 110 360 140 230 T 160 120" stroke="url(#forestStemGradL)" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M125 380 Q 180 280 215 190" stroke="url(#forestStemGradL)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M100 440 Q 50 340 38 220" stroke="url(#forestStemGradL)" strokeWidth="2.2" strokeLinecap="round" />

          {/* Top-Left White Umbel Flower */}
          <g transform="translate(38, 220)">
            <g stroke="#9BB2A1" strokeWidth="1" opacity="0.95">
              <line x1="0" y1="0" x2="-32" y2="-28" />
              <line x1="0" y1="0" x2="-18" y2="-42" />
              <line x1="0" y1="0" x2="0" y2="-48" />
              <line x1="0" y1="0" x2="18" y2="-42" />
              <line x1="0" y1="0" x2="32" y2="-28" />
            </g>
            {[-32, -18, 0, 18, 32].map((x, i) => (
              <g key={i} transform={`translate(${x}, ${i === 2 ? -48 : i === 1 || i === 3 ? -42 : -28})`}>
                <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" opacity="0.98" />
                <circle cx="-2" cy="-1.5" r="2.5" fill="#F8FAFC" opacity="0.95" />
                <circle cx="2" cy="-1.5" r="2.5" fill="#F1F5F9" opacity="0.95" />
              </g>
            ))}
          </g>

          {/* Primary Golden Starburst Daisy Bloom */}
          <g transform="translate(160, 120)" className="animate-flower-head">
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((angle, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-18"
                rx="3.5"
                ry="16"
                fill="url(#sunGoldPetalL)"
                opacity="0.96"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="7.5" fill="#92400E" />
            <circle cx="-1" cy="-1.5" r="5.5" fill="#B45309" />
            <circle cx="0" cy="0" r="3.5" fill="#D97706" />
            <circle cx="1" cy="1" r="2" fill="#F59E0B" />
          </g>

          {/* Mid Golden Starburst Daisy Bloom */}
          <g transform="translate(215, 190)" className="animate-flower-head">
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((angle, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-14"
                rx="3"
                ry="13"
                fill="url(#sunGoldPetalMid)"
                opacity="0.94"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="6.5" fill="#92400E" />
            <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
          </g>

          {/* Lower Forest Leaves */}
          <path d="M95 400 Q 60 370 42 385 Q 70 410 95 400 Z" fill="#2D5C38" opacity="0.9" />
          <path d="M115 340 Q 150 310 170 325 Q 135 350 115 340 Z" fill="#366B42" opacity="0.88" />
        </svg>
      </div>

      {/* 5. Right Wildflower Cluster (Flanking the Right Side of the Window Frame) */}
      <div className="absolute -bottom-2 -right-10 sm:-right-16 w-[220px] sm:w-[300px] h-[420px] sm:h-[470px] animate-flower-sway-2 origin-bottom-right shrink-0 pointer-events-none z-10">
        <svg
          viewBox="0 0 320 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain object-bottom filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]"
        >
          <defs>
            <linearGradient id="forestStemGradR" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#112416" />
              <stop offset="60%" stopColor="#255231" />
              <stop offset="100%" stopColor="#3E7D4E" />
            </linearGradient>
            <radialGradient id="sunGoldPetalR" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
          </defs>

          {/* Stems */}
          <path d="M230 480 Q 200 350 170 240 T 150 140" stroke="url(#forestStemGradR)" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M195 320 Q 250 250 270 180" stroke="url(#forestStemGradR)" strokeWidth="2.3" strokeLinecap="round" />

          {/* Streamside Golden Daisy 1 (Top Right) */}
          <g transform="translate(150, 140)" className="animate-flower-head">
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((angle, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-15"
                rx="3.2"
                ry="14"
                fill="url(#sunGoldPetalR)"
                opacity="0.95"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="7" fill="#92400E" />
            <circle cx="-1" cy="-1" r="4.5" fill="#B45309" />
            <circle cx="0" cy="0" r="2.5" fill="#FBBF24" />
          </g>

          {/* Streamside Golden Daisy 2 */}
          <g transform="translate(270, 180)" className="animate-flower-head">
            {[0, 26, 52, 78, 104, 130, 156, 182, 208, 234, 260, 286, 312, 338].map((angle, idx) => (
              <ellipse
                key={idx}
                cx="0"
                cy="-12"
                rx="2.8"
                ry="11"
                fill="url(#sunGoldPetalR)"
                opacity="0.9"
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="5.5" fill="#78350F" />
            <circle cx="0" cy="0" r="3" fill="#F59E0B" />
          </g>

          {/* Riverside Foliage */}
          <path d="M210 380 Q 250 345 275 360 Q 240 390 210 380 Z" fill="#255231" opacity="0.9" />
        </svg>
      </div>

      {/* 6. Bottom Water Glimmer Line */}
      <div className="absolute -bottom-2 inset-x-12 sm:inset-x-24 h-4 pointer-events-none opacity-50 animate-water-glimmer">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-sm" />
      </div>
    </div>
  );
};
