import { AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Issue {
  problem: string;
  why_it_matters: string;
  how_to_improve: string;
}

interface IssueCardsProps {
  issues: Issue[];
}

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden transition-all duration-300",
        "hover:shadow-md hover:border-red-200"
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex gap-4">
          <div className="shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-base mb-2 pr-4">
              {issue.problem}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {issue.why_it_matters}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IssueCards({ issues }: IssueCardsProps) {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Critical Issues Found</h2>
          <p className="text-sm text-slate-500">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} that may hurt your applicant conversion
          </p>
        </div>
      </div>

      {/* Issues grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issues.map((issue, index) => (
          <IssueCard key={index} issue={issue} />
        ))}
      </div>
    </section>
  );
}
