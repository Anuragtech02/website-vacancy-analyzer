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
    <div className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-xl group cursor-pointer flex items-center p-3 sm:p-5 gap-2 sm:gap-4"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         onClick={onUnlock}
    >
        {/* TEXT CONTENT - LEFT side (Flex-1 to fill space, min-w-0 to prevent overflow) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center min-w-0 py-2 pl-2">
           <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none tracking-tight mb-3">
             Ontgrendel <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
               maximum potentieel
             </span>
           </h3>
           
           <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium block">
             Krijg de geoptimaliseerde versie.
           </p>
           
           <Button 
             className="w-fit bg-primary hover:bg-primary/90 text-white border-none shadow-lg shadow-primary/40 rounded-full px-4 py-3 text-xs sm:px-6 sm:py-6 sm:text-sm font-bold group-hover:scale-105 active:scale-95 transition-all"
           >
              Nu ontgrendelen <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
        </div>

        {/* PEEL WIDGET - RIGHT side (Fixed width, shrinks 0) */}
        <div className="relative w-[120px] sm:w-[220px] shrink-0 h-full max-h-[300px] flex items-center">
           
           {/* THE MAIN CARD CONTAINER */}
           <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
               
               {/* 1. BACK/REVEAL LAYER (The Hidden Green Score) */}
               <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex flex-col items-center justify-center p-2 sm:p-4 text-center border-[4px] border-white/20 overflow-hidden">
                   
                   {/* Decorative Illustrations / Shapes */}
                   <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-60 animate-pulse" />
                   <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-primary rounded-full blur-3xl opacity-60" />
                   
                   {/* Geometric Shapes */}
                   <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <circle cx="15" cy="15" r="20" stroke="white" strokeWidth="2" fill="none" />
                      <rect x="70" y="70" width="30" height="30" rx="8" stroke="white" strokeWidth="3" fill="none" transform="rotate(15 95 85)" />
                   </svg>

                   {/* TOP RIGHT BADGE */}
                   <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col items-end opacity-90">
                       <span className="bg-white/20 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/30 uppercase tracking-wider mb-1">
                           Geoptimaliseerd
                       </span>
                   </div>

                   <div className="relative z-10 transform translate-y-1">
                       <div className="bg-white p-2 sm:p-3 rounded-full mb-1 sm:mb-2 shadow-lg mx-auto w-fit">
                           <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
                       </div>
                       <div className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-lg leading-none">8+</div>
                       <div className="text-[8px] sm:text-xs font-bold text-white uppercase tracking-widest mt-1 sm:mt-2 bg-black/10 px-2 py-1 rounded-full">Potentiële Score</div>
                   </div>
               </div>

               {/* 2. FRONT LAYER (The Current White Score) */}
               <motion.div 
                 className="absolute inset-0 bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-2 sm:p-4 text-center border border-slate-200 z-30 origin-bottom-left"
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
                    type: isHovered ? "spring" : "tween",
                    stiffness: 300, 
                    damping: 30
                 }}
               >
                   <div className="bg-slate-100 p-2 sm:p-3 rounded-full mb-2 sm:mb-3 border border-slate-200">
                       <Lock className="w-5 h-5 sm:w-8 sm:h-8 text-slate-400" />
                   </div>
                   <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter">{currentScore.toFixed(1)}</div>
                   <div className="text-[8px] sm:text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Huidige Score</div>
                   
                   <div className="absolute bottom-3 sm:bottom-5 hidden sm:flex flex-col items-center gap-1 animate-pulse">
                        <span className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hover voor resultaat</span>
                   </div>
               </motion.div>

               {/* 3. THE FLAP */}
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
                   <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 rounded-bl-3xl border-b border-l border-white/60 shadow-md" 
                        style={{ borderBottomLeftRadius: isHovered ? 24 : 12 }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/50 to-white/10 rounded-bl-3xl" />
               </motion.div>

           </div>
        </div>
    </div>
  );
}
