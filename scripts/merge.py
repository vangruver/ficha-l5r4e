"""
Junta os raw/<slug>.json (um por livro, gerados por extract.py) num compêndio
plano por categoria em data/raw/*.json — o "banco de dados" que a ficha
consulta (ver src/database.js). Cada item ganha um "id" estável
(nome + livro de origem, sem acento) pra poder ser referenciado de outros
lugares (ex. lista de técnicas de uma escola apontando pro kata/kiho certo).

Não chama o Gemini, não gasta cota — só reorganiza o que já foi extraído.
Roda de novo sempre que algum raw/<slug>.json mudar (ex. depois de terminar
o Sword and Fan).

Uso:
    python merge.py
"""
import json
import os
import re
import unicodedata

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "raw")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
GLOSSARIO_PATH = os.path.join(os.path.dirname(__file__), "..", "glossario.json")

# core-tables.json não é "opção de personagem" por livro, tem formato próprio
# e vai pra data/core (não pro compêndio) — ver scripts/build_core.py.
PULAR_ARQUIVOS = {"core-tables.json"}


def slugify(txt: str) -> str:
    txt = unicodedata.normalize("NFD", txt or "")
    txt = txt.encode("ascii", "ignore").decode("ascii")
    txt = re.sub(r"[^a-zA-Z0-9]+", "-", txt).strip("-").lower()
    return txt or "item"


def carregar_mapa_cla() -> dict[str, str]:
    """Os livros às vezes devolvem o clã em inglês, às vezes já traduzido
    (ex. 'Crab Clan' vs 'Clã da Caranguejo') — inconsistência da extração via
    Gemini, não dos dados do livro. Normaliza os dois pro valor canônico do
    glossário (pt, exceto quando `manter_original`)."""
    with open(GLOSSARIO_PATH, "r", encoding="utf-8") as f:
        glossario = json.load(f)
    mapa = {}
    for c in glossario.get("clas", []):
        canonico = c["en"] if c.get("manter_original") else c["pt"]
        mapa[slugify(c["en"])] = canonico
        mapa[slugify(c["pt"])] = canonico
    return mapa


def coletar(categoria_chave: str, subchave: str | None = None) -> list[dict]:
    """Lê todo raw/<slug>.json e junta os itens de uma categoria (e
    subchave, pra categorias que guardam mais de uma lista, como
    advantages_disadvantages ou equipment)."""
    itens = []
    for nome_arquivo in sorted(os.listdir(RAW_DIR)):
        if nome_arquivo in PULAR_ARQUIVOS or not nome_arquivo.endswith(".json"):
            continue
        with open(os.path.join(RAW_DIR, nome_arquivo), "r", encoding="utf-8") as f:
            livro = json.load(f)
        bloco = livro.get(categoria_chave)
        if not bloco:
            continue
        itens.extend(bloco.get(subchave or categoria_chave, []))
    return itens


def com_ids(itens: list[dict]) -> list[dict]:
    vistos: dict[str, int] = {}
    resultado = []
    for item in itens:
        base = slugify(item.get("nome", ""))
        livro = slugify(item.get("source_book", ""))
        id_base = f"{base}--{livro}" if livro else base
        n = vistos.get(id_base, 0)
        vistos[id_base] = n + 1
        id_ = id_base if n == 0 else f"{id_base}-{n + 1}"
        resultado.append({"id": id_, **item})
    return resultado


def salvar(nome: str, itens: list[dict]) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    caminho = os.path.join(OUT_DIR, f"{nome}.json")
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(itens, f, ensure_ascii=False, indent=2)
    print(f"{nome}: {len(itens)} itens -> {caminho}")


def normalizar_clas(itens: list[dict]) -> list[dict]:
    mapa = carregar_mapa_cla()
    for item in itens:
        cla = item.get("cla")
        if cla:
            item["cla"] = mapa.get(slugify(cla), cla)
    return itens


def main() -> None:
    salvar("schools", com_ids(normalizar_clas(coletar("schools"))))
    salvar("kata-kiho", com_ids(coletar("kata_kiho")))
    salvar("skills", com_ids(coletar("skills")))
    salvar("spells", com_ids(coletar("spells")))
    salvar("advantages", com_ids(coletar("advantages_disadvantages", "advantages")))
    salvar("disadvantages", com_ids(coletar("advantages_disadvantages", "disadvantages")))
    salvar("weapons", com_ids(coletar("equipment", "weapons")))
    salvar("armor", com_ids(coletar("equipment", "armor")))
    salvar("gear", com_ids(coletar("equipment", "gear")))


if __name__ == "__main__":
    main()
