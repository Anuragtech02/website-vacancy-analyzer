"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

interface PeelCTAProps {
  onUnlock: () => void;
  currentScore: number;
}

export function PeelCTA({ onUnlock, currentScore }: PeelCTAProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Fold dimensions
  const initialFold = 30;
  const teaseFold = 50; // Slight peel for the "tease"
  const hoverFold = 150; 

  const getClipPath = (size: number | string) => 
    `polygon(0 0, calc(100% - ${size}px) 0, 100% ${size}px, 100% 100%, 0 100%)`;

  return (
    <div className="w-full h-full bg-black rounded-3xl overflow-hidden relative shadow-xl group cursor-pointer"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         onClick={onUnlock}
    >
        {/* TEXT CONTENT - LEFT side */}
        <div className="relative z-10 w-full h-full p-5 sm:p-6 flex flex-col justify-center max-w-[60%] sm:max-w-[50%]">
           <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight mb-3">
             Unlock <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
               maximum potential
             </span>
           </h3>
           
           <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium max-w-[200px]">
             Get the optimized version of your vacancy. Instant conversion boost.
           </p>
           
           <Button 
             className="w-fit bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/40 rounded-full px-6 py-6 text-sm font-bold group-hover:scale-105 active:scale-95 transition-all"
           >
              Unlock Now <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        </div>

        {/* PEEL WIDGET - ABSOLUTE RIGHT */}
        <div className="absolute top-5 bottom-5 right-5 w-[130px] sm:w-[220px]">
           
           {/* THE MAIN CARD CONTAINER */}
           <div className="relative w-full h-full rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
               
               {/* 1. BACK/REVEAL LAYER (The Hidden Green Score) */}
               <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-[4px] border-white/20 overflow-hidden">
                   
                   {/* Decorative Illustrations / Shapes */}
                   <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-60 animate-pulse" />
                   <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-60" />
                   
                   {/* Geometric Shapes */}
                   <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <circle cx="15" cy="15" r="20" stroke="white" strokeWidth="2" fill="none" />
                      <rect x="70" y="70" width="30" height="30" rx="8" stroke="white" strokeWidth="3" fill="none" transform="rotate(15 95 85)" />
                   </svg>

                   {/* TOP RIGHT BADGE - Visible immediately on peel */}
                   <div className="absolute top-4 right-4 flex flex-col items-end opacity-90">
                       <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider mb-1">
                           Optimized
                       </span>
                       <span className="text-white font-black text-xl tracking-tighter shadow-sm">8+</span>
                   </div>

                   <div className="relative z-10 transform translate-y-1">
                       <div className="bg-white p-3 rounded-full mb-2 shadow-lg mx-auto w-fit">
                           <Sparkles className="w-8 h-8 text-green-600" />
                       </div>
                       <div className="text-6xl font-black text-white tracking-tighter drop-shadow-lg leading-none">8+</div>
                       <div className="text-xs font-bold text-white uppercase tracking-widest mt-2 bg-black/10 px-2 py-1 rounded-full">Potential Score</div>
                   </div>
               </div>

               {/* 2. FRONT LAYER (The Current White Score) */}
               <motion.div 
                 className="absolute inset-0 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center border border-slate-200 z-30 origin-bottom-left"
                 initial={false}
                 animate={{
                    clipPath: isHovered 
                        ? getClipPath(hoverFold)
                        : [getClipPath(initialFold), getClipPath(teaseFold), getClipPath(initialFold)],
                 }}
                 transition={{ 
                    duration: isHovered ? 0.3 : 2.5,
                    repeat: isHovered ? 0 : Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    type: isHovered ? "spring" : "tween", // Spring only for interaction, tween for loop
                    stiffness: 300, 
                    damping: 30
                 }}
               >
                   <div className="bg-slate-100 p-3 rounded-full mb-3 border border-slate-200">
                       <Lock className="w-8 h-8 text-slate-400" />
                   </div>
                   <div className="text-5xl font-black text-slate-800 tracking-tighter">{currentScore.toFixed(1)}</div>
                   <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current Score</div>
                   
                   <div className="absolute bottom-5 flex flex-col items-center gap-1 animate-pulse">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hover to peel</span>
                   </div>
               </motion.div>

               {/* 3. THE FLAP (The Curled Corner) */}
               <motion.div
                 className="absolute top-0 right-0 z-40 pointer-events-none drop-shadow-xl"
                 initial={false}
                 animate={{
                     width: isHovered ? hoverFold : [initialFold, teaseFold, initialFold],
                     height: isHovered ? hoverFold : [initialFold, teaseFold, initialFold],
                 }}
                 style={{
                     clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                 }}
                 transition={{ 
                    duration: isHovered ? 0.3 : 2.5,
                    repeat: isHovered ? 0 : Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    type: isHovered ? "spring" : "tween"
                 }}
               >
                   {/* The visual triangle of the flap - Back of the paper */}
                   <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 rounded-bl-3xl border-b border-l border-white/60 shadow-md" 
                        style={{ borderBottomLeftRadius: isHovered ? 24 : 12 }}
                   />
                   
                   {/* Shine/Gloss effect */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/50 to-white/10 rounded-bl-3xl" />
               </motion.div>

           </div>
        </div>
    </div>
  );
}
