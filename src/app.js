import { carregarBanco, porId } from "./database.js";
import * as storage from "./storage.js";
import * as regras from "./rules.js";
import { montarCompendio } from "./compendio.js";
import { montarWiki } from "./wiki.js";
import { iniciarTema } from "./tema.js";

function esc(txt) {
  return (txt ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function $(id) { return document.getElementById(id); }

const GRUPOS_ANEL = [
  { nome: "Terra", chave: "earth", traits: [["stamina", "Vigor"], ["willpower", "Vontade"]] },
  { nome: "Ar", chave: "air", traits: [["reflexes", "Reflexos"], ["awareness", "Prontidão"]] },
  { nome: "Água", chave: "water", traits: [["strength", "Força"], ["perception", "Percepção"]] },
  { nome: "Fogo", chave: "fire", traits: [["agility", "Agilidade"], ["intelligence", "Intelecto"]] },
];

const TRAIT_POR_NOME_EN = Object.fromEntries(
  ["stamina", "willpower", "reflexes", "awareness", "strength", "perception", "agility", "intelligence"]
    .map((k) => [k, k])
);
function traitKeyPorNome(nome) {
  return TRAIT_POR_NOME_EN[(nome || "").trim().toLowerCase()] || null;
}

let db = null;
let personagem = null;
let compendioMontado = false;
let wikiMontada = false;

async function iniciar() {
  iniciarTema();
  db = await carregarBanco();
  montarTabsTopo();
  iniciarPersonagem();
  preencherSelectsEstaticos();
  renderizarFicha();
  registrarEventosFicha();
}

function montarTabsTopo() {
  document.querySelectorAll(".tab-topo").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-topo").forEach((b) => b.classList.toggle("on", b === btn));
      const alvo = btn.dataset.tab;
      $("painel-ficha").hidden = alvo !== "ficha";
      $("painel-compendio").hidden = alvo !== "compendio";
      $("painel-wiki").hidden = alvo !== "wiki";
      if (alvo === "compendio" && !compendioMontado) {
        montarCompendio(db);
        compendioMontado = true;
      }
      if (alvo === "wiki" && !wikiMontada) {
        montarWiki(db);
        wikiMontada = true;
      }
    });
  });
}

function iniciarPersonagem() {
  const ativoId = storage.getPersonagemAtivoId();
  personagem = (ativoId && storage.carregarPersonagem(ativoId)) || storage.listarPersonagens()[0] || storage.novoPersonagem();
  storage.setPersonagemAtivoId(personagem.id);
  storage.salvarPersonagem(personagem);
  montarSelPersonagem();
}

function montarSelPersonagem() {
  const sel = $("sel-personagem");
  const lista = storage.listarPersonagens();
  sel.innerHTML = lista
    .map((p) => `<option value="${esc(p.id)}"${p.id === personagem.id ? " selected" : ""}>${esc(p.nome || "(sem nome)")}</option>`)
    .join("");
}

function trocarPersonagem(id) {
  const p = storage.carregarPersonagem(id);
  if (!p) return;
  personagem = p;
  storage.setPersonagemAtivoId(id);
  renderizarFicha();
}

function renderizarCombate() {
  const total = regras.sabedoriaTotal(personagem);
  const rank = regras.rankSabedoria(db, total);
  $("calc-sabedoria-total").textContent = total;
  $("calc-sabedoria-rank").textContent = rank;
  $("calc-na").textContent = regras.naTotal(personagem);
  const ini = regras.iniciativaPool(db, personagem);
  $("calc-iniciativa").textContent = `${ini.rolar}k${ini.manter}`;
  const nivel = regras.nivelFerimentoAtual(db, personagem);
  $("calc-nivel-ferimento").textContent = nivel ? nivel.nome_pt : "—";
  $("calc-penalidade-ferimento").textContent = nivel ? (nivel.penalidade ? `+${nivel.penalidade}` : "+0") : "—";
  $("f-recuperacao").value = regras.recuperacaoFerimentos(db, personagem);
}

let timerIndicador = null;
function salvar() {
  storage.salvarPersonagem(personagem);
  montarSelPersonagem();
  renderizarCombate();
  const ind = $("salvo-indicador");
  ind.textContent = "salvo";
  clearTimeout(timerIndicador);
  timerIndicador = setTimeout(() => { ind.textContent = ""; }, 1200);
}

