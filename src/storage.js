// Persistência local dos personagens (localStorage) — múltiplos personagens
// salvos, igual ao esquema do dnd-sheet/ficha-tormenta20.

const CHAVE_LISTA = "l5r4e.personagens";
const CHAVE_ATIVO = "l5r4e.personagemAtivoId";

function ok() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function lerTudo() {
  if (!ok()) return {};
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LISTA) || "{}");
  } catch {
    return {};
  }
}

function escreverTudo(mapa) {
  if (!ok()) return;
  localStorage.setItem(CHAVE_LISTA, JSON.stringify(mapa));
}

export function novoPersonagem() {
  return {
    id: (crypto.randomUUID ? crypto.randomUUID() : `p${Date.now()}${Math.random()}`),
    nome: "",
    cla: "",
    familia: "",
    escolaId: "",
    rankEscola: 1,
    escolasAdicionais: [], // ids de escola (multiclasse) — só registro, sem automação
    traits: {
      stamina: 2, willpower: 2,
      reflexes: 2, awareness: 2,
      strength: 2, perception: 2,
      agility: 2, intelligence: 2,
    },
    anelVazio: 2,
    afinidade: "", // anel, só pra Shugenja (manual — não vem da extração ainda)
    deficiencia: "", // anel, só pra Shugenja
    skills: [], // { texto, rank, emphases: [], deEscola: bool }
    tecnicasExtras: [], // ids de kata/kiho comprados fora da escola (do compêndio)
    magiasConhecidas: [], // ids do compêndio
    feiticosPorDia: {
      air: { max: 0, usados: 0 },
      earth: { max: 0, usados: 0 },
      fire: { max: 0, usados: 0 },
      water: { max: 0, usados: 0 },
      void: { max: 0, usados: 0 },
    }, // vagas de conjuração por dia, por anel — máximo digitado à mão (a fórmula oficial depende de Afinidade/Deficiência, não extraída ainda)
    vantagens: [], // ids
    desvantagens: [], // ids
    honra: 5.0,
    gloria: 0.0,
    status: 0.0,
    infamia: 0.0,
    maculaTerrasSombrias: 0.0,
    pontosVazioGastos: 0,
    feridasAtuais: 0,
    recuperacaoFerimentos: null, // calculado depois (Vigor x2 + Sabedoria); null = não calculado ainda
    armas: {
      arma1: { tipo: "", ataque: "", dano: "", bonus: "", notas: "" },
      arma2: { tipo: "", ataque: "", dano: "", bonus: "", notas: "" },
      flechas: { tipo: "", dano: "", quantidade: "" },
    },
    armadura: { tipo: "", bonusNA: "", reducao: "", qualidade: "", notas: "" },
    equipamento: [], // { nome, qtd, local: "mochila" | "casa" | "ambos" }
    dinheiro: { koku: 0, bu: 0, zeni: 0 },
    infoPessoal: {
      sexo: "", idade: "", altura: "", peso: "", cabelos: "", olhos: "",
      pai: "", mae: "", irmaos: "", estadoCivil: "", conjuge: "", filhos: "",
    },
    notas: "",
  };
}

// Preenche campos que faltarem num personagem salvo antes dessas chaves
// existirem — sem isso, abrir uma ficha salva antes do redesenho (09/out)
// quebra em qualquer render que leia um campo novo.
export function normalizar(p) {
  const base = novoPersonagem();
  const result = { ...base, ...p };
  result.traits = { ...base.traits, ...(p.traits || {}) };
  result.armas = {
    arma1: { ...base.armas.arma1, ...(p.armas?.arma1 || {}) },
    arma2: { ...base.armas.arma2, ...(p.armas?.arma2 || {}) },
    flechas: { ...base.armas.flechas, ...(p.armas?.flechas || {}) },
  };
  result.armadura = { ...base.armadura, ...(p.armadura || {}) };
  result.dinheiro = { ...base.dinheiro, ...(p.dinheiro || {}) };
  result.infoPessoal = { ...base.infoPessoal, ...(p.infoPessoal || {}) };
  result.escolasAdicionais = p.escolasAdicionais || [];
  result.equipamento = p.equipamento || [];
  result.skills = p.skills || [];
  result.magiasConhecidas = p.magiasConhecidas || [];
  result.feiticosPorDia = {
    air: { ...base.feiticosPorDia.air, ...(p.feiticosPorDia?.air || {}) },
    earth: { ...base.feiticosPorDia.earth, ...(p.feiticosPorDia?.earth || {}) },
    fire: { ...base.feiticosPorDia.fire, ...(p.feiticosPorDia?.fire || {}) },
    water: { ...base.feiticosPorDia.water, ...(p.feiticosPorDia?.water || {}) },
    void: { ...base.feiticosPorDia.void, ...(p.feiticosPorDia?.void || {}) },
  };
  return result;
}

export function listarPersonagens() {
  return Object.values(lerTudo())
    .map(normalizar)
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
}

export function carregarPersonagem(id) {
  const p = lerTudo()[id];
  return p ? normalizar(p) : null;
}

export function salvarPersonagem(p) {
  const mapa = lerTudo();
  mapa[p.id] = p;
  escreverTudo(mapa);
}

export function excluirPersonagem(id) {
  const mapa = lerTudo();
  delete mapa[id];
  escreverTudo(mapa);
}

export function getPersonagemAtivoId() {
  if (!ok()) return null;
  return localStorage.getItem(CHAVE_ATIVO);
}

export function setPersonagemAtivoId(id) {
  if (!ok()) return;
  localStorage.setItem(CHAVE_ATIVO, id);
}
