// Regras derivadas que são estáveis e bem conhecidas do sistema (não
// dependem da extração do Core ainda pendente — ver STATUS.md).

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
// menos o que as desvantagens concedem. O limite oficial de pontos de
// Desvantagem (lembrança: 10 pontos na 4ª ed.) ainda não foi confirmado
// contra o PDF nesta ficha — por isso só mostra o saldo, não bloqueia nada.
export function saldoVantagensDesvantagens(db, personagem) {
  const custoVantagens = (personagem.vantagens || [])
    .map((id) => db.advantages.find((a) => a.id === id)?.custo_pontos ?? 0)
    .reduce((a, b) => a + b, 0);
  const pontosDesvantagens = (personagem.desvantagens || [])
    .map((id) => db.disadvantages.find((d) => d.id === id)?.pontos_concedidos ?? 0)
    .reduce((a, b) => a + b, 0);
  return { custoVantagens, pontosDesvantagens, saldo: custoVantagens - pontosDesvantagens };
}

// Técnicas de escola que o personagem já tem, dado o rank de escola atual
// (rank 1 até o rank escolhido, na ordem que o livro lista).
export function tecnicasDeEscola(escola, rankAtual) {
  if (!escola) return [];
  return (escola.tecnica_por_rank || []).filter((t) => t.rank <= (rankAtual ?? 1));
}
