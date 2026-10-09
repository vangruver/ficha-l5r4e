// Aba "Compêndio": busca e filtro sobre os dados extraídos dos 8 livros
// (data/raw/*.json, ver scripts/merge.py).
import { filtrar, valoresUnicos } from "./database.js";

function esc(txt) {
  return (txt ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fonte(item) {
  const partes = [item.source_book, item.pagina ? `p.${item.pagina}` : null].filter(Boolean);
  return partes.length ? `<span class="fonte">${esc(partes.join(" — "))}</span>` : "";
}

const CATEGORIAS = {
  schools: {
    rotulo: "Escolas",
    filtroCampo: "cla",
    filtroRotulo: "Clã",
    render: (s) => `
      <article class="card">
        <h3>${esc(s.nome)}</h3>
        <p class="sub">${esc(s.cla)} · ${esc(s.familia)} · ${esc(s.tipo)}</p>
        <dl class="campos">
          <div><dt>Bônus inicial</dt><dd>${esc(s.trait_inicial_bonus)}</dd></div>
          <div><dt>Honra / Status iniciais</dt><dd>${esc(s.honra_inicial)} / ${esc(s.status_inicial)}</dd></div>
        </dl>
        <p class="lista"><b>Skills de escola:</b> ${esc((s.skills_de_escola || []).join(", "))}</p>
        <p class="lista"><b>Equipamento inicial:</b> ${esc((s.equipamento_inicial || []).join(", "))}</p>
        ${(s.tecnica_por_rank || []).map((t) => `
          <div class="tecnica"><b>Rank ${esc(t.rank)} — ${esc(t.nome)}</b><p>${esc(t.texto_pt)}</p></div>
        `).join("")}
        ${fonte(s)}
      </article>`,
  },
  kataKiho: {
    rotulo: "Kata / Kiho",
    filtroCampo: "tipo",
    filtroRotulo: "Tipo",
    render: (k) => `
      <article class="card">
        <h3>${esc(k.nome)} <span class="tag">${esc(k.tipo)}</span></h3>
        <p class="sub">${esc(k.anel_ou_trait)} · custo: ${esc(k.custo)}${k.pre_requisito ? ` · pré-requisito: ${esc(k.pre_requisito)}` : ""}</p>
        <p>${esc(k.texto_pt)}</p>
        ${fonte(k)}
      </article>`,
  },
  skills: {
    rotulo: "Skills",
    filtroCampo: "categoria",
    filtroRotulo: "Categoria",
    render: (s) => `
      <article class="card">
        <h3>${esc(s.nome)}</h3>
        <p class="sub">${esc(s.trait_associado)} · ${esc(s.categoria)}</p>
        ${s.emphases_possiveis?.length ? `<p class="lista"><b>Ênfases:</b> ${esc(s.emphases_possiveis.join(", "))}</p>` : ""}
        ${fonte(s)}
      </article>`,
  },
  spells: {
    rotulo: "Magias",
    filtroCampo: "anel",
    filtroRotulo: "Anel",
    render: (m) => `
      <article class="card">
        <h3>${esc(m.nome)} <span class="tag">Mastery ${esc(m.mastery_level)}</span></h3>
        <p class="sub">${esc(m.anel)} · área: ${esc(m.area)} · duração: ${esc(m.duracao)}</p>
        <p>${esc(m.texto_pt)}</p>
        ${fonte(m)}
      </article>`,
  },
  advantages: {
    rotulo: "Vantagens",
    render: (a) => `
      <article class="card">
        <h3>${esc(a.nome)} <span class="tag">${esc(a.custo_pontos)} pts</span></h3>
        <p>${esc(a.texto_pt)}</p>
        ${fonte(a)}
      </article>`,
  },
  disadvantages: {
    rotulo: "Desvantagens",
    render: (d) => `
      <article class="card">
        <h3>${esc(d.nome)} <span class="tag">+${esc(d.pontos_concedidos)} pts</span></h3>
        <p>${esc(d.texto_pt)}</p>
        ${fonte(d)}
      </article>`,
  },
  weapons: {
    rotulo: "Armas",
    render: (w) => `
      <article class="card">
        <h3>${esc(w.nome)}</h3>
        <p class="sub">dano: ${esc(w.dano)} · preço: ${esc(w.preco)} · raridade: ${esc(w.raridade)}</p>
        ${fonte(w)}
      </article>`,
  },
  armor: {
    rotulo: "Armaduras",
    render: (a) => `
      <article class="card">
        <h3>${esc(a.nome)}</h3>
        <p class="sub">NA: ${esc(a.bonus_tn)} · redução: ${esc(a.reducao_dano)} · preço: ${esc(a.preco)}</p>
        ${fonte(a)}
      </article>`,
  },
  gear: {
    rotulo: "Equipamento geral",
    render: (g) => `
      <article class="card">
        <h3>${esc(g.nome)}</h3>
        <p class="sub">preço: ${esc(g.preco)}</p>
        ${g.efeito_pt ? `<p>${esc(g.efeito_pt)}</p>` : ""}
        ${fonte(g)}
      </article>`,
  },
};

function $(id) { return document.getElementById(id); }

export function montarCompendio(db) {
  let categoriaAtual = "schools";

  function montarAbas() {
    const nav = $("abas");
    nav.innerHTML = Object.entries(CATEGORIAS)
      .map(([id, c]) => `<button class="aba${id === categoriaAtual ? " on" : ""}" data-id="${id}">${esc(c.rotulo)}</button>`)
      .join("");
    nav.querySelectorAll(".aba").forEach((btn) => {
      btn.addEventListener("click", () => {
        categoriaAtual = btn.dataset.id;
        nav.querySelectorAll(".aba").forEach((b) => b.classList.toggle("on", b === btn));
        montarFiltro();
        renderizar();
      });
    });
  }

  function montarFiltro() {
    const wrap = $("filtro-wrap");
    const config = CATEGORIAS[categoriaAtual];
    if (!config.filtroCampo) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    $("filtro-rotulo").textContent = config.filtroRotulo;
    const valores = valoresUnicos(db, categoriaAtual, config.filtroCampo);
    $("filtro-valor").innerHTML = `<option value="">Todos</option>` + valores.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
  }

  function renderizar() {
    const config = CATEGORIAS[categoriaAtual];
    const busca = $("busca").value;
    const filtroValor = config.filtroCampo ? $("filtro-valor").value : null;
    const filtros = filtroValor ? { [config.filtroCampo]: filtroValor } : {};
    const itens = filtrar(db, categoriaAtual, { busca, ...filtros });
    $("contagem").textContent = `${itens.length} ${itens.length === 1 ? "item" : "itens"}`;
    $("resultados").innerHTML = itens.map(config.render).join("") || `<p class="vazio">Nada encontrado.</p>`;
  }

  montarAbas();
  montarFiltro();
  renderizar();
  $("busca").addEventListener("input", renderizar);
  $("filtro-valor").addEventListener("change", renderizar);
}
