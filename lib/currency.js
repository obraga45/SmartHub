const AWESOME_API_URL =
  "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL";

const CURRENCY_META = {
  USDBRL: { code: "USD", label: "Dólar Americano", pair: "USD/BRL" },
  EURBRL: { code: "EUR", label: "Euro", pair: "EUR/BRL" },
  BTCBRL: { code: "BTC", label: "Bitcoin", pair: "BTC/BRL" },
};

const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent": "SmartHub-UniFECAF/1.0 (academic dashboard)",
};

let cache = null;

function buildQuote(meta, values) {
  return {
    code: meta.code,
    label: meta.label,
    pair: meta.pair,
    bid: Number(values.bid || 0),
    ask: Number(values.ask || values.bid || 0),
    high: Number(values.high || values.bid || 0),
    low: Number(values.low || values.bid || 0),
    variation: Number(values.variation || 0),
    timestamp: values.timestamp || new Date().toISOString(),
  };
}

export function normalizeCurrency(raw) {
  return Object.entries(CURRENCY_META).map(([key, meta]) => {
    const quote = raw[key] || {};
    return buildQuote(meta, {
      bid: quote.bid,
      ask: quote.ask,
      high: quote.high,
      low: quote.low,
      variation: quote.pctChange,
      timestamp: quote.create_date,
    });
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: FETCH_HEADERS,
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchFromAwesomeApi() {
  const raw = await fetchJson(AWESOME_API_URL);
  return { quotes: normalizeCurrency(raw), source: "AwesomeAPI" };
}

async function fetchSettled(url) {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

async function fetchFromFallback() {
  const timestamp = new Date().toISOString();
  const [usdCdn, eurCdn, btcCdn, usdOpen] = await Promise.all([
    fetchSettled("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json"),
    fetchSettled("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json"),
    fetchSettled("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.min.json"),
    fetchSettled("https://open.er-api.com/v6/latest/USD"),
  ]);

  const usdBid = Number(usdCdn?.usd?.brl || usdOpen?.rates?.BRL || 0);
  const eurBid = Number(eurCdn?.eur?.brl || (usdOpen?.rates?.BRL && usdOpen?.rates?.EUR ? usdOpen.rates.BRL / usdOpen.rates.EUR : 0));
  const btcBid = Number(btcCdn?.btc?.brl || 0);

  if (!usdBid && !eurBid && !btcBid) {
    throw new Error("Nenhuma fonte alternativa de cotação respondeu.");
  }

  return {
    source: "CurrencyAPI/jsDelivr",
    quotes: [
      buildQuote(CURRENCY_META.USDBRL, { bid: usdBid, timestamp }),
      buildQuote(CURRENCY_META.EURBRL, { bid: eurBid, timestamp }),
      buildQuote(CURRENCY_META.BTCBRL, { bid: btcBid, timestamp }),
    ],
  };
}

export async function fetchCurrencies() {
  if (cache && Date.now() - cache.at < 60_000) {
    return cache.payload;
  }

  try {
    const payload = await fetchFromAwesomeApi();
    cache = { at: Date.now(), payload };
    return payload;
  } catch (awesomeError) {
    try {
      const payload = await fetchFromFallback();
      cache = { at: Date.now(), payload };
      return payload;
    } catch {
      const error = new Error(
        awesomeError.status === 429
          ? "Cotações temporariamente indisponíveis (limite da AwesomeAPI). Tente novamente em instantes."
          : "Falha ao consultar as APIs de cotação."
      );
      error.status = awesomeError.status || 502;
      throw error;
    }
  }
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
