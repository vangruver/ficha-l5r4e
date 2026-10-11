"""
Extrai o conteúdo narrativo só do Sword & Fan que não é clã/família:
ameaças externas ao Império (capítulo "Enemies") e nações/povos gaijin na
política rokugani (capítulo "Outsiders in Rokugani Politics").

Mesmo cuidado de copyright que extract_lore.py: RESUMO ORIGINAL, nunca
tradução ou cópia de frase do livro.

Uso:
    python extract_lore_sword_fan.py

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
"""
import json
import os

from extract import extrair
from schema import AMEACAS, ESTRANGEIROS

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "pdfs", "sword-and-fan.pdf")

CATEGORIAS = {"ameacas": AMEACAS, "estrangeiros": ESTRANGEIROS}

INSTRUCAO_POR_CATEGORIA = {
    "ameacas": (
        "Cubra os grupos/facções descritos no capítulo \"Enemies\" "
        "(ex. forças das Terras Sombrias organizadas, bandidos, piratas, "
        "cultos, o que o livro cobrir) — um item por grupo, não por "
        "criatura isolada."
    ),
    "estrangeiros": (
        "Cubra as nações/povos gaijin e sua relação com a política "
        "rokugani, do capítulo \"Outsiders in Rokugani Politics\"."
    ),
}


def montar_prompt_sword_fan(categoria: str, source_book: str, glossario: dict) -> str:
    return f"""Você está escrevendo uma wiki de FÃ sobre Legend of the Five Rings
4ª edição (AEG), a partir do PDF em inglês anexado ({source_book}).

IMPORTANTE — isso não é extração de regra mecânica, é conteúdo narrativo/autoral
da AEG. Por isso, para cada campo "*_pt" e "ganchos_roleplay":

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
    extrair(
        PDF_PATH,
        slug="lore-sword-fan",
        source_book="Sword and Fan",
        categorias=CATEGORIAS,
        montar_prompt_fn=montar_prompt_sword_fan,
    )
