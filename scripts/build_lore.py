"""
Converte os raw/lore*.json (saídos de extract_lore.py, extract_lore_menores.py,
extract_lore_elementos.py e extract_lore_sword_fan.py) em data/lore/*.json —
os arquivos que a aba "Wiki" da ficha lê. Não gasta cota, só reformata e
normaliza nomes de clã (mesmo glossário usado em merge.py).

Roda de novo sempre que algum raw/lore*.json mudar. Seguro rodar mesmo com
extrações ainda faltando — cada arquivo de saída é gerado só se a fonte
existir, e avisa (sem travar o pipeline) qual falta.

Uso:
    python build_lore.py
"""
import json
import os

from merge import carregar_mapa_cla, slugify

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "raw")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "lore")

MAPA_CLA = carregar_mapa_cla()


def ler_raw(slug: str) -> dict:
    caminho = os.path.join(RAW_DIR, f"{slug}.json")
    if not os.path.exists(caminho):
        return {}
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


def extrair_categoria(dados: dict, categoria: str) -> list[dict]:
    """Os raw/lore*.json guardam cada categoria como {categoria: {categoria:
    [...]}} (schema do Gemini reaproveitado por cima da chave de resumo em
    extract.py) — essa função já desembrulha isso."""
    bloco = dados.get(categoria)
    if not bloco:
        return []
    return bloco.get(categoria, [])


def cla_canonico(nome: str | None) -> str | None:
    if not nome:
        return nome
    return MAPA_CLA.get(slugify(nome), nome)


def normalizar_grupo(item: dict) -> dict:
    """Pra itens shape 'grupo' (clas, clas_menores, faccoes, reinos
    espirituais, ordens monásticas, tradições marciais, ameaças,
    estrangeiros): normaliza o nome do grupo e das relações, gera id."""
    item["cla"] = cla_canonico(item.get("cla"))
    item["id"] = slugify(item["cla"] or "")
    for rel in item.get("relacoes", []) or []:
        rel["cla"] = cla_canonico(rel.get("cla"))
        rel["claId"] = slugify(rel["cla"] or "")
    return item


def com_ids_curta(itens: list[dict]) -> list[dict]:
    """Pra itens shape 'entidade curta' (familias, artefatos, criaturas,
    locais): id = nome + livro de origem, igual ao merge.com_ids."""
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
    if itens:
        print(f"lore/{nome}: {len(itens)} itens -> {caminho}")
    else:
        print(f"lore/{nome}: nada extraído ainda (fonte não existe ou categoria vazia)")


def main() -> None:
    lore_grandes = ler_raw("lore")
    lore_menores = ler_raw("lore-menores")
    lore_sword_fan = ler_raw("lore-sword-fan")
    livros_elementais = {
        chave: ler_raw(f"lore-{chave}")
        for chave in ("air", "earth", "fire", "water", "void")
    }

    # --- grupos (shape "clã") ---------------------------------------------
    salvar("clas", [normalizar_grupo(i) for i in extrair_categoria(lore_grandes, "clas")])
    salvar("clas-menores", [normalizar_grupo(i) for i in extrair_categoria(lore_menores, "clas_menores")])
    salvar("faccoes", [normalizar_grupo(i) for i in extrair_categoria(lore_menores, "faccoes")])
    salvar("ordens-monasticas", [normalizar_grupo(i) for i in extrair_categoria(lore_menores, "ordens_monasticas")])
    salvar("reinos-espirituais", [normalizar_grupo(i) for i in extrair_categoria(lore_menores, "reinos_espirituais")])
    salvar("ameacas", [normalizar_grupo(i) for i in extrair_categoria(lore_sword_fan, "ameacas")])
    salvar("estrangeiros", [normalizar_grupo(i) for i in extrair_categoria(lore_sword_fan, "estrangeiros")])

    # Campo vem como "nome_tradicao" (ver schema.py TRADICOES_MARCIAIS —
    # usar "cla" direto confundia o modelo, que preenchia o clã associado à
    # tradição em vez do nome da tradição). Remapeia pra "cla" aqui, assim
    # normalizar_grupo() e o resto do pipeline (wiki.js) nem precisam saber.
    tradicoes = []
    for dados in livros_elementais.values():
        for item in extrair_categoria(dados, "tradicoes_marciais"):
            item["cla"] = item.pop("nome_tradicao", None)
            tradicoes.append(item)
    salvar("tradicoes-marciais", [normalizar_grupo(i) for i in tradicoes])

    # --- famílias (shape "entidade curta", categoria extra pra filtrar) ----
    familias = []
    for item in extrair_categoria(lore_grandes, "familias"):
        item["categoria"] = "Clã Grande"
        item["cla_pai"] = cla_canonico(item.get("cla_pai"))
        familias.append(item)
    for item in extrair_categoria(lore_menores, "familias_menores"):
        item["categoria"] = "Clã Menor"
        item["cla_pai"] = cla_canonico(item.get("cla_pai"))
        familias.append(item)
    for item in extrair_categoria(lore_menores, "familias_imperiais"):
        item["categoria"] = "Família Imperial"
        familias.append(item)
    salvar("familias", com_ids_curta(familias))

    # --- catálogos "entidade curta" dos 5 livros elementais ----------------
    for categoria_saida, categoria_raw in (("artefatos", "artefatos"), ("criaturas", "criaturas"), ("locais", "locais")):
        itens = []
        for dados in livros_elementais.values():
            itens.extend(extrair_categoria(dados, categoria_raw))
        salvar(categoria_saida, com_ids_curta(itens))


if __name__ == "__main__":
    main()
