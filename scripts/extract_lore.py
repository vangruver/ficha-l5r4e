"""
Extrai a wiki de lore (clã -> resumo, valores, aparência, relações, ganchos
de roleplay) via Gemini File API, a partir de The Great Clans — o livro
dedicado a isso.

DIFERENTE de extract.py: aqui o prompt pede expressamente um RESUMO
ORIGINAL, escrito a partir dos fatos do livro, e NUNCA tradução ou cópia de
frase do texto da AEG. É a parte narrativa/autoral do livro, risco de
copyright bem maior que traduzir uma lista de vantagens — por isso o
cuidado extra no prompt (ver `montar_prompt_lore`).

Uso:
    python extract_lore.py

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
"""
import json
import os

from extract import extrair
from schema import LORE

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "pdfs", "great-clans.pdf")


def montar_prompt_lore(categoria: str, source_book: str, glossario: dict) -> str:
    return f"""Você está escrevendo uma wiki de FÃ sobre Legend of the Five Rings
4ª edição (AEG), a partir do PDF em inglês anexado ({source_book}).

IMPORTANTE — isso não é extração de regra mecânica, é conteúdo narrativo/autoral
da AEG. Por isso, para cada campo "*_pt" e "ganchos_roleplay":

- Escreva um RESUMO ORIGINAL, com suas próprias palavras, baseado nos FATOS que
  você leu no livro (quem é o clã, o que valoriza, como se parece, como se
  relaciona com os outros).
- NUNCA traduza ou copie frases do texto original — isso é prosa comercial da
  AEG, protegida por direito autoral. Resumir os FATOS com palavras novas é
  diferente de traduzir o texto; é isso que eu quero.
- Pode ser mais curto que o livro. Prefira curto e correto a longo e repetindo
  a estrutura de frase do original.

Termos fixos do sistema (nomes de clã, "Ronin" etc.) seguem este glossário,
sempre no valor "pt" (exceto quando `manter_original` for true, daí usa "en"):
{json.dumps(glossario, ensure_ascii=False, indent=2)}

Cubra todos os clãs que o livro descrever (grandes clãs, clãs menores
relevantes, Ronin/Irmandade de Shinsei se o livro tratar deles).

Responda só com o JSON no schema fornecido, categoria "{categoria}".
"""


if __name__ == "__main__":
    extrair(
        PDF_PATH,
        slug="lore",
        source_book="The Great Clans",
        categorias={"clas": LORE},
        montar_prompt_fn=montar_prompt_lore,
    )
