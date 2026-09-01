"use client";

import { History, RefreshCw } from "lucide-react";
import { formatBRL, formatDateTime, formatPercent } from "@/lib/format";

export function HistoryTab({ records, loading, message, onRefresh }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Histórico consolidado</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Últimos registros persistidos no Airtable — cotações e endereços.
          </p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="soft-btn border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-cyan-900/50 dark:bg-slate-900 dark:text-slate-100">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </button>
      </div>

      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
          {message.text}
        </p>
      ) : null}

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Moeda / CEP</th>
                <th className="px-4 py-3 font-semibold">Compra</th>
                <th className="px-4 py-3 font-semibold">Venda</th>
                <th className="px-4 py-3 font-semibold">Variação</th>
                <th className="px-4 py-3 font-semibold">Endereço</th>
                <th className="px-4 py-3 font-semibold">Atualização</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    <History className="mx-auto mb-3 h-8 w-8 opacity-40" />
                    Nenhum registro encontrado. Sincronize cotações ou salve um CEP.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const fields = record.fields || {};
                  const isAddress = fields.Tipo === "Endereco";
                  return (
                    <tr key={record.id} className="border-t border-slate-100 dark:border-cyan-900/30">
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-800">
                          {fields.Tipo || "Cotacao"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{fields.Moeda || fields.CEP || "—"}</td>
                      <td className="px-4 py-3">{isAddress ? "—" : formatBRL(fields.Valor_Compra)}</td>
                      <td className="px-4 py-3">{isAddress ? "—" : formatBRL(fields.Valor_Venda)}</td>
                      <td className="px-4 py-3">{isAddress ? "—" : formatPercent(fields.Variacao)}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-500" title={fields.Endereco || ""}>
                        {fields.Endereco || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatDateTime(fields.Data_Atualizacao)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
