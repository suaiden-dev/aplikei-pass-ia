export interface BrazilCepResult {
  street: string;
  city: string;
  state: string;
  country: "Brasil";
}

export interface UsZipResult {
  city: string;
  state: string;
  country: "United States";
  places: Array<{ city: string; state: string; stateName?: string }>;
}

export async function lookupBrazilCep(cep: string): Promise<BrazilCepResult | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  if (!response.ok) return null;

  const data = await response.json() as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };
  if (data.erro) return null;

  return {
    street: data.logradouro ? `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}` : "",
    city: data.localidade || "",
    state: data.uf || "",
    country: "Brasil",
  };
}

export async function lookupUsZip(zip: string, signal?: AbortSignal): Promise<UsZipResult | null> {
  const cleanZip = zip.replace(/\D/g, "").slice(0, 5);
  if (cleanZip.length !== 5) return null;

  const response = await fetch(`https://api.zippopotam.us/us/${cleanZip}`, { signal });
  if (!response.ok) return null;

  const data = await response.json() as {
    places?: Array<{ "place name"?: string; "state abbreviation"?: string; state?: string }>;
  };
  const places = (data.places ?? []).map((place) => ({
    city: place["place name"] || "",
    state: place["state abbreviation"] || "",
    stateName: place.state || "",
  }));
  const first = places[0];
  if (!first) return null;

  return {
    city: first.city,
    state: first.state,
    country: "United States",
    places,
  };
}
