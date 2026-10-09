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
    traits: {
      stamina: 2, willpower: 2,
      reflexes: 2, awareness: 2,
      strength: 2, perception: 2,
      agility: 2, intelligence: 2,
    },
    anelVazio: 2,
    skills: [], // { id, rank, emphases: [] }
    tecnicasExtras: [], // ids de kata/kiho comprados fora da escola
    magiasConhecidas: [], // ids
    vantagens: [], // ids
    desvantagens: [], // ids
    honra: 5.0,
    gloria: 0.0,
    status: 0.0,
    infamia: 0.0,
    pontosVazioGastos: 0,
    feridasAtuais: 0,
    equipamento: [], // { nome, qtd }
    dinheiro: { koku: 0, bu: 0, zeni: 0 },
    notas: "",
  };
}

export function listarPersonagens() {
  return Object.values(lerTudo()).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
}

export function carregarPersonagem(id) {
  return lerTudo()[id] || null;
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