function preencherSelectsEstaticos() {
  const clas = [...new Set(db.schools.map((s) => s.cla).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  $("f-cla").innerHTML = `<option value="">— escolha —</option>` + clas.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

  $("f-skill-select").innerHTML = `<option value="">— skill do compêndio —</option>` +
    db.skills.map((s) => `<option value="${esc(s.nome)}">${esc(s.nome)} (${esc(s.trait_associado)})</option>`).join("");

  $("f-vantagem-select").innerHTML = `<option value="">— vantagem —</option>` +
    db.advantages.map((a) => `<option value="${esc(a.id)}">${esc(a.nome)} (${esc(a.custo_pontos)} pts)</option>`).join("");
  $("f-desvantagem-select").innerHTML = `<option value="">— desvantagem —</option>` +
    db.disadvantages.map((d) => `<option value="${esc(d.id)}">${esc(d.nome)} (+${esc(d.pontos_concedidos)} pts)</option>`).join("");

  $("f-tecnica-extra-select").innerHTML = `<option value="">— kata/kiho —</option>` +
    db.kataKiho.map((t) => `<option value="${esc(t.id)}">${esc(t.nome)} (${esc(t.tipo)})</option>`).join("");

  const escolasOrdenadas = [...db.schools].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  $("f-escola-adicional-select").innerHTML = `<option value="">— escola —</option>` +
    escolasOrdenadas.map((s) => `<option value="${esc(s.id)}">${esc(s.nome)} (${esc(s.cla)})</option>`).join("");
}

function escolasDoCla(cla) {
  if (!cla) return db.schools;
  return db.schools.filter((s) => s.cla === cla);
}

function atualizarSelectEscola() {
  const cla = $("f-cla").value;
  const escolas = escolasDoCla(cla);
  $("f-escola").innerHTML = `<option value="">— escolha —</option>` +
    escolas.map((s) => `<option value="${esc(s.id)}"${s.id === personagem.escolaId ? " selected" : ""}>${esc(s.nome)}</option>`).join("");
}

function aplicarEscola(novoEscolaId) {
  const jaTinhaEscola = !!personagem.escolaId;
  personagem.escolaId = novoEscolaId;
  const escola = porId(db.schools, novoEscolaId);

  if (escola && !jaTinhaEscola) {
    // 1ª escolha de escola: aplica os bônus iniciais do livro sozinho.
    const traitKey = traitKeyPorNome(escola.trait_inicial_bonus);
    if (traitKey) personagem.traits[traitKey] = (personagem.traits[traitKey] || 0) + 1;
    if (typeof escola.honra_inicial === "number") personagem.honra = escola.honra_inicial;
    if (typeof escola.status_inicial === "number") personagem.status = escola.status_inicial;
    for (const texto of escola.skills_de_escola || []) {
      if (!/^any\b/i.test(texto.trim()) && !personagem.skills.some((s) => s.texto === texto)) {
        personagem.skills.push({ texto, rank: 1, emphases: [], deEscola: true });
      }
    }
  }
  salvar();
  renderizarFicha();
}

function renderizarEscolaResumo() {
  const escola = porId(db.schools, personagem.escolaId);
  const el = $("escola-resumo");
  if (!escola) {
    el.textContent = "Escolher uma escola pela 1ª vez aplica sozinho: bônus de trait (+1), honra/status inicial e as skills de escola. Trocar de escola depois NÃO desfaz isso — ajuste manualmente.";
    return;
  }
  el.textContent = `${escola.tipo} · ${escola.familia} · bônus inicial: ${escola.trait_inicial_bonus}. Equipamento sugerido e técnicas abaixo. Trocar de escola depois não desfaz bônus já aplicados.`;
}

function renderizarAneis() {
  const aneis = regras.aneisDerivados(personagem.traits);
  const wrap = $("grid-aneis");
  wrap.innerHTML = GRUPOS_ANEL.map((g) => `
    <div class="anel-box">
      <h4>${g.nome} <span class="tag">Anel ${aneis[g.chave]}</span></h4>
      ${g.traits.map(([key, label]) => `
        <div class="trait-linha">
          <span>${label}</span>
          <button class="menos" data-trait="${key}" data-delta="-1" type="button">−</button>
          <b>${personagem.traits[key]}</b>
          <button class="mais" data-trait="${key}" data-delta="1" type="button">+</button>
        </div>`).join("")}
    </div>`).join("") + `
    <div class="anel-box">
      <h4>Vazio <span class="tag">Anel ${personagem.anelVazio}</span></h4>
      <div class="trait-linha">
        <span>Rank</span>
        <button class="menos" data-vazio="-1" type="button">−</button>
        <b>${personagem.anelVazio}</b>
        <button class="mais" data-vazio="1" type="button">+</button>
      </div>
    </div>`;

  wrap.querySelectorAll("button[data-trait]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.trait;
      const delta = Number(btn.dataset.delta);
      personagem.traits[key] = Math.max(1, Math.min(10, (personagem.traits[key] || 0) + delta));
      salvar();
      renderizarAneis();
    });
  });
  wrap.querySelectorAll("button[data-vazio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = Number(btn.dataset.vazio);
      personagem.anelVazio = Math.max(1, Math.min(10, (personagem.anelVazio || 0) + delta));
      salvar();
      $("f-anel-vazio").value = personagem.anelVazio;
      renderizarAneis();
    });
  });
}

