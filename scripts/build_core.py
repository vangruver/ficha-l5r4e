"""
Converte raw/core-tables.json (saído de extract_core_tables.py) nos arquivos
finais de data/core/ que a ficha usa pra calcular Níveis de Ferimento, Rank
de Discernimento e custo de evolução.

Não inventa número nenhum: só reformata o que o Gemini extraiu do PDF. Se
raw/core-tables.json não existir ainda, avisa e não faz nada (roda
extract_core_tables.py primeiro).

Uso:
    python build_core.py
"""
import json
import os

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "raw", "core-tables.json")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "core")


def salvar(nome: str, dados) -> None:
    caminho = os.path.join(OUT_DIR, f"{nome}.json")
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    print(f"{nome} -> {caminho}")


def main() -> None:
    if not os.path.exists(RAW_PATH):
        print(f"Falta {RAW_PATH} — roda extract_core_tables.py primeiro (precisa de cota do Gemini).")
        return

    with open(RAW_PATH, "r", encoding="utf-8") as f:
        dados = json.load(f)

    tabelas = dados.get("core_tables", {})

    if "niveis_ferimento" in tabelas:
        salvar("niveis-ferimento", tabelas["niveis_ferimento"])
    if "ranks_discernimento" in tabelas:
        salvar("ranks-discernimento", tabelas["ranks_discernimento"])
    if "custos_evolucao" in tabelas:
        salvar("custos-evolucao", tabelas["custos_evolucao"])

    formulas = {
        k: tabelas[k]
        for k in ("formula_iniciativa_pt", "formula_na_armadura_pt", "formula_discernimento_pt")
        if k in tabelas
    }
    if formulas:
        salvar("formulas", formulas)

    if "aneis_traits" in tabelas:
        # Só pra conferência manual contra data/core/aneis.json e traits.json
        # (escritos à mão a partir do que já sabíamos do sistema) — não
        # sobrescreve nada sozinho.
        salvar("aneis-traits-conferencia", tabelas["aneis_traits"])


if __name__ == "__main__":
    main()
