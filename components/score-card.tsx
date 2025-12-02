import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  feedback: string;
}

export function ScoreCard({ title, score, feedback }: ScoreCardProps) {
  let colorClass = "text-red-500";
  let bgClass = "bg-red-50 border-red-100";
  let Icon = XCircle;

  if (score >= 8.5) {
    colorClass = "text-green-500";
    bgClass = "bg-green-50 border-green-100";
    Icon = CheckCircle2;
  } else if (score >= 6.0) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-50 border-yellow-100";
    Icon = AlertCircle;
  }

  return (
    <div className={cn("p-6 rounded-2xl border transition-all hover:shadow-md", bgClass)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <div className={cn("flex items-center gap-1 font-bold text-xl", colorClass)}>
          <Icon className="w-5 h-5" />
          <span>{score}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {feedback}
      </p>
      
      {/* Progress Bar */}
      <div className="mt-4 h-2 w-full bg-black/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass.replace("text-", "bg-"))} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
