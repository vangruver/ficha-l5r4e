"""
Converte raw/lore.json (saído de extract_lore.py) em data/lore/clas.json —
a wiki de clãs que a aba "Wiki" da ficha lê. Não gasta cota, só reformata
e normaliza o nome do clã (mesmo glossário usado em merge.py).

Se raw/lore.json não existir ainda, avisa e não faz nada (roda
extract_lore.py primeiro — precisa de cota do Gemini).

Uso:
    python build_lore.py
"""
import json
import os

from merge import carregar_mapa_cla, slugify

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "raw", "lore.json")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "lore", "clas.json")


def main() -> None:
    if not os.path.exists(RAW_PATH):
        print(f"Falta {RAW_PATH} — roda extract_lore.py primeiro (precisa de cota do Gemini).")
        return

    with open(RAW_PATH, "r", encoding="utf-8") as f:
        dados = json.load(f)

    clas = dados.get("clas", {}).get("clas", [])
    mapa_cla = carregar_mapa_cla()

    resultado = []
    for item in clas:
        nome_canonico = mapa_cla.get(slugify(item.get("cla", "")), item.get("cla"))
        item["cla"] = nome_canonico
        item["id"] = slugify(nome_canonico)
        for rel in item.get("relacoes", []):
            rel["cla"] = mapa_cla.get(slugify(rel.get("cla", "")), rel.get("cla"))
            rel["claId"] = slugify(rel["cla"])
        resultado.append(item)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    print(f"lore: {len(resultado)} clãs -> {OUT_PATH}")


if __name__ == "__main__":
    main()