function renderizarSkills() {
  const wrap = $("lista-skills");
  wrap.innerHTML = (personagem.skills || []).map((sk, i) => `
    <div class="item-linha">
      <span class="nome">${esc(sk.texto)}${sk.deEscola ? ' <span class="tag" title="Skill de escola">escola</span>' : ""}</span>
      <button class="menos" data-acao="skill-menos" data-i="${i}" type="button">−</button>
      <b>${sk.rank}</b>
      <button class="mais" data-acao="skill-mais" data-i="${i}" type="button">+</button>
      <button class="remover" data-acao="skill-remover" data-i="${i}" type="button">×</button>
    </div>`).join("") || `<p class="vazio-mini">Nenhuma skill ainda.</p>`;

  wrap.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => {
    const i = Number(btn.dataset.i);
    const acao = btn.dataset.acao;
    if (acao === "skill-remover") personagem.skills.splice(i, 1);
    if (acao === "skill-mais") personagem.skills[i].rank = Math.min(10, personagem.skills[i].rank + 1);
    if (acao === "skill-menos") personagem.skills[i].rank = Math.max(0, personagem.skills[i].rank - 1);
    salvar();
    renderizarSkills();
  }));
}

function renderizarTecnicas() {
  const escola = porId(db.schools, personagem.escolaId);
  const wrap = $("lista-tecnicas");
  const tecnicas = regras.tecnicasDeEscola(escola, personagem.rankEscola);
  wrap.innerHTML = tecnicas.map((t) => `
    <div class="item-linha tecnica-linha">
      <span class="nome">Rank ${esc(t.rank)} — ${esc(t.nome)}</span>
      <p>${esc(t.texto_pt)}</p>
    </div>`).join("") || `<p class="vazio-mini">${escola ? "Nenhuma técnica até esse rank." : "Escolha uma escola primeiro."}</p>`;
}

function renderizarTecnicasExtras() {
  const wrap = $("lista-tecnicas-extras");
  wrap.innerHTML = (personagem.tecnicasExtras || []).map((id, i) => {
    const t = porId(db.kataKiho, id);
    return `<div class="item-linha tecnica-linha">
      <span class="nome">${esc(t?.nome || id)} <span class="tag">${esc(t?.tipo || "")}</span>
        <button class="remover" data-acao="tecnica-extra-remover" data-i="${i}" type="button">×</button></span>
      <p>${esc(t?.texto_pt || "")}</p>
    </div>`;
  }).join("") || `<p class="vazio-mini">Nenhuma ainda.</p>`;

  wrap.querySelectorAll('[data-acao="tecnica-extra-remover"]').forEach((btn) => btn.addEventListener("click", () => {
    personagem.tecnicasExtras.splice(Number(btn.dataset.i), 1);
    salvar();
    renderizarTecnicasExtras();
  }));
}

