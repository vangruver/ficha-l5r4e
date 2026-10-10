"""
Varre data/raw/*.json procurando itens com o mesmo nome aparecendo em mais
de um livro — pode ser reimpressão genuína (ex. uma skill básica repetida
em vários livros de referência) ou duplicata real que deveria ser 1 só.
Não altera nada, só relata.

Uso:
    python checar_duplicatas.py
"""
import glob
import json
import os
import re
import unicodedata
from collections import defaultdict

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")


def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    s = s.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", s.strip().lower())


def parecido(a, b):
    a, b = norm(a), norm(b)
    if not a or not b:
        return False
    menor, maior = (a, b) if len(a) <= len(b) else (b, a)
    return menor in maior or maior[: len(menor)] == menor


def main():
    for caminho in sorted(glob.glob(os.path.join(OUT_DIR, "*.json"))):
        cat = os.path.basename(caminho).replace(".json", "")
        with open(caminho, encoding="utf-8") as f:
            itens = json.load(f)
        por_nome = defaultdict(list)
        for item in itens:
            por_nome[norm(item.get("nome", ""))].append(item)
        dups = {k: v for k, v in por_nome.items() if len(v) > 1}
        if not dups:
            continue
        print(f"=== {cat}: {len(dups)} nome(s) repetido(s) entre livros ===")
        for _, grupo in dups.items():
            livros = [it["source_book"] for it in grupo]
            textos = [it.get("texto_pt") or it.get("efeito_pt") or "" for it in grupo]
            iguais = all(parecido(textos[0], t) for t in textos[1:]) if textos[0] else "?"
            print(f'  "{grupo[0]["nome"]}" -> {livros} | texto parecido: {iguais}')


if __name__ == "__main__":
    main()
