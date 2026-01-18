"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wand2, ArrowRight, CheckCircle2, Lock, Search, MessageSquare, FileText, Layout, Globe, Loader2, Play, Building2, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ANALYSIS_STEPS = [
  { id: 1, label: "Scannen op bias", icon: Search, duration: 2500, isFinal: false },
  { id: 2, label: "Tone of voice controleren", icon: MessageSquare, duration: 2500, isFinal: false },
  { id: 3, label: "Leesbaarheid analyseren", icon: FileText, duration: 2500, isFinal: false },
  { id: 4, label: "Structuur evalueren", icon: Layout, duration: 2500, isFinal: false },
  { id: 5, label: "SEO vindbaarheid checken", icon: Globe, duration: 2500, isFinal: false },
  { id: 6, label: "Analyse afronden", icon: Sparkles, duration: 0, isFinal: true },
];

export default function Home() {
  const [vacancyText, setVacancyText] = useState("");
  const [category, setCategory] = useState("General");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const router = useRouter();

  // Animate through steps when analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    let stepIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const runStep = () => {
      const step = ANALYSIS_STEPS[stepIndex];
      setCurrentStep(stepIndex + 1);

      // If this is the final step (duration: 0), stay on it indefinitely
      if (step.isFinal) {
        return;
      }

      timeoutId = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex + 1]);
        stepIndex++;
        if (stepIndex < ANALYSIS_STEPS.length) {
          runStep();
        }
      }, step.duration);
    };

    runStep();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!vacancyText.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyText, category }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      // Increment usage count locally
      const currentCount = parseInt(localStorage.getItem("vacancy_usage_count") || "0", 10);
      localStorage.setItem("vacancy_usage_count", (currentCount + 1).toString());

      const data = (await response.json()) as { reportId: string };
      router.push(`/report/${data.reportId}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Er ging iets mis. Probeer het opnieuw.");
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20 relative overflow-hidden">
      {/* Background Decorators - Minimalist White */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-white">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Ambient Bloom */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] opacity-60" />
      </div>

      {/* Header / Top Bar */}
      <header className="w-full fixed top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-on-primary-container" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-on-surface tracking-tight">
                Vacature Analyse
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <a
               href="https://vacaturetovenaar.nl"
               className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors hidden md:block"
             >
               Ontdek Vacature Tovenaar
             </a>
             <Button className="rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 font-bold px-6">
                Analyseer vacature
             </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="flex-1 flex flex-col pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-12">
            {/* Left Column: Copy */}
            <div className="space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/20">
                    <Wand2 className="w-3 h-3" />
                    <span>DOOR VACATURE TOVENAAR</span>
                </div>

                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tighter text-slate-900 leading-[1.05]">
                    Betere vacatures <br/>
                    <span className="relative inline-block mt-2">
                        <span className="relative z-10 text-primary font-serif italic font-normal whitespace-nowrap">Betere kandidaten.</span>
                        <div className="absolute left-0 right-0 bottom-2 h-3 bg-primary/20 -z-0 rotate-1"></div>
                    </span>
                </h2>

                <p className="text-lg text-slate-500 leading-relaxed max-w-md font-medium">
                    Analyseer en herschrijf je vacaturetekst in 1 minuut.
                </p>

                <div className="flex flex-col gap-4 pt-2">
                   {[
                     "Trek passende kandidaten aan",
                     "Laat ongeschikte kandidaten afhaken",
                     "Overtuig schaarse profielen om te reageren"
                   ].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-slate-700 font-semibold text-base">{text}</span>
                     </div>
                   ))}
                </div>
            </div>

            {/* Right Column: Interactive Card */}
            <div className="relative">
                {/* Decorative blobs */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                {!isAnalyzing ? (
                  <>
                    {/* Decorative Rotated Background (Dumbbell/Dashed) */}
                    <div className="absolute inset-0 bg-transparent border-2 border-dashed border-slate-300/50 rounded-[40px] transform rotate-3 scale-105 -z-10 pointer-events-none"></div>

                    {/* Floating Badge - Top Right */}
                    <div className="absolute -right-8 -top-4 bg-white py-2.5 px-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2 z-20 animate-in fade-in slide-in-from-right-4 duration-1000">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-slate-700">De juiste kandidaten</span>
                    </div>

                    {/* Input Card - App Window Aesthetic */}
                    <div className="relative bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 transform transition-all hover:scale-[1.005] duration-500">
                        
                        {/* Browser Header */}
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                               <Lock className="w-3 h-3" />
                               Analyse Vacature
                            </div>
                            <div className="w-12"></div>
                        </div>

                        <div className="p-6 space-y-6 relative">
                            <div className="relative">
                                <textarea
                                    value={vacancyText}
                                    onChange={(e) => setVacancyText(e.target.value)}
                                    placeholder="Plak hier je vacaturetekst"
                                    className="peer w-full h-64 p-5 bg-slate-50/30 focus:bg-white rounded-2xl border-2 border-slate-100/50 resize-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-base leading-relaxed placeholder:text-slate-300 font-medium"
                                    style={{ whiteSpace: "pre-wrap" }}
                                />

                                {/* Floating Badge - Bottom Left (Inside/Overlapping Textarea) */}
                                <div className="absolute left-4 lg:-left-6 xl:-left-12 bottom-8 bg-white py-2.5 px-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20 transition-all duration-300 peer-focus:opacity-0 peer-focus:-translate-x-4 peer-hover:opacity-0 peer-hover:-translate-x-4 pointer-events-none">
                                   <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                       <span className="text-primary font-serif italic font-bold text-lg">A+</span>
                                   </div>
                                   <span className="text-sm font-bold text-slate-700">Vacaturekwaliteit</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10 pt-2">
                                <div className="w-full sm:w-auto">
                                   <div className="relative group/cat">
                                       <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/cat:text-primary transition-colors pointer-events-none" />
                                       <select 
                                         value={category}
                                         onChange={(e) => setCategory(e.target.value)}
                                         className="appearance-none w-full sm:w-auto pl-9 pr-8 py-3.5 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
                                         style={{ backgroundImage: "none" }}
                                       >
                                           <option value="General">Algemeen (Standaard)</option>
                                           <option value="Government / Public Sector">Overheid / Publiek</option>
                                           <option value="Technology / Startups">Tech / IT</option>
                                           <option value="Healthcare / Education">Zorg / Onderwijs</option>
                                           <option value="Legal / Corporate">Zakelijk / Corporate</option>
                                           <option value="Blue Collar / Manual">Bouw / Techniek</option>
                                       </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </div>
                                   </div>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={!vacancyText.trim()}
                                        className="w-full sm:w-auto px-6 py-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
                                    >
                                        Analyseer vacature
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                  </>
                ) : (
                  /* Analysis Progress Card - App Window Aesthetic */
                  <div className="relative bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-white/40 ring-1 ring-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[440px] flex flex-col">
                      {/* Browser Header */}
                      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-sm"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-sm"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-sm"></div>
                          </div>
                          
                          {/* Fake URL Bar - Processing state */}
                          <div className="flex-1 max-w-[200px] hidden sm:flex items-center justify-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <Loader2 className="w-2.5 h-2.5 text-primary animate-spin" />
                              <span className="text-[10px] font-semibold text-slate-400 tracking-wide">vacature verwerken...</span>
                          </div>

                          <div className="w-12"></div>
                      </div>

                      {/* Main Loading Content */}
                      <div className="flex-1 p-10 flex flex-col items-center justify-center relative bg-white/50">
                          
                          {/* Animated Focal Point */}
                          <div className="relative mb-10 group">
                             <div className="absolute inset-0 bg-primary/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                             <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse opacity-30 delay-150"></div>
                             
                             {/* Central Circle */}
                             <div className="relative w-28 h-28 bg-gradient-to-br from-white to-slate-50 rounded-full border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center ring-4 ring-white">
                                {(() => {
                                   const activeStep = ANALYSIS_STEPS.find(s => s.id === currentStep) || ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1]; // Fallback to last if finishing
                                   const StepIcon = activeStep?.icon || Sparkles;
                                   return <StepIcon className="w-12 h-12 text-primary transition-all duration-500 animate-[bounce_2s_infinite]" />;
                                })()}
                             </div>

                             {/* Orbital particles (Pure CSS decoration) */}
                             <div className="absolute inset-[-20px] animate-[spin_3s_linear_infinite] pointer-events-none">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(255,107,53,0.5)]"></div>
                             </div>
                          </div>

                          {/* Dynamic Text */}
                          <div className="space-y-3 text-center max-w-lg mx-auto mb-16 px-4">
                             <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                {ANALYSIS_STEPS.find(s => s.id === currentStep)?.label || "Analyse afronden..."}
                             </h3>
                             <p className="text-sm text-slate-400 font-bold uppercase tracking-widest opacity-80">
                                AI Analist is aan het werk...
                             </p>
                          </div>

                          {/* Timeline / Progress Dots */}
                          <div className="flex items-center gap-3">
                             {ANALYSIS_STEPS.map((step) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const isCurrent = currentStep === step.id;
                                
                                return (
                                  <div 
                                    key={step.id} 
                                    className={cn(
                                      "h-1.5 rounded-full transition-all duration-700 ease-out",
                                      isCompleted ? "w-4 bg-green-500 shadow-sm" :
                                      isCurrent ? "w-12 bg-primary shadow-md shadow-primary/20" : 
                                      "w-1.5 bg-slate-200"
                                    )}
                                  />
                                );
                             })}
                          </div>
                      </div>
                  </div>
                )}
            </div>
        </div>

      </div>

      {/* SECTION 2: THE REALITY (Blueprint Mode) */}
      <section className="relative z-10 w-full bg-slate-50 py-16 border-t border-slate-200 overflow-hidden">
        {/* 1. Technical Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.6]" 
             style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* 2. Visual Fill: Subtle "Warning" Gradient Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[800px] bg-gradient-to-b from-red-100/30 via-orange-50/30 to-transparent blur-[120px] pointer-events-none"></div>

        {/* 3. Structural Guide Lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-red-200/50 hidden md:block"></div>
        <div className="absolute top-[280px] left-0 right-0 h-px border-t border-dashed border-slate-300/80"></div>
        
        {/* Crosshair Decor at intersection */}
        <div className="absolute top-[280px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-l border-t border-red-300 transform -rotate-45 hidden md:block"></div>


        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-600 text-xs font-bold uppercase tracking-wider mb-6 border border-slate-200 shadow-none relative z-10">
                    Het Probleem
                </div>

                <h2 className="text-4xl sm:text-5xl font-normal text-slate-900 tracking-tight mb-6 leading-[1.05] relative z-10">
                    Waarom veel vacatures <br/> <span className="text-primary relative inline-block md:whitespace-nowrap">
                        geen geschikte kandidaten trekken.
                        {/* Underline decor */}
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>
                </h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed bg-slate-50/80 inline-block px-4 rounded-lg backdrop-blur-sm">
                    Onbewuste bewoordingen, zwakke structuur en vaag taalgebruik jagen gekwalificeerde kandidaten weg.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Card 1 */}
                <div className="group p-8 rounded-[24px] border border-slate-200 bg-white shadow-none hover:border-red-200 transition-all duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <MessageSquare className="w-32 h-32 text-red-500 -rotate-12" />
                     </div>
                    <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-8 relative z-10">
                         <MessageSquare className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight relative z-10">Mismatch & ruis</h3>
                    <p className="text-slate-500 font-medium leading-relaxed relative z-10">Vage bewoordingen trekken ongeschikte kandidaten aan.</p>
                </div>

                {/* Card 2 */}
                <div className="group p-8 rounded-[24px] border border-slate-200 bg-white shadow-none hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <Search className="w-32 h-32 text-orange-500 -rotate-12" />
                     </div>
                    <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-8 relative z-10">
                         <Search className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight relative z-10">Latente kandidaten missen</h3>
                    <p className="text-slate-500 font-medium leading-relaxed relative z-10">Bereikt alleen actieve zoekers, niet de ideale profielen.</p>
                </div>

                {/* Card 3 */}
                <div className="group p-8 rounded-[24px] border border-slate-200 bg-white shadow-none hover:border-amber-200 transition-all duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500">
                        <Lock className="w-32 h-32 text-amber-500 -rotate-12" />
                     </div>
                    <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8 relative z-10">
                         <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight relative z-10">Onbewuste bias</h3>
                    <p className="text-slate-500 font-medium leading-relaxed relative z-10">Subtiele bewoordingen zorgen voor afhakers.</p>
                </div>
            </div>
        </div>
      </section>

      {/* SECTION 3: THE STANDARD (Clean + Ambient Colors) */}
      <section className="relative z-10 w-full bg-white py-32 border-t border-slate-200 overflow-hidden">
        {/* M3 Expressive Ambient Backgrounds - Left */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none translate-y-1/3"></div>
        
        {/* M3 Expressive Ambient Backgrounds - Right */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-20 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>

        {/* Existing Green Aura (Center-Right Focus) */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-l from-emerald-50/60 via-teal-50/30 to-transparent blur-[120px] pointer-events-none"></div>

         <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div>
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-600 text-xs font-bold uppercase tracking-wider mb-6 border border-slate-200 shadow-none">
                        De Oplossing
                     </div>
                     <h2 className="text-4xl sm:text-5xl font-normal text-slate-900 tracking-tight mb-8 leading-[1.05]">
                        Structurele vacature <br/> <span className="text-primary">verbetering</span>
                     </h2>
                     <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">
                        Onze AI-engine analyseert je tekst op belangrijke dimensies die bewezen zorgen voor hogere conversie en kwaliteit.
                     </p>
                     
                     {/* MARQUEE SECTION */}
                     <div className="w-full overflow-hidden mask-linear-fade relative mb-12">
                         {/* Fade Masks */}
                         <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                         <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

                         {/* Moving Track */}
                         <div className="flex gap-4 w-max animate-marquee">
                             {[...Array(2)].map((_, i) => (
                                 <div key={i} className="flex gap-4">
                                    {[
                                        "Kandidaat fit check", "Tone of voice & veiligheid", "Inclusieve taal", "Mobiele scanbaarheid",
                                        "Trefwoorden & vindbaarheid", "Structuur & volgorde", "Duidelijkheid arbeidsvoorwaarden", "Ruis & mismatch reductie"
                                    ].map((feature, j) => (
                                        <div key={j} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 font-bold whitespace-nowrap">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            {feature}
                                        </div>
                                    ))}
                                 </div>
                             ))}
                         </div>
                     </div>
                     
                     <div>
                        <Button className="h-14 px-10 rounded-full text-lg font-bold shadow-none border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 transition-all" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                           Nu gratis analyseren
                        </Button>
                     </div>
                 </div>
                 
                 {/* Visual decoration - Satellite Cards */}
                 <div className="relative flex justify-center lg:justify-end">
                      {/* Decorative wireframe background */}
                      <div className="absolute inset-0 border border-dashed border-slate-300 rounded-[40px] transform rotate-6 z-0 lg:left-20"></div>

                      {/* The "Perfect Score" Card */}
                      <div className="relative bg-white rounded-[40px] border border-slate-200 p-10 aspect-square flex flex-col items-center justify-center text-center shadow-none z-10 w-full max-w-md">
                           <div className="mb-6 p-4 bg-red-50 rounded-2xl">
                               <XCircle className="w-10 h-10 text-red-500" />
                           </div>
                           <h3 className="text-2xl font-bold text-slate-900 mb-3">Mismatch & ruis</h3>
                           <p className="text-slate-500 font-medium leading-relaxed">
                               Generieke teksten trekken generieke kandidaten aan. Je mist het <span className="text-primary font-semibold">toptalent</span>.
                           </p>
                           
                           {/* SATELLITES */}
                           <div className="absolute -left-12 top-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-bounce duration-[3000ms]">
                               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                   <CheckCircle2 className="w-4 h-4 text-green-600" />
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 uppercase">Bias</div>
                                   <div className="text-sm font-black text-slate-900">None</div>
                               </div>
                           </div>

                           <div className="absolute -right-8 bottom-24 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 animate-bounce duration-[4000ms]">
                               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                   <Search className="w-4 h-4 text-primary" />
                               </div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 uppercase">SEO</div>
                                   <div className="text-sm font-black text-slate-900">Top 10</div>
                               </div>
                           </div>
                      </div>
                 </div>
             </div>
         </div>
      </section>

      {/* SECTION 4: PROFESSIONAL FOOTER (Compact) */}
      <footer className="w-full bg-slate-950 py-12 border-t border-slate-900 relative z-10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                  {/* Brand & Mission */}
                  <div className="max-w-md">
                      <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xl font-bold text-white tracking-tight">Vacature Tovenaar</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                          Transformeer generieke vacatureteksten in wervende assets.
                      </p>
                  </div>

                  {/* Socials */}
                  <div className="flex gap-4">
                      {[1, 2, 3].map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                              <div className="w-4 h-4 bg-slate-600 rounded-sm group-hover:bg-slate-400 transition-colors"></div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                  <p>© {new Date().getFullYear()} Vacature Tovenaar. All rights reserved.</p>
                  <p>Made with <span className="text-red-500">♥</span> in Amsterdam</p>
              </div>
          </div>
      </footer>

    </main>
  );
}
