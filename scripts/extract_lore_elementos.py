"""
Extrai a parte enciclopédica dos 5 livros elementais (Book of Air/Earth/
Fire/Water/Void) via Gemini File API: tradições marciais e dojos nomeados,
artefatos (nemuranai) notáveis, criaturas/seres sobrenaturais associados ao
elemento, e locais notáveis (cortes famosas + o grande local de aventura do
capítulo dedicado de cada livro).

Mesmo cuidado de copyright que extract_lore.py: RESUMO ORIGINAL, nunca
tradução ou cópia de frase do livro (ver `montar_prompt_elementos`).

Cada livro vira um slug próprio (raw/lore-air.json, raw/lore-earth.json...)
— resumível categoria a categoria, livro a livro, igual o resto do pipeline.

Uso:
    python extract_lore_elementos.py            # roda os 5 livros
    python extract_lore_elementos.py air earth   # só os livros pedidos

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
"""
import json
import os
import sys

from extract import extrair
from schema import CATEGORIAS_ELEMENTAIS

PDFS_DIR = os.path.join(os.path.dirname(__file__), "..", "pdfs")

LIVROS = {
    "air": ("book-of-air.pdf", "Book of Air"),
    "earth": ("book-of-earth.pdf", "Book of Earth"),
    "fire": ("book-of-fire.pdf", "Book of Fire"),
    "water": ("book-of-water.pdf", "Book of Water"),
    "void": ("book-of-void.pdf", "Book of Void"),
}

INSTRUCAO_POR_CATEGORIA = {
    "tradicoes_marciais": (
        "Cubra as artes marciais/estilos de combate nomeados no capítulo "
        "de Guerra do livro (ex. Iaijutsu, Kyujutsu, Yarijutsu, Kenjutsu, "
        "Kaze-do, Hitsu-do, Kukan-do, Sumai — o que for deste livro) e "
        "dojos/escolas de treino famosos mencionados (ex. Heart of the "
        "Katana, Green Blade Dojo), incluindo o grande dojo do capítulo "
        "dedicado do livro, se houver um (ex. The Hundred Stances Dojo). "
        "Pra cada um: história de origem, filosofia/estilo, e praticantes "
        "notáveis. IMPORTANTE: o campo de nome é da TRADIÇÃO/DOJO em si "
        "(ex. 'Heart of the Katana'), não do clã que a pratica — o livro "
        "quase sempre menciona os dois juntos, mas o clã associado vai no "
        "campo 'patrono_pt', nunca no nome do item."
    ),
    "artefatos": (
        "Cubra os nemuranai (itens mágicos despertos) notáveis listados "
        "na seção de nemuranai do capítulo 'O Mundo de X' deste livro. "
        "Resumo curto por item (2-3 frases) — o livro mesmo dedica só um "
        "parágrafo a cada um. Em 'contexto_pt' diga o tipo de item (arma, "
        "armadura, joia, etc.) e dono atual/família associada se houver; "
        "em 'destaque_pt' o que o item faz."
    ),
    "criaturas": (
        "Cubra as criaturas e seres sobrenaturais/de outros mundos "
        "associados ao elemento deste livro (fortunas, espíritos, raças "
        "lendárias, criaturas mundanas notáveis da seção 'Creatures and "
        "Otherworldly Beings'). Resumo curto por criatura (2-3 frases). "
        "Em 'contexto_pt' diga o tipo (fortuna, espírito, raça lendária, "
        "criatura mundana); em 'destaque_pt' o que a torna perigosa ou "
        "especial."
    ),
    "locais": (
        "Cubra as cortes/castelos notáveis descritos no capítulo de Paz "
        "do livro, MAIS o grande local de aventura do capítulo dedicado "
        "do livro (um castelo, floresta, ilha ou dojo — veja o "
        "sumário). Em 'contexto_pt' diga a região/clã associado; em "
        "'destaque_pt' por que esse local é notável ou interessante pra "
        "uma aventura."
    ),
}


def montar_prompt_elementos(categoria: str, source_book: str, glossario: dict) -> str:
    return f"""Você está escrevendo uma wiki de FÃ sobre Legend of the Five Rings
4ª edição (AEG), a partir do PDF em inglês anexado ({source_book}).

IMPORTANTE — isso não é extração de regra mecânica, é conteúdo narrativo/autoral
da AEG. Por isso, para cada campo "resumo_pt", "destaque_pt" e "contexto_pt":

- Escreva um RESUMO ORIGINAL, com suas próprias palavras, baseado nos FATOS que
  você leu no livro.
- NUNCA traduza ou copie frases do texto original — isso é prosa comercial da
  AEG, protegida por direito autoral. Resumir os FATOS com palavras novas é
  diferente de traduzir o texto; é isso que eu quero.
- Pode ser mais curto que o livro. Prefira curto e correto a longo.

Termos fixos do sistema seguem este glossário (en -> pt):
{json.dumps(glossario, ensure_ascii=False, indent=2)}

{INSTRUCAO_POR_CATEGORIA[categoria]}

Responda só com o JSON no schema fornecido, categoria "{categoria}".
"""


if __name__ == "__main__":
    pedidos = sys.argv[1:] or list(LIVROS.keys())
    for chave in pedidos:
        if chave not in LIVROS:
            print(f"Livro desconhecido: {chave} (opções: {', '.join(LIVROS)})")
            continue
        arquivo, nome_livro = LIVROS[chave]
        extrair(
            os.path.join(PDFS_DIR, arquivo),
            slug=f"lore-{chave}",
            source_book=nome_livro,
            categorias=CATEGORIAS_ELEMENTAIS,
            montar_prompt_fn=montar_prompt_elementos,
        )
