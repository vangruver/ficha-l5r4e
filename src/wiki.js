// Aba "Wiki": enciclopédia por seção (Clãs Grandes, Clãs Menores, Famílias,
// Facções, Ordens Monásticas, Reinos Espirituais, Tradições Marciais,
// Artefatos, Criaturas, Locais, Ameaças, Estrangeiros), com lista de itens
// e link cruzado entre clãs/grupos relacionados.
//
// Duas formas de artigo:
// - "grupo" (clãs, facções, reinos, ordens, tradições marciais, ameaças,
//   estrangeiros): resumo/valores/aparência/papel/relações/ganchos.
// - "curta" (famílias, artefatos, criaturas, locais): entrada de catálogo,
//   um parágrafo — nome/contexto/resumo/destaque.
//
// Dados em data/lore/*.json, gerados por scripts/extract_lore*.py +
// scripts/build_lore.py — resumo original, nunca tradução do livro (ver
// schema.py).
import { porId } from "./database.js";

function esc(txt) {
  return (txt ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function $(id) { return document.getElementById(id); }

function slugify(txt) {
  return (txt ?? "")
    .toString()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const SECOES = [
  { id: "clas", titulo: "Clãs Grandes", chave: "lore", tipo: "grupo" },
  { id: "clasMenores", titulo: "Clãs Menores", chave: "clasMenores", tipo: "grupo" },
  { id: "familias", titulo: "Famílias", chave: "familias", tipo: "curta" },
  { id: "faccoes", titulo: "Facções", chave: "faccoes", tipo: "grupo" },
  { id: "ordensMonasticas", titulo: "Ordens Monásticas", chave: "ordensMonasticas", tipo: "grupo" },
  { id: "reinosEspirituais", titulo: "Reinos Espirituais", chave: "reinosEspirituais", tipo: "grupo" },
  { id: "tradicoesMarciais", titulo: "Tradições Marciais", chave: "tradicoesMarciais", tipo: "grupo" },
  { id: "artefatos", titulo: "Artefatos", chave: "artefatos", tipo: "curta" },
  { id: "criaturas", titulo: "Criaturas", chave: "criaturas", tipo: "curta" },
  { id: "locais", titulo: "Locais Notáveis", chave: "locais", tipo: "curta" },
  { id: "ameacas", titulo: "Ameaças Externas", chave: "ameacas", tipo: "grupo" },
  { id: "estrangeiros", titulo: "Estrangeiros", chave: "estrangeiros", tipo: "grupo" },
];

// Seções "grupo" valem como alvo de link cruzado (relações entre clãs,
// cla_pai de família apontando pro clã).
const SECOES_GRUPO = SECOES.filter((s) => s.tipo === "grupo");

function nomeItem(item, secao) {
  return secao.tipo === "grupo" ? item.cla : item.nome;
}

export function montarWiki(db) {
  const secoesComDados = SECOES.filter((s) => (db[s.chave] || []).length);

  if (!secoesComDados.length) {
    $("wiki-secoes").innerHTML = "";
    $("wiki-lista").innerHTML = "";
    $("wiki-artigo").innerHTML = `<p class="vazio">A wiki ainda não foi extraída dos livros (precisa de cota do Gemini — ver STATUS.md do projeto: <code>scripts/extract_lore*.py</code> + <code>scripts/build_lore.py</code>).</p>`;
    return;
  }

  let secaoAtual = secoesComDados[0];
  let itemAtualId = null;

  function listaDe(secao) {
    return db[secao.chave] || [];
  }

  // Pra link cruzado (relações entre clãs, cla_pai de família): procura um
  // id em qualquer seção "grupo" disponível (clã grande, clã menor, facção...).
  function localizarGrupo(id) {
    for (const secao of SECOES_GRUPO) {
      const item = porId(listaDe(secao), id);
      if (item) return { secao, item };
    }
    return null;
  }

  function irPara(secaoId, itemId) {
    const secao = secoesComDados.find((s) => s.id === secaoId);
    if (!secao) return;
    secaoAtual = secao;
    itemAtualId = itemId;
    montarSecoes();
    montarLista();
    montarArtigo();
  }

  function montarSecoes() {
    $("wiki-secoes").innerHTML = secoesComDados
      .map((s) => `<button class="aba${s.id === secaoAtual.id ? " on" : ""}" data-id="${esc(s.id)}">${esc(s.titulo)} <span class="tag">${listaDe(s).length}</span></button>`)
      .join("");
    $("wiki-secoes").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => irPara(btn.dataset.id, null));
    });
  }

  function montarLista() {
    const lista = listaDe(secaoAtual);
    if (!itemAtualId || !lista.some((i) => i.id === itemAtualId)) {
      itemAtualId = lista[0]?.id ?? null;
    }
    $("wiki-lista").innerHTML = lista
      .map((item) => `<button class="aba${item.id === itemAtualId ? " on" : ""}" data-id="${esc(item.id)}">${esc(nomeItem(item, secaoAtual))}</button>`)
      .join("");
    $("wiki-lista").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        itemAtualId = btn.dataset.id;
        montarLista();
        montarArtigo();
      });
    });
  }

  function artigoGrupo(c) {
    return `
      <article class="card wiki-card">
        <h2>${esc(c.cla)}</h2>
        <p class="wiki-subtitulo">${esc(secaoAtual.titulo)}</p>
        <p>${esc(c.resumo_pt)}</p>
        ${c.valores_pt ? `<h4>Valores</h4><p>${esc(c.valores_pt)}</p>` : ""}
        ${c.aparencia_pt ? `<h4>Aparência e cultura</h4><p>${esc(c.aparencia_pt)}</p>` : ""}
        ${c.papel_pt ? `<h4>Papel no Império</h4><p>${esc(c.papel_pt)}</p>` : ""}
        ${c.patrono_pt ? `<h4>Patrono</h4><p>${esc(c.patrono_pt)}</p>` : ""}
        ${c.relacoes?.length ? `
          <h4>Relações</h4>
          <ul class="wiki-relacoes">
            ${c.relacoes.map((r) => `<li><button class="link-clas" data-id="${esc(r.claId)}">${esc(r.cla)}</button> <span class="tag">${esc(r.tipo)}</span> — ${esc(r.descricao_pt)}</li>`).join("")}
          </ul>` : ""}
        ${c.ganchos_roleplay?.length ? `
          <h4>Ganchos de roleplay</h4>
          <ul>${c.ganchos_roleplay.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        <span class="fonte">${esc(c.source_book)}</span>
      </article>`;
  }

  function artigoCurta(item) {
    const contexto = item.cla_pai ?? item.contexto_pt;
    const destaque = item.especialidade_pt ?? item.destaque_pt;
    const contextoId = contexto ? slugify(contexto) : null;
    const temLinkContexto = contextoId && localizarGrupo(contextoId);
    return `
      <article class="card wiki-card">
        <h2>${esc(item.nome)}</h2>
        <p class="wiki-subtitulo">
          ${esc(secaoAtual.titulo)}
          ${item.categoria ? ` · <span class="tag">${esc(item.categoria)}</span>` : ""}
        </p>
        ${contexto ? `<p><strong>${temLinkContexto ? `<button class="link-clas" data-id="${esc(contextoId)}">${esc(contexto)}</button>` : esc(contexto)}</strong>${item.familia_principal ? ` — vassala de ${esc(item.familia_principal)}` : ""}</p>` : ""}
        <p>${esc(item.resumo_pt)}</p>
        ${destaque ? `<h4>Destaque</h4><p>${esc(destaque)}</p>` : ""}
        <span class="fonte">${esc(item.source_book)}</span>
      </article>`;
  }

  function montarArtigo() {
    const item = porId(listaDe(secaoAtual), itemAtualId);
    if (!item) {
      $("wiki-artigo").innerHTML = `<p class="vazio">Nada aqui ainda.</p>`;
      return;
    }
    $("wiki-artigo").innerHTML = secaoAtual.tipo === "grupo" ? artigoGrupo(item) : artigoCurta(item);
    $("wiki-artigo").querySelectorAll(".link-clas").forEach((btn) => {
      btn.addEventListener("click", () => {
        const achado = localizarGrupo(btn.dataset.id);
        if (!achado) return;
        irPara(achado.secao.id, achado.item.id);
      });
    });
  }

  montarSecoes();
  montarLista();
  montarArtigo();
}
