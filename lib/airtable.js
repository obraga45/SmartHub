import { envErrorMessage, readEnv } from "@/lib/env";

const AIRTABLE_API = "https://api.airtable.com/v0";

export function getAirtableConfig() {
  const apiKey = readEnv("AIRTABLE_API_KEY");
  const baseId = readEnv("AIRTABLE_BASE_ID");
  const tableName = readEnv("AIRTABLE_TABLE_NAME") || "Monitoramento_Financeiro";

  return {
    apiKey,
    baseId,
    tableName,
    configured: Boolean(apiKey && baseId && tableName),
  };
}

function getTableUrl() {
  const { baseId, tableName } = getAirtableConfig();
  return `${AIRTABLE_API}/${baseId}/${encodeURIComponent(tableName)}`;
}

function getHeaders() {
  const { apiKey } = getAirtableConfig();
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function configError() {
  const error = new Error(envErrorMessage());
  error.status = 503;
  return error;
}

async function parseAirtable(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export async function listRecords() {
  const { configured } = getAirtableConfig();
  if (!configured) throw configError();

  const sortedParams = new URLSearchParams({
    pageSize: "50",
    "sort[0][field]": "Data_Atualizacao",
    "sort[0][direction]": "desc",
  });

  let response = await fetch(`${getTableUrl()}?${sortedParams.toString()}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    response = await fetch(`${getTableUrl()}?pageSize=50`, {
      headers: getHeaders(),
      cache: "no-store",
    });
  }

  const payload = await parseAirtable(response, "Falha ao listar registros no Airtable.");
  return payload.records || [];
}

export async function createRecord(fields) {
  const { configured } = getAirtableConfig();
  if (!configured) throw configError();

  const response = await fetch(getTableUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields, typecast: true }),
    cache: "no-store",
  });

  return parseAirtable(response, "Falha ao gravar registro no Airtable.");
}

export async function createRecords(recordsFields) {
  const { configured } = getAirtableConfig();
  if (!configured) throw configError();

  const records = recordsFields.map((fields) => ({ fields }));

  const response = await fetch(getTableUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ records, typecast: true }),
    cache: "no-store",
  });

  const payload = await parseAirtable(response, "Falha ao gravar registros no Airtable.");
  return payload.records || [];
}