function renderizarEscolasAdicionais() {
  const wrap = $("lista-escolas-adicionais");
  wrap.innerHTML = (personagem.escolasAdicionais || []).map((id, i) => {
    const s = porId(db.schools, id);
    return `<div class="item-linha">
      <span class="nome">${esc(s?.nome || id)}${s ? ` <span class="tag">${esc(s.cla)}</span>` : ""}</span>
      <button class="remover" data-acao="escola-adicional-remover" data-i="${i}" type="button">×</button>
    </div>`;
  }).join("") || `<p class="vazio-mini">Nenhuma ainda.</p>`;

  wrap.querySelectorAll('[data-acao="escola-adicional-remover"]').forEach((btn) => btn.addEventListener("click", () => {
    personagem.escolasAdicionais.splice(Number(btn.dataset.i), 1);
    salvar();
    renderizarEscolasAdicionais();
  }));
}

function renderizarVantagensDesvantagens() {
  const { custoVantagens, pontosDesvantagens, saldo } = regras.saldoVantagensDesvantagens(db, personagem);
  $("saldo-vd").textContent = `Vantagens: ${custoVantagens} pts · Desvantagens concedem: ${pontosDesvantagens} pts · saldo: ${saldo} (limite oficial de Desvantagens ainda não confirmado contra o Core)`;

  $("lista-vantagens").innerHTML = (personagem.vantagens || []).map((id, i) => {
    const a = porId(db.advantages, id);
    return `<div class="item-linha">
      <span class="nome">${esc(a?.nome || id)} <span class="tag">${esc(a?.custo_pontos ?? "?")} pts</span></span>
      <button class="remover" data-acao="vantagem-remover" data-i="${i}" type="button">×</button>
    </div>`;
  }).join("");

  $("lista-desvantagens").innerHTML = (personagem.desvantagens || []).map((id, i) => {
    const d = porId(db.disadvantages, id);
    return `<div class="item-linha">
      <span class="nome">${esc(d?.nome || id)} <span class="tag">+${esc(d?.pontos_concedidos ?? "?")} pts</span></span>
      <button class="remover" data-acao="desvantagem-remover" data-i="${i}" type="button">×</button>
    </div>`;
  }).join("");

  document.querySelectorAll('[data-acao="vantagem-remover"]').forEach((btn) => btn.addEventListener("click", () => {
    personagem.vantagens.splice(Number(btn.dataset.i), 1);
    salvar();
    renderizarVantagensDesvantagens();
  }));
  document.querySelectorAll('[data-acao="desvantagem-remover"]').forEach((btn) => btn.addEventListener("click", () => {
    personagem.desvantagens.splice(Number(btn.dataset.i), 1);
    salvar();
    renderizarVantagensDesvantagens();
  }));
}

function renderizarEquipamento() {
  const escola = porId(db.schools, personagem.escolaId);
  const inicialWrap = $("equip-inicial-wrap");
  const sugestoes = escola?.equipamento_inicial || [];
  inicialWrap.innerHTML = sugestoes.length
    ? `<p class="nota">Equipamento inicial sugerido pela escola (clique pra adicionar):</p>
       <div class="chips">${sugestoes.map((s, i) => `<button class="chip" data-acao="equip-sugestao" data-i="${i}" type="button">+ ${esc(s)}</button>`).join("")}</div>`
    : "";
  inicialWrap.querySelectorAll('[data-acao="equip-sugestao"]').forEach((btn) => btn.addEventListener("click", () => {
    const texto = sugestoes[Number(btn.dataset.i)];
    personagem.equipamento.push({ nome: texto, qtd: 1, local: "mochila" });
    salvar();
    renderizarEquipamento();
  }));

  const ROTULO_LOCAL = { mochila: "mochila", casa: "casa", ambos: "ambos" };
  const wrap = $("lista-equipamento");
  wrap.innerHTML = (personagem.equipamento || []).map((eq, i) => `
    <div class="item-linha">
      <span class="nome">${esc(eq.nome)} <span class="tag">${esc(ROTULO_LOCAL[eq.local] || "mochila")}</span></span>
      <button class="menos" data-acao="equip-menos" data-i="${i}" type="button">−</button>
      <b>${eq.qtd}</b>
      <button class="mais" data-acao="equip-mais" data-i="${i}" type="button">+</button>
      <button class="remover" data-acao="equip-remover" data-i="${i}" type="button">×</button>
    </div>`).join("") || `<p class="vazio-mini">Nenhum item ainda.</p>`;

  wrap.querySelectorAll("button").forEach((btn) => btn.addEventListener("click", () => {
    const i = Number(btn.dataset.i);
    const acao = btn.dataset.acao;
    if (acao === "equip-remover") personagem.equipamento.splice(i, 1);
    if (acao === "equip-mais") personagem.equipamento[i].qtd += 1;
    if (acao === "equip-menos") personagem.equipamento[i].qtd = Math.max(1, personagem.equipamento[i].qtd - 1);
    salvar();
    renderizarEquipamento();
  }));
}

