"""
Extrai as tabelas universais de regra do Core Rulebook via Gemini File API —
níveis de ferimento, ranks de Discernimento, custos de evolução, fórmulas de
iniciativa/NA/Discernimento. Diferente de extract.py: roda só contra o Core
(essas tabelas não existem nos outros livros) e usa seu próprio arquivo de
saída (raw/core-tables.json) pra não se misturar com raw/core.json.

Uso:
    python extract_core_tables.py

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
"""
import os

from extract import extrair
from schema import CORE_TABLES

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "pdfs", "core.pdf")

if __name__ == "__main__":
    extrair(
        PDF_PATH,
        slug="core-tables",
        source_book="Core Rulebook",
        categorias={"core_tables": CORE_TABLES},
    )
