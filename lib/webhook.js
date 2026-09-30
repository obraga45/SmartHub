import { readEnv } from "@/lib/env";

const VARIATION_THRESHOLD = 0.5;

export function getAlertQuotes(quotes) {
  return quotes.filter((quote) => Math.abs(Number(quote.variation)) > VARIATION_THRESHOLD);
}

export async function notifyVariationAlerts(quotes) {
  const webhookUrl = readEnv("SLACK_WEBHOOK_URL");
  const alerts = getAlertQuotes(quotes);

  if (!webhookUrl || alerts.length === 0) {
    return { sent: false, skipped: !webhookUrl, alerts };
  }

  const lines = alerts.map(
    (quote) =>
      `• *${quote.code}* (${quote.pair}): variação de *${quote.variation.toFixed(2)}%* | compra ${quote.bid} | venda ${quote.ask}`
  );

  const text = [
    ":rotating_light: *SmartHub — alerta de variação cambial*",
    `Detectada variação percentual acima de ${VARIATION_THRESHOLD}%:`,
    ...lines,
  ].join("\n");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error("Falha ao disparar o webhook de alerta.");
    error.status = response.status;
    throw error;
  }

  return { sent: true, skipped: false, alerts };
}
