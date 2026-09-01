export function sanitizeCep(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value) {
  const digits = sanitizeCep(value);
  if (digits.length !== 8) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatAddress(data) {
  const street = [data.logradouro, data.complemento].filter(Boolean).join(", ");
  const neighborhood = data.bairro ? ` — ${data.bairro}` : "";
  const city = [data.localidade, data.uf].filter(Boolean).join("/");
  return `${street}${neighborhood} — ${city} — CEP ${formatCep(data.cep)}`;
}

export async function fetchCep(cep) {
  const digits = sanitizeCep(cep);

  if (digits.length !== 8) {
    const error = new Error("Informe um CEP válido com 8 dígitos.");
    error.status = 400;
    throw error;
  }

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error("Falha ao consultar a ViaCEP.");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  if (data.erro) {
    const error = new Error("CEP não encontrado.");
    error.status = 404;
    throw error;
  }

  return {
    cep: formatCep(data.cep),
    logradouro: data.logradouro || "",
    complemento: data.complemento || "",
    bairro: data.bairro || "",
    localidade: data.localidade || "",
    uf: data.uf || "",
    ibge: data.ibge || "",
    ddd: data.ddd || "",
    formatted: formatAddress(data),
  };
}

export function toAirtableCepFields(address) {
  return {
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
  };
}
