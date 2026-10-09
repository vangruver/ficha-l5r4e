// Carrega e consulta os dados da ficha de L5R 4e: tabelas de regra escritas
// à mão (data/core, uma vez verificadas contra o livro) e o compêndio
// extraído dos 8 livros (data/raw, gerado por scripts/extract.py +
// scripts/merge.py a partir do PDF via Gemini).

const BASE = new URL(".", document.baseURI).pathname.replace(/\/$/, "");

async function carregarJSON(caminho, fallback = []) {
  try {
    const res = await fetch(`${BASE}/${caminho}`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Falha ao carregar ${caminho}:`, e);
    return fallback;
  }
}

let cache = null;

export async function carregarBanco() {
  if (cache) return cache;
  const [aneis, traits, schools, kataKiho, skills, spells, advantages, disadvantages, weapons, armor, gear, lore] =
    await Promise.all([
      carregarJSON("data/core/aneis.json"),
      carregarJSON("data/core/traits.json"),
      carregarJSON("data/raw/schools.json"),
      carregarJSON("data/raw/kata-kiho.json"),
      carregarJSON("data/raw/skills.json"),
      carregarJSON("data/raw/spells.json"),
      carregarJSON("data/raw/advantages.json"),
      carregarJSON("data/raw/disadvantages.json"),
      carregarJSON("data/raw/weapons.json"),
      carregarJSON("data/raw/armor.json"),
      carregarJSON("data/raw/gear.json"),
      // Wiki de lore (clãs) — gerada por scripts/extract_lore.py +
      // scripts/build_lore.py. Ainda não foi extraída (precisa de cota do
      // Gemini) — fica [] até lá, e a aba Wiki mostra um aviso.
      carregarJSON("data/lore/clas.json"),
    ]);
  cache = { aneis, traits, schools, kataKiho, skills, spells, advantages, disadvantages, weapons, armor, gear, lore };
  return cache;
}

export function porId(lista, id) {
  return lista.find((x) => x.id === id) ?? null;
}

function normalizar(txt) {
  return (txt ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Campos de texto que cada categoria pesquisa quando o usuário digita uma busca.
const CAMPOS_BUSCA = {
  schools: ["nome", "cla", "familia", "tipo"],
  kataKiho: ["nome", "anel_ou_trait", "texto_pt"],
  skills: ["nome", "trait_associado", "categoria"],
  spells: ["nome", "anel", "texto_pt"],
  advantages: ["nome", "texto_pt"],
  disadvantages: ["nome", "texto_pt"],
  weapons: ["nome"],
  armor: ["nome"],
  gear: ["nome", "efeito_pt"],
};

function bate(item, campos, busca) {
  if (!busca) return true;
  const alvo = normalizar(busca);
  return campos.some((campo) => normalizar(item[campo]).includes(alvo));
}

export function filtrar(db, categoria, { busca, ...filtros } = {}) {
  const lista = db[categoria] || [];
  const campos = CAMPOS_BUSCA[categoria] || ["nome"];
  return lista.filter((item) => {
    if (!bate(item, campos, busca)) return false;
    for (const [chave, valor] of Object.entries(filtros)) {
      if (!valor) continue;
      if (normalizar(item[chave]) !== normalizar(valor)) return false;
    }
    return true;
  });
}

export function valoresUnicos(db, categoria, campo) {
  const lista = db[categoria] || [];
  const vistos = new Map();
  for (const item of lista) {
    const v = item[campo];
    if (v && !vistos.has(normalizar(v))) vistos.set(normalizar(v), v);
  }
  return [...vistos.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
