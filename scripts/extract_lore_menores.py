"""
Extrai a wiki de lore que não está em The Great Clans: Clãs Menores,
famílias vassalas deles, Famílias Imperiais, Ronin e Irmandade de Shinsei,
Reinos Espirituais e as Ordens Monásticas principais — via Gemini File API,
a partir de Secrets of the Empire (capítulos "The Way of the Minor Clans",
"The Imperial Families", "The Way of the Ronin", "The Brotherhood of
Shinsei" e "The Spirit Realms").

Mesmo cuidado de copyright que extract_lore.py: RESUMO ORIGINAL, nunca
tradução ou cópia de frase (ver `montar_prompt_lore_menores`).

Uso:
    python extract_lore_menores.py

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
"""
import json
import os

from extract import extrair
from schema import (
    CLAS_MENORES,
    FACCOES,
    FAMILIAS_MENORES,
    FAMILIAS_IMPERIAIS,
    REINOS_ESPIRITUAIS,
    ORDENS_MONASTICAS,
)

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "pdfs", "secrets-of-the-empire.pdf")

CATEGORIAS = {
    "clas_menores": CLAS_MENORES,
    "familias_menores": FAMILIAS_MENORES,
    "familias_imperiais": FAMILIAS_IMPERIAIS,
    "faccoes": FACCOES,
    "reinos_espirituais": REINOS_ESPIRITUAIS,
    "ordens_monasticas": ORDENS_MONASTICAS,
}

INSTRUCAO_POR_CATEGORIA = {
    "clas_menores": (
        "Cubra os Clãs Menores do capítulo \"The Way of the Minor Clans\": "
        "Badger, Bat, Boar, Dragonfly, Hare, Monkey, Oriole, Ox, Sparrow e "
        "Tortoise. Pra cada um, baseie o resumo na história, terras, "
        "costumes e tradições descritas; preencha \"patrono_pt\" se o "
        "clã tiver um Clã Grande como patrono histórico."
    ),
    "familias_menores": (
        "Cubra as famílias vassalas listadas nas seções \"Vassal "
        "Families\"/\"Vassal Familes\" de cada Clã Menor nesse capítulo. "
        "Resumo curto por família (2-4 frases) — o livro mesmo dedica "
        "só um parágrafo a cada uma."
    ),
    "familias_imperiais": (
        "Cubra as Famílias Imperiais do capítulo \"The Imperial "
        "Families\": Hantei, Toturi, Iweko, Seppun, Otomo e Miya. Use "
        "\"cla_pai\" = \"Imperial\" pra todas (não são vassalas de clã "
        "nenhum)."
    ),
    "faccoes": (
        "Cubra Ronin (capítulo \"The Way of the Ronin\") e Irmandade de "
        "Shinsei (capítulo \"The Brotherhood of Shinsei\") como dois "
        "itens — um resumo geral de cada grupo, não precisa detalhar "
        "cada seita/ordem individual (isso vai na categoria "
        "'ordens_monasticas', separada)."
    ),
    "reinos_espirituais": (
        "Cubra os Reinos Espirituais do capítulo \"The Spirit Realms\": "
        "Chikushudo, Gaki-Do, Jigoku, Maigo no Musha, Meido, Sakkaku, "
        "Tengoku, Toshigoku, Yomi e Yume-Do. Em \"resumo_pt\" descreva a "
        "natureza do reino; em \"valores_pt\" quem o habita e como esses "
        "seres se comportam; em \"aparencia_pt\" como o reino se parece "
        "pra quem visita; em \"papel_pt\" como samurais/shugenja "
        "interagem ou tentam controlar esse reino na prática."
    ),
    "ordens_monasticas": (
        "Cubra as principais seitas/ordens da Irmandade de Shinsei "
        "descritas na seção \"The Major Brotherhood Orders\" do capítulo "
        "\"The Brotherhood of Shinsei\" (e as da seção \"The Lesser "
        "Brotherhood Orders\" se houver espaço) — uma entrada por ordem, "
        "focando no que a torna diferente das outras (filosofia, "
        "especialidade, e onde fica)."
    ),
}


def montar_prompt_lore_menores(categoria: str, source_book: str, glossario: dict) -> str:
    return f"""Você está escrevendo uma wiki de FÃ sobre Legend of the Five Rings
4ª edição (AEG), a partir do PDF em inglês anexado ({source_book}).

IMPORTANTE — isso não é extração de regra mecânica, é conteúdo narrativo/autoral
da AEG. Por isso, para cada campo "*_pt" e "ganchos_roleplay":

- Escreva um RESUMO ORIGINAL, com suas próprias palavras, baseado nos FATOS que
  você leu no livro (quem é o grupo, o que valoriza, como se parece, como se
  relaciona com os outros).
- NUNCA traduza ou copie frases do texto original — isso é prosa comercial da
  AEG, protegida por direito autoral. Resumir os FATOS com palavras novas é
  diferente de traduzir o texto; é isso que eu quero.
- Pode ser mais curto que o livro. Prefira curto e correto a longo e repetindo
  a estrutura de frase do original.

Termos fixos do sistema (nomes de clã, "Ronin" etc.) seguem este glossário,
sempre no valor "pt" (exceto quando `manter_original` for true, daí usa "en"):
{json.dumps(glossario, ensure_ascii=False, indent=2)}

{INSTRUCAO_POR_CATEGORIA[categoria]}

Responda só com o JSON no schema fornecido, categoria "{categoria}".
"""


if __name__ == "__main__":
    extrair(
        PDF_PATH,
        slug="lore-menores",
        source_book="Secrets of the Empire",
        categorias=CATEGORIAS,
        montar_prompt_fn=montar_prompt_lore_menores,
    )
