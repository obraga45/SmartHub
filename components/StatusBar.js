import { CheckCircle2, Loader2, MinusCircle, XCircle } from "lucide-react";

const LABELS = {
  awesome: "AwesomeAPI",
  viacep: "ViaCEP",
  airtable: "Airtable",
};

function StatusIcon({ status }) {
  if (status === "ok") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "error") return <XCircle className="h-3.5 w-3.5" />;
  if (status === "loading") return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  return <MinusCircle className="h-3.5 w-3.5" />;
}

function statusClasses(status) {
  if (status === "ok") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  if (status === "error") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
  }
  if (status === "loading") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400";
}

export function StatusBar({ connections }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(LABELS).map(([key, label]) => {
        const item = connections[key] || { status: "idle" };
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(item.status)}`}
            title={item.message || label}
          >
            <StatusIcon status={item.status} />
            {label}
            <span className="opacity-70">
              {item.status === "ok" ? "online" : item.status === "error" ? "falha" : item.status === "loading" ? "..." : "idle"}
            </span>
          </span>
        );
      })}
    </div>
  );
}
