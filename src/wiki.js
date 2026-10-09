// Aba "Wiki": navegação por clã, estilo enciclopédia, com link entre
// clãs relacionados. Dados em data/lore/clas.json (gerado por
// scripts/extract_lore.py + scripts/build_lore.py — resumo original, não
// tradução do livro, ver schema.py LORE).
import { porId } from "./database.js";

function esc(txt) {
  return (txt ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function $(id) { return document.getElementById(id); }

export function montarWiki(db) {
  const lore = db.lore || [];

  if (!lore.length) {
    $("wiki-lista").innerHTML = "";
    $("wiki-artigo").innerHTML = `<p class="vazio">A wiki de clãs ainda não foi extraída dos livros (precisa de cota do Gemini — ver STATUS.md do projeto: <code>scripts/extract_lore.py</code> + <code>scripts/build_lore.py</code>).</p>`;
    return;
  }

  let claAtualId = lore[0].id;

  function montarLista() {
    $("wiki-lista").innerHTML = lore
      .map((c) => `<button class="aba${c.id === claAtualId ? " on" : ""}" data-id="${esc(c.id)}">${esc(c.cla)}</button>`)
      .join("");
    $("wiki-lista").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        claAtualId = btn.dataset.id;
        montarLista();
        montarArtigo();
      });
    });
  }

  function montarArtigo() {
    const c = porId(lore, claAtualId);
    if (!c) { $("wiki-artigo").innerHTML = `<p class="vazio">Clã não encontrado.</p>`; return; }
    $("wiki-artigo").innerHTML = `
      <article class="card wiki-card">
        <h2>${esc(c.cla)}</h2>
        <p>${esc(c.resumo_pt)}</p>
        <h4>Valores</h4>
        <p>${esc(c.valores_pt)}</p>
        <h4>Aparência e cultura</h4>
        <p>${esc(c.aparencia_pt)}</p>
        <h4>Papel no Império</h4>
        <p>${esc(c.papel_pt)}</p>
        ${c.relacoes?.length ? `
          <h4>Relações com outros clãs</h4>
          <ul class="wiki-relacoes">
            ${c.relacoes.map((r) => `<li><button class="link-clas" data-id="${esc(r.claId)}">${esc(r.cla)}</button> <span class="tag">${esc(r.tipo)}</span> — ${esc(r.descricao_pt)}</li>`).join("")}
          </ul>` : ""}
        ${c.ganchos_roleplay?.length ? `
          <h4>Ganchos de roleplay</h4>
          <ul>${c.ganchos_roleplay.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
        <span class="fonte">${esc(c.source_book)}</span>
      </article>`;
    $("wiki-artigo").querySelectorAll(".link-clas").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!porId(lore, btn.dataset.id)) return;
        claAtualId = btn.dataset.id;
        montarLista();
        montarArtigo();
      });
    });
  }

  montarLista();
  montarArtigo();
}