function renderizarFicha() {
  $("f-nome").value = personagem.nome || "";
  $("f-cla").value = personagem.cla || "";
  $("f-familia").value = personagem.familia || "";
  atualizarSelectEscola();
  $("f-escola").value = personagem.escolaId || "";
  $("f-rank-escola").value = personagem.rankEscola || 1;
  renderizarEscolaResumo();
  $("f-afinidade").value = personagem.afinidade || "";
  $("f-deficiencia").value = personagem.deficiencia || "";
  renderizarEscolasAdicionais();
  renderizarAneis();
  renderizarCombate();
  renderizarSkills();
  renderizarTecnicas();
  renderizarTecnicasExtras();
  renderizarVantagensDesvantagens();
  $("f-honra").value = personagem.honra;
  $("f-gloria").value = personagem.gloria;
  $("f-status").value = personagem.status;
  $("f-infamia").value = personagem.infamia;
  $("f-macula").value = personagem.maculaTerrasSombrias;
  $("f-anel-vazio").value = personagem.anelVazio;
  $("f-vazio-gastos").value = personagem.pontosVazioGastos;
  $("f-feridas").value = personagem.feridasAtuais;
  $("f-arma1-tipo").value = personagem.armas.arma1.tipo;
  $("f-arma1-ataque").value = personagem.armas.arma1.ataque;
  $("f-arma1-dano").value = personagem.armas.arma1.dano;
  $("f-arma1-bonus").value = personagem.armas.arma1.bonus;
  $("f-arma1-notas").value = personagem.armas.arma1.notas;
  $("f-arma2-tipo").value = personagem.armas.arma2.tipo;
  $("f-arma2-ataque").value = personagem.armas.arma2.ataque;
  $("f-arma2-dano").value = personagem.armas.arma2.dano;
  $("f-arma2-bonus").value = personagem.armas.arma2.bonus;
  $("f-arma2-notas").value = personagem.armas.arma2.notas;
  $("f-flechas-tipo").value = personagem.armas.flechas.tipo;
  $("f-flechas-dano").value = personagem.armas.flechas.dano;
  $("f-flechas-qtd").value = personagem.armas.flechas.quantidade;
  $("f-armadura-tipo").value = personagem.armadura.tipo;
  $("f-armadura-bonus-na").value = personagem.armadura.bonusNA;
  $("f-armadura-reducao").value = personagem.armadura.reducao;
  $("f-armadura-qualidade").value = personagem.armadura.qualidade;
  $("f-armadura-notas").value = personagem.armadura.notas;
  renderizarEquipamento();
  $("f-koku").value = personagem.dinheiro.koku;
  $("f-bu").value = personagem.dinheiro.bu;
  $("f-zeni").value = personagem.dinheiro.zeni;
  $("f-info-sexo").value = personagem.infoPessoal.sexo;
  $("f-info-idade").value = personagem.infoPessoal.idade;
  $("f-info-altura").value = personagem.infoPessoal.altura;
  $("f-info-peso").value = personagem.infoPessoal.peso;
  $("f-info-cabelos").value = personagem.infoPessoal.cabelos;
  $("f-info-olhos").value = personagem.infoPessoal.olhos;
  $("f-info-pai").value = personagem.infoPessoal.pai;
  $("f-info-mae").value = personagem.infoPessoal.mae;
  $("f-info-irmaos").value = personagem.infoPessoal.irmaos;
  $("f-info-estado-civil").value = personagem.infoPessoal.estadoCivil;
  $("f-info-conjuge").value = personagem.infoPessoal.conjuge;
  $("f-info-filhos").value = personagem.infoPessoal.filhos;
  $("f-notas").value = personagem.notas || "";
}

