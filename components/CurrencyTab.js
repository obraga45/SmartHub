"use client";

import { ArrowDownRight, ArrowUpRight, Bitcoin, DollarSign, Euro, RefreshCw, Save } from "lucide-react";
import { formatBRL, formatDateTime, formatPercent } from "@/lib/format";

const ICONS = {
  USD: DollarSign,
  EUR: Euro,
  BTC: Bitcoin,
};

export function CurrencyTab({
  quotes,
  loading,
  syncing,
  message,
  onRefresh,
  onSync,
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Cotações em tempo real</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            USD, EUR e BTC via AwesomeAPI, com persistência no Airtable e alerta se a variação passar de 0,5%.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onRefresh} disabled={loading} className="soft-btn border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-cyan-900/50 dark:bg-slate-900 dark:text-slate-100">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button type="button" onClick={onSync} disabled={syncing || loading} className="soft-btn bg-cyan-600 text-white hover:bg-cyan-500">
            <Save className={`h-4 w-4 ${syncing ? "animate-pulse" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar e salvar"}
          </button>
        </div>
      </div>

      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
          {message.text}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {(quotes.length ? quotes : [{ code: "USD" }, { code: "EUR" }, { code: "BTC" }]).map((quote) => {
          const Icon = ICONS[quote.code] || DollarSign;
          const up = Number(quote.variation) >= 0;
          return (
            <article key={quote.code} className="surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
                  {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {quote.variation != null ? formatPercent(quote.variation) : "—"}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">{quote.label || "Carregando"}</p>
              <h3 className="mt-1 text-3xl font-semibold tracking-tight">{quote.bid != null ? formatBRL(quote.bid) : "—"}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{quote.pair || quote.code}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Compra</dt>
                  <dd className="font-medium">{quote.bid != null ? formatBRL(quote.bid) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Venda</dt>
                  <dd className="font-medium">{quote.ask != null ? formatBRL(quote.ask) : "—"}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-400">Atualizado em {formatDateTime(quote.timestamp)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
