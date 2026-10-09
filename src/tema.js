// Troca entre os dois temas (Clean / Oriental). O valor inicial já foi
// aplicado por um script inline no <head> de index.html (pra não dar flash
// do tema errado) — aqui só ficam a troca e o rótulo do botão.
const CHAVE = "l5r4e.tema";

function temaAtual() {
  return document.documentElement.dataset.tema || "clean";
}

function rotuloDestino(tema) {
  return tema === "clean" ? "🌸 Oriental" : "🌙 Clean";
}

function aplicar(tema) {
  document.documentElement.dataset.tema = tema;
  try { localStorage.setItem(CHAVE, tema); } catch { /* navegação privada etc. */ }
  const btn = document.getElementById("btn-tema");
  if (btn) btn.textContent = rotuloDestino(tema);
}

export function iniciarTema() {
  aplicar(temaAtual());
  document.getElementById("btn-tema").addEventListener("click", () => {
    aplicar(temaAtual() === "clean" ? "oriental" : "clean");
  });
}
