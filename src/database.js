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
  const [
    aneis, traits, schools, kataKiho, skills, spells, advantages, disadvantages, weapons, armor, gear, lore,
    niveisFerimento, ranksSabedoria, formulas,
    clasMenores, faccoes, ordensMonasticas, reinosEspirituais, tradicoesMarciais,
    familias, artefatos, criaturas, locais, ameacas, estrangeiros,
  ] = await Promise.all([
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
    // Wiki de lore — gerada por scripts/extract_lore*.py + build_lore.py.
    // "lore" fica só com os 9 Clãs Grandes por compatibilidade com quem já
    // lia essa chave; as novas categorias vêm em campos próprios abaixo.
    carregarJSON("data/lore/clas.json"),
    // Tabelas universais extraídas do Core (scripts/extract_core_tables.py +
    // build_core.py) — usadas pelos cálculos em src/rules.js.
    carregarJSON("data/core/niveis-ferimento.json"),
    carregarJSON("data/core/ranks-sabedoria.json"),
    carregarJSON("data/core/formulas.json", {}),
    carregarJSON("data/lore/clas-menores.json"),
    carregarJSON("data/lore/faccoes.json"),
    carregarJSON("data/lore/ordens-monasticas.json"),
    carregarJSON("data/lore/reinos-espirituais.json"),
    carregarJSON("data/lore/tradicoes-marciais.json"),
    carregarJSON("data/lore/familias.json"),
    carregarJSON("data/lore/artefatos.json"),
    carregarJSON("data/lore/criaturas.json"),
    carregarJSON("data/lore/locais.json"),
    carregarJSON("data/lore/ameacas.json"),
    carregarJSON("data/lore/estrangeiros.json"),
  ]);
  cache = {
    aneis, traits, schools, kataKiho, skills, spells, advantages, disadvantages, weapons, armor, gear, lore,
    niveisFerimento, ranksSabedoria, formulas,
    clasMenores, faccoes, ordensMonasticas, reinosEspirituais, tradicoesMarciais,
    familias, artefatos, criaturas, locais, ameacas, estrangeiros,
  };
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
