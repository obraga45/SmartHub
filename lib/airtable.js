const AIRTABLE_API = "https://api.airtable.com/v0";

export function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Monitoramento_Financeiro";

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

export async function listRecords() {
  const { configured } = getAirtableConfig();
  if (!configured) {
    const error = new Error("Airtable não configurado. Preencha as variáveis em .env.local.");
    error.status = 503;
    throw error;
  }

  const params = new URLSearchParams({
    pageSize: "50",
    "sort[0][field]": "Data_Atualizacao",
    "sort[0][direction]": "desc",
  });

  const response = await fetch(`${getTableUrl()}?${params.toString()}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Falha ao listar registros no Airtable.");
    error.status = response.status;
    throw error;
  }

  return payload.records || [];
}

export async function createRecord(fields) {
  const { configured } = getAirtableConfig();
  if (!configured) {
    const error = new Error("Airtable não configurado. Preencha as variáveis em .env.local.");
    error.status = 503;
    throw error;
  }

  const response = await fetch(getTableUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields, typecast: true }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Falha ao gravar registro no Airtable.");
    error.status = response.status;
    throw error;
  }

  return payload;
}

export async function createRecords(recordsFields) {
  const { configured } = getAirtableConfig();
  if (!configured) {
    const error = new Error("Airtable não configurado. Preencha as variáveis em .env.local.");
    error.status = 503;
    throw error;
  }

  const records = recordsFields.map((fields) => ({ fields }));

  const response = await fetch(getTableUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ records, typecast: true }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Falha ao gravar registros no Airtable.");
    error.status = response.status;
    throw error;
  }

  return payload.records || [];
}
