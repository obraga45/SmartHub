"use client";

import { MapPin, Save, Search } from "lucide-react";
import { formatCepInput } from "@/lib/format";

export function CepTab({
  cep,
  address,
  loading,
  saving,
  message,
  onCepChange,
  onSearch,
  onSave,
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Consulta e validação de CEP</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Busca rápida na ViaCEP e gravação do endereço formatado na base Airtable.
        </p>
      </div>

      <form
        className="surface flex flex-col gap-3 p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <label className="sr-only" htmlFor="cep">
          CEP
        </label>
        <input
          id="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          onChange={(event) => onCepChange(formatCepInput(event.target.value))}
          className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-cyan-500/30 placeholder:text-slate-400 focus:ring-4 dark:border-cyan-900/50 dark:bg-slate-950 dark:text-slate-100"
        />
        <button type="submit" disabled={loading} className="soft-btn h-12 bg-cyan-600 text-white hover:bg-cyan-500">
          <Search className="h-4 w-4" />
          {loading ? "Consultando..." : "Buscar CEP"}
        </button>
      </form>

      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm ${message.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
          {message.text}
        </p>
      ) : null}

      {address ? (
        <article className="surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Endereço validado</p>
                <h3 className="text-lg font-semibold">{address.cep}</h3>
              </div>
            </div>
            <button type="button" onClick={onSave} disabled={saving} className="soft-btn bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar no Airtable"}
            </button>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">Logradouro</dt>
              <dd className="mt-1 font-medium">{address.logradouro || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">Bairro</dt>
              <dd className="mt-1 font-medium">{address.bairro || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">Cidade / UF</dt>
              <dd className="mt-1 font-medium">{address.localidade}/{address.uf}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-400">DDD</dt>
              <dd className="mt-1 font-medium">{address.ddd || "—"}</dd>
            </div>
          </dl>

          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-950/70 dark:text-slate-300">
            {address.formatted}
          </p>
        </article>
      ) : (
        <div className="surface px-6 py-16 text-center text-sm text-slate-500">
          Informe um CEP para validar o endereço e habilitar a persistência.
        </div>
      )}
    </section>
  );
}
