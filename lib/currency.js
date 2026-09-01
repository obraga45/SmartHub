const AWESOME_API_URL =
  "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL";

const CURRENCY_META = {
  USDBRL: { code: "USD", label: "Dólar Americano", pair: "USD/BRL" },
  EURBRL: { code: "EUR", label: "Euro", pair: "EUR/BRL" },
  BTCBRL: { code: "BTC", label: "Bitcoin", pair: "BTC/BRL" },
};

export function normalizeCurrency(raw) {
  return Object.entries(CURRENCY_META).map(([key, meta]) => {
    const quote = raw[key] || {};
    const bid = Number(quote.bid || 0);
    const ask = Number(quote.ask || 0);
    const pctChange = Number(quote.pctChange || 0);

    return {
      code: meta.code,
      label: meta.label,
      pair: meta.pair,
      bid,
      ask,
      high: Number(quote.high || 0),
      low: Number(quote.low || 0),
      variation: pctChange,
      timestamp: quote.create_date || new Date().toISOString(),
    };
  });
}

export async function fetchCurrencies() {
  const response = await fetch(AWESOME_API_URL, { cache: "no-store" });

  if (!response.ok) {
    const error = new Error("Falha ao consultar a AwesomeAPI.");
    error.status = response.status;
    throw error;
  }

  const raw = await response.json();
  return normalizeCurrency(raw);
}

export function toAirtableCurrencyFields(quote) {
  return {
    Tipo: "Cotacao",
    Moeda: quote.code,
    Valor_Compra: quote.bid,
    Valor_Venda: quote.ask,
    Variacao: quote.variation,
    Data_Atualizacao: new Date().toISOString(),
  };
}
