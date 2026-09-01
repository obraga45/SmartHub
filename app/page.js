"use client";

import { Activity, History, MapPin, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CepTab } from "@/components/CepTab";
import { CurrencyTab } from "@/components/CurrencyTab";
import { HistoryTab } from "@/components/HistoryTab";
import { StatusBar } from "@/components/StatusBar";
import { ThemeToggle } from "@/components/ThemeToggle";

const TABS = [
  { id: "cotacoes", label: "Cotações", icon: TrendingUp },
  { id: "cep", label: "Consulta CEP", icon: MapPin },
  { id: "historico", label: "Histórico", icon: History },
];

const INITIAL_CONNECTIONS = {
  awesome: { status: "idle", message: "" },
  viacep: { status: "idle", message: "" },
  airtable: { status: "idle", message: "" },
};

async function readJson(response) {
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Falha na requisição.");
  }
  return data;
}

export default function HomePage() {
  const [tab, setTab] = useState("cotacoes");
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);

  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currencyMessage, setCurrencyMessage] = useState(null);

  const [cep, setCep] = useState("");
  const [address, setAddress] = useState(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepSaving, setCepSaving] = useState(false);
  const [cepMessage, setCepMessage] = useState(null);

  const [records, setRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMessage, setHistoryMessage] = useState(null);

  const setConnection = useCallback((key, status, message = "") => {
    setConnections((current) => ({
      ...current,
      [key]: { status, message },
    }));
  }, []);

  const loadQuotes = useCallback(async () => {
    setQuotesLoading(true);
    setConnection("awesome", "loading");
    try {
      const data = await readJson(await fetch("/api/currency", { cache: "no-store" }));
      setQuotes(data.quotes || []);
      setConnection("awesome", "ok", "Cotações atualizadas");
    } catch (error) {
      setConnection("awesome", "error", error.message);
      setCurrencyMessage({ type: "error", text: error.message });
    } finally {
      setQuotesLoading(false);
    }
  }, [setConnection]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setConnection("airtable", "loading");
    try {
      const data = await readJson(await fetch("/api/airtable", { cache: "no-store" }));
      setRecords(data.records || []);
      setHistoryMessage(null);
      setConnection("airtable", "ok", `${data.count || 0} registros`);
    } catch (error) {
      setRecords([]);
      setHistoryMessage({ type: "error", text: error.message });
      setConnection("airtable", "error", error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [setConnection]);

  useEffect(() => {
    loadQuotes();
    loadHistory();
  }, [loadQuotes, loadHistory]);

  async function handleSync() {
    setSyncing(true);
    setCurrencyMessage(null);
    setConnection("airtable", "loading");
    try {
      const data = await readJson(
        await fetch("/api/sync", { method: "POST", cache: "no-store" })
      );
      setQuotes(data.quotes || []);
      setConnection("awesome", "ok", "Cotações sincronizadas");
      setConnection("airtable", "ok", `${data.savedCount} registros gravados`);

      const alerts = data.webhook?.alerts || [];
      const webhookNote = data.webhook?.sent
        ? " Webhook de alerta disparado."
        : data.webhook?.skipped
          ? " Webhook não configurado."
          : alerts.length
            ? " Variação acima de 0,5% detectada, mas o webhook falhou ou não foi enviado."
            : "";

      setCurrencyMessage({
        type: "success",
        text: `${data.savedCount} cotações salvas no Airtable.${webhookNote}`,
      });
      await loadHistory();
    } catch (error) {
      setCurrencyMessage({ type: "error", text: error.message });
      setConnection("airtable", "error", error.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCepSearch() {
    setCepLoading(true);
    setCepMessage(null);
    setConnection("viacep", "loading");
    try {
      const data = await readJson(
        await fetch(`/api/cep?cep=${encodeURIComponent(cep)}`, { cache: "no-store" })
      );
      setAddress(data.address);
      setConnection("viacep", "ok", "CEP validado");
    } catch (error) {
      setAddress(null);
      setCepMessage({ type: "error", text: error.message });
      setConnection("viacep", "error", error.message);
    } finally {
      setCepLoading(false);
    }
  }

  async function handleCepSave() {
    if (!address) return;
    setCepSaving(true);
    setCepMessage(null);
    setConnection("airtable", "loading");
    try {
      await readJson(
        await fetch("/api/airtable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              Tipo: "Endereco",
              Moeda: `CEP ${address.cep}`,
              Valor_Compra: 0,
              Valor_Venda: 0,
              Variacao: 0,
              Data_Atualizacao: new Date().toISOString(),
              CEP: address.cep,
              Endereco: address.formatted,
              Cidade: address.localidade,
              UF: address.uf,
            },
          }),
        })
      );
      setCepMessage({ type: "success", text: "Endereço formatado salvo no Airtable." });
      setConnection("airtable", "ok", "Endereço persistido");
      await loadHistory();
    } catch (error) {
      setCepMessage({ type: "error", text: error.message });
      setConnection("airtable", "error", error.message);
    } finally {
      setCepSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
              UniFECAF · Trabalho acadêmico
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              SmartHub
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Central Inteligente de Monitoramento: integra AwesomeAPI, ViaCEP e Airtable
              para automatizar consultas, persistir registros e gerar insights de variação cambial.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <ThemeToggle />
          <StatusBar connections={connections} />
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white/70 p-2 dark:border-cyan-900/40 dark:bg-slate-900/50">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab === "cotacoes" ? (
        <CurrencyTab
          quotes={quotes}
          loading={quotesLoading}
          syncing={syncing}
          message={currencyMessage}
          onRefresh={loadQuotes}
          onSync={handleSync}
        />
      ) : null}

      {tab === "cep" ? (
        <CepTab
          cep={cep}
          address={address}
          loading={cepLoading}
          saving={cepSaving}
          message={cepMessage}
          onCepChange={setCep}
          onSearch={handleCepSearch}
          onSave={handleCepSave}
        />
      ) : null}

      {tab === "historico" ? (
        <HistoryTab
          records={records}
          loading={historyLoading}
          message={historyMessage}
          onRefresh={loadHistory}
        />
      ) : null}

      <footer className="mt-12 border-t border-slate-200/80 pt-6 text-xs text-slate-400 dark:border-cyan-900/40">
        SmartHub · Integração REST com AwesomeAPI, ViaCEP e Airtable · UniFECAF
      </footer>
    </main>
  );
}
