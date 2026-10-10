"""
Converte raw/core-tables.json (saído de extract_core_tables.py) nos arquivos
finais de data/core/ que a ficha usa pra calcular Níveis de Ferimento,
Sabedoria (o termo oficial da ficha pra "Insight Rank" — conferido direto
contra a ficha de personagem oficial, Core pág. 391; não é "Discernimento",
que foi um termo que eu mesmo inventei por engano antes de ver a ficha
real) e custo de evolução.

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
        ranks_sabedoria = [
            {
                "rank": r["rank"],
                "sabedoria_minima": r.get("discernimento_minimo"),
                "sabedoria_maxima": r.get("discernimento_maximo"),
            }
            for r in tabelas["ranks_discernimento"]
        ]
        salvar("ranks-sabedoria", ranks_sabedoria)
    if "custos_evolucao" in tabelas:
        salvar("custos-evolucao", tabelas["custos_evolucao"])

    formulas = {}
    if "formula_iniciativa_pt" in tabelas:
        formulas["formula_iniciativa_pt"] = tabelas["formula_iniciativa_pt"]
    if "formula_na_armadura_pt" in tabelas:
        formulas["formula_na_armadura_pt"] = tabelas["formula_na_armadura_pt"]
    if "formula_discernimento_pt" in tabelas:
        formulas["formula_sabedoria_pt"] = tabelas["formula_discernimento_pt"]
    if formulas:
        salvar("formulas", formulas)

    if "aneis_traits" in tabelas:
        # Só pra conferência manual contra data/core/aneis.json e traits.json
        # (escritos à mão a partir do que já sabíamos do sistema) — não
        # sobrescreve nada sozinho.
        salvar("aneis-traits-conferencia", tabelas["aneis_traits"])


if __name__ == "__main__":
    main()
