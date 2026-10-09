# Ficha de Lenda dos Cinco Anéis (L5R) 4ª edição

Ficha de personagem de **Lenda dos Cinco Anéis / Legend of the Five Rings, 4ª edição** (AEG), com
compêndio pesquisável de escolas, kata/kiho, skills, magias, vantagens/desvantagens e equipamento, e
uma wiki navegável de clãs (lore, valores, relações entre clãs, ganchos de roleplay).
Roda 100% no navegador — publicável no GitHub Pages, sem back-end. Feita no mesmo esquema da
[ficha de D&D 5e](https://github.com/vangruver/dnd-sheet) e da
[ficha de Tormenta 20](https://github.com/vangruver/ficha-tormenta20), adaptada pras regras de L5R 4e.

## Aviso: projeto de fã, sem fins lucrativos

Esta ficha é um **projeto de fã, não-oficial e sem fins lucrativos**. Não tem anúncio, cobrança,
assinatura nem qualquer monetização — o código é aberto e ela roda de graça no navegador.

**Legend of the Five Rings**, Rokugan e todo o conteúdo dos livros (clãs, escolas, técnicas, magias,
vantagens, desvantagens, equipamento) pertencem à **Fantasy Flight Games / Alderac Entertainment
Group (AEG)** e aos autores do sistema. Este projeto **não é afiliado, endossado nem aprovado** por
eles.

Diferente da ficha de Tormenta 20 (que escreve resumos mecânicos originais em vez de copiar o texto
do livro), os dados aqui em `raw/` e `data/raw/` incluem **tradução do texto mecânico original dos
livros** (descrição de técnicas, magias, vantagens e desvantagens) — não só números e listas. Isso é
conteúdo derivado de obra comercial. A wiki de clãs (`data/lore/`) segue a abordagem da
ficha-tormenta20: é **resumo original**, escrito a partir dos fatos do livro, nunca tradução do texto
da AEG — ver `scripts/extract_lore.py`. Se você tem direito sobre esse conteúdo e quer que ele saia
daqui, abra uma Issue explicando o pedido.

**Se você joga L5R, compre os livros.** A ficha não substitui nenhum deles; ela só organiza o
personagem de quem já joga.

## O que ela faz

- **Ficha de personagem**: identidade (clã, família, escola), os 5 Anéis e 8 Traits (os 4 anéis
  elementais são calculados automaticamente como o menor dos 2 Traits dele — Vazio é um valor
  próprio), Skills, Técnicas de escola (lista automática até o Rank de Escola escolhido),
  Vantagens/Desvantagens com saldo de pontos, Honra/Glória/Status/Infâmia, Pontos de Vazio,
  Equipamento (com sugestão da escola) e Dinheiro (koku/bu/zeni).
- **Automação na escolha de escola**: selecionar uma escola pela primeira vez aplica sozinho o bônus
  de Trait inicial, Honra/Status iniciais e as Skills de escola. Trocar de escola depois **não**
  desfaz isso automaticamente — é uma decisão consciente do projeto, pra não arriscar duplicar ou
  perder bônus silenciosamente.
- **Compêndio pesquisável**: escolas, kata/kiho, skills, magias, vantagens, desvantagens, armas,
  armaduras e equipamento geral — busca por texto e filtro por campo (clã, anel, tipo...), cada item
  com o livro e a página de origem.
- **Múltiplos personagens salvos** no navegador (localStorage) — trocar, criar, excluir.
- **Wiki de clãs**: resumo, valores, aparência, papel no Império e relações com outros clãs
  (clicáveis — clicar num clã relacionado pula pra página dele), mais ganchos de roleplay.

## O que ainda falta (ver `STATUS.md`)

- **Insight Rank, penalidade de Nível de Ferimento, NA e Iniciativa calculados**: dependem de tabelas
  universais do Core Rulebook (não são "opção de personagem", são as tabelas numéricas do sistema)
  que ainda não foram extraídas — ver `scripts/extract_core_tables.py`.
  Hoje o Rank de Escola é digitado manualmente e o dano é só acumulado, sem penalidade automática.
- **Magias conhecidas/preparadas** (Shugenja): o campo já existe no personagem, a interface ainda não.
- **Dados da wiki de clãs**: o pipeline (`scripts/extract_lore.py`/`build_lore.py`) e a aba já
  existem; falta rodar a extração de verdade (precisa de cota do Gemini).

## Fonte dos dados

Os 8 livros-fonte (Core Rulebook, Book of Air/Earth/Fire/Water/Void, Sword and Fan, The Great Clans)
foram extraídos via **Gemini File API**: o PDF de cada livro é enviado pro Gemini, que devolve os
dados estruturados por categoria (`scripts/schema.py`), com o número de página de cada item. Os PDFs
em si **não** estão neste repositório (ver `.gitignore` — alguns vieram de fontes piratas e nunca
seriam publicados). O pipeline completo (extração, retomada incremental, junção dos livros num
compêndio único) está documentado em `STATUS.md`.

## Rodar localmente

Sem build nem dependência — é só servir os arquivos estáticos:

```
python -m http.server 8000
```

E abrir `http://localhost:8000`.
