const PLACEHOLDER_VALUES = new Set([
  "seu_personal_access_token_aqui",
  "seu_base_id_aqui",
  "sua_url_webhook_opcional",
]);

export function readEnv(name) {
  const value = String(process.env[name] || "").trim().replace(/^['"]|['"]$/g, "");

  if (!value) return "";
  if (PLACEHOLDER_VALUES.has(value)) return "";
  if (/^seu[_-]/i.test(value) || /^sua[_-]/i.test(value)) return "";

  return value;
}

export function envErrorMessage() {
  return "Airtable não configurado. Na Vercel, defina AIRTABLE_API_KEY, AIRTABLE_BASE_ID e AIRTABLE_TABLE_NAME em Settings → Environment Variables e faça um Redeploy.";
}