function bindTexto(id, campo) {
  $(id).addEventListener("change", () => { personagem[campo] = $(id).value; salvar(); });
}
function bindNumero(id, campo, { min = null, max = null } = {}) {
  $(id).addEventListener("change", () => {
    let v = Number($(id).value);
    if (!Number.isFinite(v)) v = 0;
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    personagem[campo] = v;
    $(id).value = v;
    salvar();
  });
}
function bindDinheiro(id, campo) {
  $(id).addEventListener("change", () => {
    let v = Math.max(0, Number($(id).value) || 0);
    personagem.dinheiro[campo] = v;
    $(id).value = v;
    salvar();
  });
}
// Campo texto dentro de um objeto aninhado do personagem, ex. armas.arma1.tipo
// ou infoPessoal.sexo — caminho é a lista de chaves até o campo final.
function bindTextoAninhado(id, ...caminho) {
  $(id).addEventListener("change", () => {
    let alvo = personagem;
    for (let i = 0; i < caminho.length - 1; i++) alvo = alvo[caminho[i]];
    alvo[caminho[caminho.length - 1]] = $(id).value;
    salvar();
  });
}

function registrarEventosFicha() {
  bindTexto("f-nome", "nome");
  bindTexto("f-familia", "familia");
  bindTexto("f-notas", "notas");
  bindNumero("f-honra", "honra", { min: 0, max: 10 });
  bindNumero("f-gloria", "gloria", { min: 0, max: 10 });
  bindNumero("f-status", "status", { min: 0, max: 10 });
  bindNumero("f-infamia", "infamia", { min: 0, max: 10 });
  bindNumero("f-macula", "maculaTerrasSombrias", { min: 0, max: 10 });
  bindNumero("f-vazio-gastos", "pontosVazioGastos", { min: 0 });
  bindNumero("f-feridas", "feridasAtuais", { min: 0 });
  bindDinheiro("f-koku", "koku");
  bindDinheiro("f-bu", "bu");
  bindDinheiro("f-zeni", "zeni");

  bindTextoAninhado("f-arma1-tipo", "armas", "arma1", "tipo");
  bindTextoAninhado("f-arma1-ataque", "armas", "arma1", "ataque");
  bindTextoAninhado("f-arma1-dano", "armas", "arma1", "dano");
  bindTextoAninhado("f-arma1-bonus", "armas", "arma1", "bonus");
  bindTextoAninhado("f-arma1-notas", "armas", "arma1", "notas");
  bindTextoAninhado("f-arma2-tipo", "armas", "arma2", "tipo");
  bindTextoAninhado("f-arma2-ataque", "armas", "arma2", "ataque");
  bindTextoAninhado("f-arma2-dano", "armas", "arma2", "dano");
  bindTextoAninhado("f-arma2-bonus", "armas", "arma2", "bonus");
  bindTextoAninhado("f-arma2-notas", "armas", "arma2", "notas");
  bindTextoAninhado("f-flechas-tipo", "armas", "flechas", "tipo");
  bindTextoAninhado("f-flechas-dano", "armas", "flechas", "dano");
  bindTextoAninhado("f-flechas-qtd", "armas", "flechas", "quantidade");

  bindTextoAninhado("f-armadura-tipo", "armadura", "tipo");
  bindTextoAninhado("f-armadura-bonus-na", "armadura", "bonusNA");
  bindTextoAninhado("f-armadura-reducao", "armadura", "reducao");
  bindTextoAninhado("f-armadura-qualidade", "armadura", "qualidade");
  bindTextoAninhado("f-armadura-notas", "armadura", "notas");

  bindTextoAninhado("f-info-sexo", "infoPessoal", "sexo");
  bindTextoAninhado("f-info-idade", "infoPessoal", "idade");
  bindTextoAninhado("f-info-altura", "infoPessoal", "altura");
  bindTextoAninhado("f-info-peso", "infoPessoal", "peso");
  bindTextoAninhado("f-info-cabelos", "infoPessoal", "cabelos");
  bindTextoAninhado("f-info-olhos", "infoPessoal", "olhos");
  bindTextoAninhado("f-info-pai", "infoPessoal", "pai");
  bindTextoAninhado("f-info-mae", "infoPessoal", "mae");
  bindTextoAninhado("f-info-irmaos", "infoPessoal", "irmaos");
  bindTextoAninhado("f-info-estado-civil", "infoPessoal", "estadoCivil");
  bindTextoAninhado("f-info-conjuge", "infoPessoal", "conjuge");
  bindTextoAninhado("f-info-filhos", "infoPessoal", "filhos");

  $("f-afinidade").addEventListener("change", () => { personagem.afinidade = $("f-afinidade").value; salvar(); });
  $("f-deficiencia").addEventListener("change", () => { personagem.deficiencia = $("f-deficiencia").value; salvar(); });

  $("f-anel-vazio").addEventListener("change", () => {
    const v = Math.max(1, Math.min(10, Number($("f-anel-vazio").value) || 1));
    personagem.anelVazio = v;
    salvar();
    renderizarAneis();
  });

  $("f-rank-escola").addEventListener("change", () => {
    const v = Math.max(1, Math.min(10, Number($("f-rank-escola").value) || 1));
    personagem.rankEscola = v;
    $("f-rank-escola").value = v;
    salvar();
    renderizarTecnicas();
  });

  $("f-cla").addEventListener("change", () => {
    personagem.cla = $("f-cla").value;
    atualizarSelectEscola();
    salvar();
  });

  $("f-escola").addEventListener("change", () => aplicarEscola($("f-escola").value));

  $("btn-add-skill").addEventListener("click", () => {
    const texto = $("f-skill-select").value;
    if (texto && !personagem.skills.some((s) => s.texto === texto)) {
      personagem.skills.push({ texto, rank: 1, emphases: [] });
      salvar();
      renderizarSkills();
    }
  });

  $("btn-add-vantagem").addEventListener("click", () => {
    const id = $("f-vantagem-select").value;
    if (id && !personagem.vantagens.includes(id)) {
      personagem.vantagens.push(id);
      salvar();
      renderizarVantagensDesvantagens();
    }
  });
  $("btn-add-desvantagem").addEventListener("click", () => {
    const id = $("f-desvantagem-select").value;
    if (id && !personagem.desvantagens.includes(id)) {
      personagem.desvantagens.push(id);
      salvar();
      renderizarVantagensDesvantagens();
    }
  });

  $("btn-add-equip").addEventListener("click", () => {
    const nome = $("f-equip-nome").value.trim();
    const qtd = Math.max(1, Number($("f-equip-qtd").value) || 1);
    const local = $("f-equip-local").value || "mochila";
    if (nome) {
      personagem.equipamento.push({ nome, qtd, local });
      $("f-equip-nome").value = "";
      $("f-equip-qtd").value = 1;
      salvar();
      renderizarEquipamento();
    }
  });

  $("btn-add-tecnica-extra").addEventListener("click", () => {
    const id = $("f-tecnica-extra-select").value;
    if (id && !personagem.tecnicasExtras.includes(id)) {
      personagem.tecnicasExtras.push(id);
      salvar();
      renderizarTecnicasExtras();
    }
  });

  $("btn-add-escola-adicional").addEventListener("click", () => {
    const id = $("f-escola-adicional-select").value;
    if (id && !personagem.escolasAdicionais.includes(id)) {
      personagem.escolasAdicionais.push(id);
      salvar();
      renderizarEscolasAdicionais();
    }
  });

  $("sel-personagem").addEventListener("change", () => trocarPersonagem($("sel-personagem").value));

  $("btn-novo-personagem").addEventListener("click", () => {
    personagem = storage.novoPersonagem();
    storage.setPersonagemAtivoId(personagem.id);
    storage.salvarPersonagem(personagem);
    montarSelPersonagem();
    renderizarFicha();
  });

  $("btn-excluir-personagem").addEventListener("click", () => {
    if (!confirm(`Excluir "${personagem.nome || "(sem nome)"}"? Não tem como desfazer.`)) return;
    storage.excluirPersonagem(personagem.id);
    const lista = storage.listarPersonagens();
    personagem = lista[0] || storage.novoPersonagem();
    storage.setPersonagemAtivoId(personagem.id);
    storage.salvarPersonagem(personagem);
    montarSelPersonagem();
    renderizarFicha();
  });
}

iniciar();
