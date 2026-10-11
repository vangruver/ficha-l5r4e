"""
Extrai dados estruturados de um livro de L5R 4e via Gemini File API.

Uso:
    python extract.py "../pdfs/book-of-air.pdf" air "Book of Air"

Gera um arquivo em ../raw/<slug>.json com uma chave por categoria
(schools, kata_kiho, skills, spells, advantages_disadvantages, equipment).
Categoria vazia nesse livro = lista vazia, não é erro.

Requer:
    pip install google-genai
    GEMINI_API_KEY no ambiente
    GEMINI_API_KEY_2 opcional — chave de uma 2ª conta Google. Quando a 1ª
    bate a cota do dia, troca pra essa sozinho (reenvia o PDF, já que o
    arquivo subido fica preso à conta que o enviou) em vez de desistir.
"""
import json
import os
import sys
import time

from google import genai
from google.genai import types
from google.genai import errors

from schema import CATEGORIAS

GLOSSARIO_PATH = os.path.join(os.path.dirname(__file__), "..", "glossario.json")
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "raw")

MODEL = os.environ.get("GEMINI_API_MODEL", "gemini-3.8-flash")


def carregar_glossario() -> dict:
    with open(GLOSSARIO_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def obter_chaves() -> list[str]:
    chaves = [os.environ["GEMINI_API_KEY"]]
    extra = os.environ.get("GEMINI_API_KEY_2")
    if extra:
        chaves.append(extra)
    return chaves


def subir_arquivo(client, pdf_path: str):
    arquivo = client.files.upload(file=pdf_path)
    while arquivo.state.name == "PROCESSING":
        time.sleep(3)
        arquivo = client.files.get(name=arquivo.name)
    if arquivo.state.name != "ACTIVE":
        raise RuntimeError(f"Upload falhou: {arquivo.state.name}")
    return arquivo


def montar_prompt(categoria: str, source_book: str, glossario: dict) -> str:
    return f"""Você está extraindo dados de regras de Legend of the Five Rings
4ª edição (AEG), a partir do PDF em inglês anexado.

Livro de origem (preencha "source_book" com exatamente este valor): {source_book}

Extraia APENAS a categoria "{categoria}". Se o livro não tiver conteúdo
dessa categoria, devolva listas vazias — não invente nada.

Regras de tradução:
- Traduza o TEXTO MECÂNICO (campos *_pt) para português do Brasil.
- NÃO traduza nomes próprios: nomes de escola, clã, família, kata/kiho,
  personagem, termo em romaji. Mantenha como está no original.
- Em listas de skill (ex. skills_de_escola, emphases_possiveis): todo item
  fica em inglês, igual aparece no livro, incluindo placeholders genéricos
  como "Any Skill" ou "Any non-Bugei Skill" — não traduza nenhum item dessas
  listas, nem parcialmente.
- Termos fixos do sistema seguem este glossário (en -> pt):
{json.dumps(glossario, ensure_ascii=False, indent=2)}
- Preencha "pagina" com o número de página do PDF onde a informação está,
  quando conseguir identificar.

Responda só com o JSON no schema fornecido.
"""


def extrair(pdf_path: str, slug: str, source_book: str | None = None, categorias: dict | None = None, montar_prompt_fn=None):
    categorias = categorias if categorias is not None else CATEGORIAS
    montar_prompt_fn = montar_prompt_fn or montar_prompt
    source_book = source_book or os.path.basename(pdf_path)
    glossario = carregar_glossario()

    os.makedirs(RAW_DIR, exist_ok=True)
    out_path = os.path.join(RAW_DIR, f"{slug}.json")

    resultado = {}
    if os.path.exists(out_path):
        with open(out_path, "r", encoding="utf-8") as f:
            resultado = json.load(f)

    pendentes = [c for c in categorias if c not in resultado]
    if not pendentes:
        print(f"{slug}: já tem todas as categorias, nada a fazer.")
        return

    chaves = obter_chaves()
    indice_chave = 0
    client = genai.Client(api_key=chaves[indice_chave])

    print(f"Subindo {pdf_path} pro Gemini (conta {indice_chave + 1}/{len(chaves)})...")
    arquivo = subir_arquivo(client, pdf_path)

    for categoria in pendentes:
        response_schema = categorias[categoria]
        print(f"  extraindo categoria: {categoria}")
        prompt = montar_prompt_fn(categoria, source_book, glossario)

        for tentativa in range(1, 6):
            try:
                resp = client.models.generate_content(
                    model=MODEL,
                    contents=[arquivo, prompt],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=response_schema,
                    ),
                )
                resultado[categoria] = json.loads(resp.text)
                break
            except errors.ServerError as e:
                espera = 15 * tentativa
                print(f"    servidor sobrecarregado (tentativa {tentativa}/5), esperando {espera}s... ({e})")
                time.sleep(espera)
            except errors.ClientError as e:
                if "RESOURCE_EXHAUSTED" in str(e):
                    if indice_chave + 1 < len(chaves):
                        indice_chave += 1
                        print(f"    cota esgotada na conta {indice_chave}/{len(chaves)}, trocando pra conta {indice_chave + 1}/{len(chaves)}...")
                        client = genai.Client(api_key=chaves[indice_chave])
                        arquivo = subir_arquivo(client, pdf_path)
                        continue
                    print(f"    cota do dia esgotada em todas as contas, salvando progresso parcial em {out_path}")
                    with open(out_path, "w", encoding="utf-8") as f:
                        json.dump(resultado, f, ensure_ascii=False, indent=2)
                    raise
                raise
        else:
            raise RuntimeError(f"Categoria '{categoria}' falhou após 5 tentativas")

        # salva depois de cada categoria, não só no final
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(f"OK -> {out_path}")
    client.files.delete(name=arquivo.name)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python extract.py <caminho_pdf> <slug> [nome_do_livro]")
        sys.exit(1)
    pdf_path = sys.argv[1]
    slug = sys.argv[2]
    source_book = sys.argv[3] if len(sys.argv) > 3 else None
    extrair(pdf_path, slug, source_book)
