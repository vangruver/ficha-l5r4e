// Regras derivadas do sistema. As que dependem de tabelas do Core (Sabedoria,
// NA, Iniciativa, Nível de Ferimento, Recuperação) foram conferidas contra a
// ficha de personagem oficial (Core Rulebook PT-BR, pág. 391-395) em 09/out —
// ver STATUS.md, seção "Redesenho contra a ficha oficial".

// Anel elemental = o menor dos 2 Traits dele. Vazio não segue essa regra,
// é um valor próprio (personagem.anelVazio).
export function anelRank(traitA, traitB) {
  return Math.min(traitA ?? 0, traitB ?? 0);
}

export function aneisDerivados(traits) {
  return {
    earth: anelRank(traits.stamina, traits.willpower),
    air: anelRank(traits.reflexes, traits.awareness),
    water: anelRank(traits.strength, traits.perception),
    fire: anelRank(traits.agility, traits.intelligence),
  };
}

// Soma líquida de pontos em Vantagens/Desvantagens: custo das vantagens
// menos o que as desvantagens concedem. Limite oficial de Desvantagens
// confirmado contra o Core Rulebook PT-BR, pág. 106: máximo de 10 pontos
// extras de XP concedidos por Desvantagens (excesso não bloqueado aqui,
// só sinalizado — a ficha não impede escolhas narrativas do jogador).
export const LIMITE_PONTOS_DESVANTAGENS = 10;

export function saldoVantagensDesvantagens(db, personagem) {
  const custoVantagens = (personagem.vantagens || [])
    .map((id) => db.advantages.find((a) => a.id === id)?.custo_pontos ?? 0)
    .reduce((a, b) => a + b, 0);
  const pontosDesvantagens = (personagem.desvantagens || [])
    .map((id) => db.disadvantages.find((d) => d.id === id)?.pontos_concedidos ?? 0)
    .reduce((a, b) => a + b, 0);
  const acimaDoLimite = pontosDesvantagens > LIMITE_PONTOS_DESVANTAGENS;
  return {
    custoVantagens,
    pontosDesvantagens,
    saldo: custoVantagens - pontosDesvantagens,
    acimaDoLimite,
  };
}

// Técnicas de escola que o personagem já tem, dado o rank de escola atual
// (rank 1 até o rank escolhido, na ordem que o livro lista).
export function tecnicasDeEscola(escola, rankAtual) {
  if (!escola) return [];
  return (escola.tecnica_por_rank || []).filter((t) => t.rank <= (rankAtual ?? 1));
}

// ---------------------------------------------------------------------------
// Sabedoria (= "Insight Rank" em inglês — termo oficial da ficha é
// "Sabedoria", não "Discernimento", ver STATUS.md). Fórmula da ficha oficial:
// (soma dos 5 Anéis x 10) + soma dos níveis de Perícia.
// ---------------------------------------------------------------------------
export function somaSkillRanks(personagem) {
  return (personagem.skills || []).reduce((total, s) => total + (s.rank || 0), 0);
}

export function sabedoriaTotal(personagem) {
  const aneis = aneisDerivados(personagem.traits);
  const somaAneis = aneis.earth + aneis.air + aneis.water + aneis.fire + (personagem.anelVazio || 0);
  return somaAneis * 10 + somaSkillRanks(personagem);
}

// Rank de Sabedoria correspondente a um total de pontos, pela tabela extraída
// do Core (data/core/ranks-sabedoria.json). Só vai até o Rank 8 (0-324
// pontos) — ver ressalva no STATUS.md sobre a tabela poder ter ranks mais
// altos que a extração não pegou. Acima de 324, mostra "8+" em vez de
// inventar um rank que não foi confirmado contra o livro.
export function rankSabedoria(db, totalPontos) {
  const tabela = db.ranksSabedoria || [];
  const faixa = tabela.find((r) =>
    totalPontos >= r.sabedoria_minima && (r.sabedoria_maxima == null || totalPontos <= r.sabedoria_maxima));
  if (faixa) return String(faixa.rank);
  const maiorRank = tabela.reduce((max, r) => Math.max(max, r.rank), 0);
  return maiorRank ? `${maiorRank}+` : "?";
}

function paraNumero(txt) {
  const n = parseInt(String(txt ?? "").replace(/[^-\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

// NA (Número de Armadura) base: (Reflexos x 5) + 5 + bônus da armadura
// equipada (personagem.armadura.bonusNA, campo de texto livre — aceita
// "+2", "2" etc.).
export function naTotal(personagem) {
  const base = (personagem.traits.reflexes || 0) * 5 + 5;
  return base + paraNumero(personagem.armadura?.bonusNA);
}

// Iniciativa é um pool de dados (Rolar X, manter Y), não um número único —
// só sai um valor de verdade quando rola de fato. Fórmula oficial: rolar
// (Sabedoria + Reflexos), manter Reflexos.
export function iniciativaPool(db, personagem) {
  const rank = Number(rankSabedoria(db, sabedoriaTotal(personagem)).replace("+", "")) || 0;
  const reflexos = personagem.traits.reflexes || 0;
  return { rolar: rank + reflexos, manter: reflexos };
}

// Recuperação de Ferimentos: Vigor x2 + Sabedoria (rank).
export function recuperacaoFerimentos(db, personagem) {
  const rank = Number(rankSabedoria(db, sabedoriaTotal(personagem)).replace("+", "")) || 0;
  return (personagem.traits.stamina || 0) * 2 + rank;
}

// Nível de Ferimento atual, a partir do dano acumulado e do Anel de Terra —
// os limites são cumulativos (cada nível soma multiplicador_anel_terra x
// Anel de Terra ao limite do nível anterior; "Saudável" é a base, não um
// incremento). Ver data/core/niveis-ferimento.json e a nota da ficha
// oficial: "Terra x2 por Nível, Terra x5 para Saudável".
export function nivelFerimentoAtual(db, personagem) {
  const tabela = db.niveisFerimento || [];
  if (!tabela.length) return null;
  const anelTerra = aneisDerivados(personagem.traits).earth;
  const dano = personagem.feridasAtuais || 0;

  let acumulado = 0;
  let resultado = null;
  for (const nivel of tabela) {
    acumulado += (nivel.multiplicador_anel_terra || 0) * anelTerra;
    resultado = { ...nivel, limite: acumulado };
    if (dano <= acumulado) break;
  }
  return resultado;
}
