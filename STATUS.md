# Status — ficha-l5r4e

Ficha modular de L5R 4ª edição (AEG), nos moldes do dnd-sheet/ficha-tormenta20.

**9 livros extraídos (10/out/2026)** — os 8 originais + **Secrets of the Empire**, adicionado pelo
Carlos depois (PDF grande, 70MB, ele baixou manualmente do Drive pra `pdfs/` porque não dá pra puxar
arquivo desse tamanho via Drive MCP sem estourar contexto). Extraiu de uma vez só, sem bater cota —
as tabelas universais do Core e a wiki de 9 clãs continuam completas de antes. **Ficha redesenhada em
09/out pra bater com os campos da ficha oficial** (ver seção "Redesenho contra a ficha oficial"
abaixo). Fase atual: ligar os cálculos automáticos (Sabedoria, NA, Iniciativa, penalidade de
ferimento) em cima dos dados que já existem (ver "O que falta pra ficha em si", perto do fim deste
arquivo).

**Publicado no GitHub em 09/out/2026:** repo público [vangruver/ficha-l5r4e](https://github.com/vangruver/ficha-l5r4e),
GitHub Pages ativado em <https://vangruver.github.io/ficha-l5r4e/> (mesmo esquema do dnd-sheet).
`pdfs/` (dois arquivos vieram de fonte pirata) fica de fora via `.gitignore` — nunca sobe. `raw/` e
`data/raw/` (texto traduzido dos livros) subiram junto a pedido do Carlos, ciente do risco de
copyright (ver README.md da ficha). Pra atualizar o repo depois de rodar os scripts de novo: `git add -A && git commit -m "..." && git push`.

## Tema Oriental (09/out)

Segundo tema, além do escuro ("Clean") que já existia — pergaminho + marca d'água de cerejeira
(`assets/sakura.svg`), tipografia Shippori Mincho, paleta vermelho-selo/creme. Troca no botão do
cabeçalho (`src/tema.js`), salvo em `localStorage` (`l5r4e.tema`), aplicado por um script inline no
`<head>` antes do CSS pintar (sem flash do tema errado). Como todo `style.css` já lia variáveis CSS
(`--bg`, `--surface`, `--accent`...), só precisou de um bloco `:root[data-tema="oriental"]`
sobrescrevendo essas variáveis — não mudou nada no resto do CSS. A marca d'água só aparece acima de
720px de largura (desktop) — no celular fica só a paleta, sem a ilustração, por pedido do Carlos.

Testado com **Chrome headless local** (`chrome.exe --headless=new --screenshot=...`), já que a
extensão do navegador não conectou nesta sessão: tema Clean sem regressão, tema Oriental ok no
desktop e no celular — prints enviados ao Carlos direto no chat.

**Gap encontrado, não é do tema (pré-existente):** em telas bem estreitas (~390px), a barra do
personagem (`.barra-personagem`, select + 2 botões) e algumas linhas de texto longas estouram a
largura da tela (overflow horizontal) — não tem breakpoint pra isso ainda. Não mexi, só registrando;
avisar o Carlos se for mexer na responsividade mobile depois.

## 2ª conta Gemini (09/out) — dobra a cota diária

Carlos tem uma 2ª conta Google (com Google AI Pro assinado) e perguntou se isso aumenta a cota. Não
necessariamente — cota da API (free tier) e assinatura do app Gemini/Google AI Pro são produtos
diferentes; o que aumenta cota de verdade é faturamento ativado no projeto (Carlos decidiu não
ativar, ver "Bloqueio atual" acima). O que FUNCIONA com certeza: **cada conta Google tem sua própria
cota gratuita de 20/dia**, independente — por isso uma 2ª conta = +20/dia.

`scripts/extract.py` agora suporta uma 2ª chave: `GEMINI_API_KEY_2` opcional no ambiente. Quando a
1ª bate RESOURCE_EXHAUSTED, troca pra ela sozinho (reenvia o PDF — o File API prende o arquivo à
conta que subiu) e continua a extração, sem precisar trocar nada na mão. `GEMINI_API_KEY_2` **já
está configurada** como variável de usuário no PC do Carlos (`setx`, 09/out) — chave de uma conta
"carlos" separada, projeto `501724362430`. Formato novo de chave da Google, por sinal: começa com
`AQ.` em vez do `AIzaSy...` que eu esperava — AI Studio deve ter mudado o formato depois do meu
corte de conhecimento.

**Resultado:** funcionou perfeitamente — `sword-and-fan` esgotou a conta 1 bem no meio (na categoria
`skills`), trocou pra conta 2 sozinho e terminou as 4 categorias que faltavam; `extract_core_tables.py`
e `extract_lore.py` também rodaram sem problema. **Extração 100% completa em 09/out/2026, no mesmo dia,
sem esperar reset nenhum.**

## Escopo (9 livros)

Core + Book of Air/Earth/Fire/Water/Void + Sword and Fan + The Great Clans + Secrets of the Empire
(os 2 últimos adicionados depois do escopo original, a pedido do Carlos).

PDFs em `pdfs/`, vieram do Drive do Carlos (pasta "Lenda dos 5 aneis"). Secrets of the Empire é
grande (70MB) — não deu pra baixar via Drive MCP (base64 estouraria o contexto), o Carlos baixou
manual e colocou em `pdfs/secrets-of-the-empire.pdf`.

## Pipeline

- `glossario.json` — termos fixos EN→PT (anéis, traits, clãs, termos de sistema); nomes próprios de escola/kata/kiho ficam em inglês/romaji.
- `scripts/schema.py` — schema de extração por categoria: schools, kata_kiho, skills, spells, advantages_disadvantages, equipment.
- `scripts/extract.py` — sobe o PDF pro Gemini File API, extrai categoria por categoria, salva em `raw/<slug>.json` com `source_book`+`pagina` por item. **Salva incremental** (categoria por categoria) e **retoma** sozinho — se rodar de novo num livro que já tem progresso parcial, só busca o que falta.
- `scripts/run_all.ps1` — roda `extract.py` nos livros que faltam, em sequência.

## Status dos livros — todos ✅ (09/out/2026)

Book of Air, Core Rulebook, Book of Water, Book of Fire, Book of Earth, Book of Void, The Great
Clans, Sword and Fan — os 8, completos. `extract_core_tables.py` (tabelas universais) e
`extract_lore.py` (wiki de 9 clãs) também já rodaram. Free tier do Gemini (20 requests/dia por
conta) não foi mais um bloqueio depois da 2ª conta configurada (ver seção acima) — sobrou cota
tranquilamente pros 7 requests que faltavam.

Se precisar reprocessar algo no futuro (livro novo, categoria nova): `scripts/run_all.ps1` continua
retomando sozinho (só busca o que falta em cada `raw/<slug>.json`); `extract_core_tables.py` e
`extract_lore.py` têm o mesmo comportamento incremental. Depois de qualquer extração nova, rodar
`scripts/merge.py` (recompila `data/raw/*.json`) e `scripts/build_core.py`/`build_lore.py` se for o
caso, e então `git add -A && git commit -m "..." && git push`.

## Conferência dos dados extraídos (09/out)

- **`data/core/aneis-traits-conferencia.json`**: o mapeamento Anel↔Trait extraído do Core bateu
  **exatamente** com o que eu já tinha escrito à mão em `data/core/aneis.json`/`traits.json`
  (Terra: Stamina/Willpower, Ar: Reflexes/Awareness, Água: Strength/Perception, Fogo:
  Agility/Intelligence, Vazio: nenhum). Confirmado, não precisa mudar nada.
- **`data/core/formulas.json`**: **ATUALIZAÇÃO — ver "Redesenho contra a ficha oficial" abaixo.** A
  extração original do Gemini já estava certa ("Reflexos + Sabedoria"); eu que "corrigi" errado pra
  "Rank de Discernimento" sem checar, achando que era um erro do modelo. Revertido depois de abrir a
  ficha oficial de verdade — "Sabedoria" é o termo correto, não "Discernimento".
- **`data/core/ranks-sabedoria.json`** (renomeado de `ranks-discernimento.json`) **só vai até o
  Rank 8** (0–324 pontos de Sabedoria) — o livro pode ter ranks mais altos que a extração não pegou
  (não confirmei se é porque a tabela do Core realmente para aí, ou se o Gemini só não listou o
  resto). Não travar a ficha num personagem de Rank 9+ sem checar isso contra o PDF antes.
- **`data/lore/clas.json`**: 9 clãs (os 7 grandes + Mantis + Aranha), resumos originais, boa
  qualidade. Uma relação da Aranha aponta pro clã genérico `"All Clans"` (não é um clã de verdade) —
  o link da wiki pra essa relação especificamente fica sem ação ao clicar (`wiki.js` já trata isso
  sem quebrar, só não navega pra lugar nenhum), resto das relações normais funciona.

## Notas sobre modelo

- `gemini-2.0-flash` e `gemini-2.5-flash`/`gemini-2.5-pro` → desativados pela Google pra contas novas (404).
- `gemini-3.8-flash` (sugerido pela própria API como substituto) → sobrecarregado, 503 constante.
- `gemini-3.5-flash` → o que funcionou, é o que tá configurado no script via `$env:GEMINI_API_MODEL`.

## Estrutura construída em 09/out (enquanto a cota não voltava)

Baseada no mesmo esquema do [dnd-sheet](https://github.com/vangruver/dnd-sheet) e do
[ficha-tormenta20](https://github.com/vangruver/ficha-tormenta20) (`data/core` escrito à mão +
`data/raw` gerado por script + `src/database.js` que carrega e filtra):

- **`scripts/merge.py`** — junta todo `raw/<slug>.json` (um por livro) num compêndio plano por
  categoria em `data/raw/*.json`, com um `id` estável por item (nome + livro de origem). Não chama
  o Gemini, não gasta cota — roda a qualquer momento que `raw/` mudar. **Compêndio final dos 9
  livros (10/out): 30 schools, 75 kata/kiho, 42 skills, 92 spells, 44 advantages, 15 disadvantages,
  18 weapons, 11 armor, 12 gear — 339 itens.** (Secrets of the Empire contribuiu principalmente
  escolas e vantagens — coerente com ser um livro de corte/política imperial.)
- **`data/core/aneis.json` e `data/core/traits.json`** — os 5 Anéis e os 8 Traits com o mapeamento
  Anel→Trait (Terra: Vigor/Vontade, Ar: Reflexos/Prontidão, Água: Força/Percepção, Fogo:
  Agilidade/Intelecto, Vazio: nenhum) — escrito à mão, é regra básica estável do sistema desde
  sempre. **Conferido contra a extração real do Core em 09/out** (ver "Conferência dos dados
  extraídos" acima) — bateu certo, sem mudança.
- **Bug de dados corrigido no merge:** o campo `cla` das escolas saía ora em inglês ("Crab Clan"),
  ora em português ("Clã da Caranguejo"), dependendo do livro que extraiu (inconsistência da
  tradução via Gemini, não dos dados em si). `scripts/merge.py` agora normaliza os dois pro valor
  canônico do `glossario.json` (`carregar_mapa_cla()` + `normalizar_clas()`), antes de gerar os ids.
  Sem essa correção, filtrar escolas por clã no compêndio/ficha ficava quebrado pra metade dos livros.
- **`index.html` + `assets/style.css` + `src/compendio.js`** — aba **Compêndio**: busca por categoria
  (Escolas, Kata/Kiho, Skills, Magias, Vantagens, Desvantagens, Armas, Armaduras, Equipamento geral),
  busca por texto, filtro por campo (clã nas escolas, anel nas magias, etc.), cada card mostrando
  livro+página de origem.
- **`src/storage.js`** — personagens salvos no navegador (localStorage, múltiplos personagens,
  trocar/criar/excluir), mesmo esquema do dnd-sheet/ficha-tormenta20.
- **`src/rules.js`** — regras derivadas estáveis e bem conhecidas do sistema (não dependem do
  `core_tables` pendente): Anel elemental = menor dos 2 Traits dele; saldo de pontos
  Vantagens/Desvantagens; técnicas de escola já conhecidas até o rank atual.
- **`src/app.js`** — aba **Ficha**: identidade (nome/clã/família/escola — escolher escola a 1ª vez
  aplica sozinho bônus de trait +1, honra/status inicial e skills de escola; trocar depois NÃO desfaz,
  é decisão consciente pra não arriscar duplicar/perder bônus silenciosamente), grid de Anéis/Traits
  com os 4 anéis elementais calculados + Vazio à parte, Skills (add do compêndio ou livre, com rank),
  Técnicas (lista automática da escola até o Rank de Escola escolhido), Vantagens/Desvantagens (do
  compêndio, com saldo de pontos), Honra/Glória/Status/Infâmia, Vazio (rank + pontos gastos),
  Ferimentos (só dano acumulado por ora — **sem** penalidade automática, depende do `core_tables`
  pendente), Equipamento (sugestão da escola com botão de adicionar + lista livre) e Dinheiro
  (koku/bu/zeni). Tudo salva sozinho a cada mudança de campo.
- **`scripts/schema.py` (`CORE_TABLES`) + `scripts/extract_core_tables.py` + `scripts/build_core.py`**
  — pipeline separado do `run_all.ps1`, extrai do Core (só dele) as tabelas universais que a ficha
  precisa calcular. Já rodou (ver "Conferência dos dados extraídos" acima).

## Redesenho contra a ficha oficial (09/out)

Até aqui a estrutura da ficha (Identidade, Anéis/Traits, Skills, Técnicas, Vantagens/Desvantagens,
Honra/Glória/Status/Infâmia, Vazio/Ferimentos, Equipamento, Dinheiro) tinha sido montada de memória
— nunca fomos conferir a ficha de personagem OFICIAL de verdade. Ela existe: vem impressa no final
do próprio Core Rulebook (edição PT-BR), **páginas 392-396 do PDF** (5 páginas: ficha principal,
informações pessoais/vantagens/equipamento/técnicas, páginas extras de Bushi multiclasse, páginas
extras de Shugenja/magias, ficha de resumo de campanha). Renderizei essas páginas como imagem
(`pymupdf`) e comparei campo a campo.

**Campos que faltavam e foram adicionados:**
- Informações Pessoais (sexo, idade, altura, peso, cabelos, olhos, pai, mãe, irmãos, estado civil,
  cônjuge, filhos)
- Mácula das Terras Sombrias (mesmo padrão de Honra/Glória/Status/Infâmia)
- Kata/Kiho comprados fora da progressão da escola (`personagem.tecnicasExtras`, select do
  compêndio) — antes só existiam as técnicas automáticas por rank de escola
- Escolas adicionais (multiclasse) — só registro/referência, sem automação de bônus
- Afinidade/Deficiência elemental (Shugenja) — **campo manual por ora**, a extração das escolas não
  pega esse dado ainda (`scripts/schema.py` SCHOOLS não tem esses campos); se quiser automatizar
  depois, precisa adicionar ao schema e reextrair as escolas (custo: ~8 requests, 1 por livro)
- Armas em slots estruturados (Arma 1 / Arma 2 / Flechas — Tipo/Ataque/Dano/Bônus/Notas)
- Armadura consolidada (Tipo/Bônus de NA/Redução/Qualidade/Notas)
- Local do equipamento (mochila/casa/ambos)
- Conversão de dinheiro (1 Koku = 5 Bu = 50 Zeni · 1 Bu = 10 Zeni) — nota fixa, não é cálculo
- Campo de Recuperação de Ferimentos (manual por ora — fórmula Vigor x2 + Sabedoria confirmada
  contra a ficha oficial, falta ligar o cálculo automático)
- Skills vindas da automação de escola agora ficam marcadas (`deEscola: true`, badge "escola" na
  lista) — a ficha oficial tem uma coluna de círculos "Perícias de Escola" pro mesmo propósito

**Descoberta importante nessa conferência: "Sabedoria" é o termo oficial pra Insight Rank, não
"Discernimento"** (que eu tinha inventado sem checar) — ver a correção feita logo acima, antes desta
seção, e `glossario.json`/`data/core/formulas.json`/`ranks-sabedoria.json`.

**O que a ficha oficial tem e a nossa ainda não tenta replicar:** o diagrama circular dos 5 Anéis
(a ilustração em si — a ficha usa um grid de cartões por anel, que carrega a mesma informação mas
não visualmente). Decisão consciente de escopo, não esquecimento — reavaliar se o Carlos quiser algo
mais próximo visualmente.

**`storage.js` ganhou `normalizar(p)`:** preenche com os valores padrão qualquer campo que falte
num personagem salvo antes dessas chaves existirem, pra não quebrar fichas salvas no navegador antes
de 09/out.

**Testado com interação de clique de verdade** (não só print estático desta vez): usei
`puppeteer-core` + Chrome headless local pra simular alguém usando a ficha — 22 verificações, todas
passaram: personagem novo, digitar nome e persistir, escolher clã→escola e ver o bônus de trait
aplicar sozinho, skills de escola aparecerem automaticamente, adicionar skill/kata/equipamento
manual, campos novos (info pessoal, arma, mácula) salvando, **persistência depois de F5**, troca de
tema persistindo, busca no Compêndio retornando resultado, navegação entre clãs na Wiki, criar e
excluir personagem. `puppeteer-core` foi instalado só pra esse teste e removido do repositório depois
— não é dependência do projeto.

**O que falta pra ficha em si (próximo passo real):** os dados de `data/core/` (níveis de ferimento,
ranks de Sabedoria, custos de evolução, fórmulas) já existem e foram conferidos contra o livro —
falta **ligar isso em `src/rules.js`/`src/app.js`**: calcular Sabedoria (Insight Rank) de verdade
(hoje o Rank de Escola ainda é digitado manualmente), aplicar penalidade por Nível de Ferimento,
calcular NA de combate, Iniciativa e Recuperação de Ferimentos pelas fórmulas extraídas. Magias
conhecidas/preparadas pra Shugenja também falta (schema do personagem já tem o campo, UI ainda não
feita). Favicon.ico também falta (cosmético, 404 inofensivo no console).

## Wiki de clãs (iniciada em 09/out, não é mais "próxima fase")

Carlos pediu pra começar já (antes só estava planejada como fase seguinte): um banco de dados tipo
wiki sobre o sistema — clã → resumo, valores, aparência, papel no Império, relação com outros clãs,
ganchos de roleplay — navegável como enciclopédia (clicar num clã relacionado pula pra página dele).

- **`scripts/schema.py` (`LORE`)** — schema por clã, com instrução explícita no prompt (ver
  `extract_lore.py`) pra escrever **resumo original**, nunca tradução/cópia de frase do livro — essa
  é a parte NARRATIVA/autoral da AEG, risco de copyright maior que traduzir uma lista de vantagens
  (que é só fato de regra). Roda só contra **The Great Clans** (o livro dedicado a isso).
- **`scripts/extract_lore.py`** — 1 request, prompt próprio (`montar_prompt_lore`, diferente do
  `montar_prompt` genérico de `extract.py` — por isso `extract.py` ganhou um parâmetro
  `montar_prompt_fn` opcional). Salva em `raw/lore.json`.
- **`scripts/build_lore.py`** — converte `raw/lore.json` em `data/lore/clas.json`, normalizando o
  nome do clã (reaproveita `carregar_mapa_cla()`/`slugify()` de `merge.py`) e gerando `id`/`claId`
  pra cada relação entre clãs (link clicável na wiki).
- **`src/wiki.js`** — aba **Wiki** nova na ficha: lista de clãs + artigo com resumo/valores/
  aparência/papel/relações (clicáveis, pulam pro clã relacionado)/ganchos de roleplay. Mostra aviso
  se `data/lore/clas.json` não existir — não é mais o caso, já tem os 9 clãs de verdade.
- **Rodou com dado real em 09/out:** 9 clãs extraídos (ver "Conferência dos dados extraídos" acima
  pra qualidade/ressalvas). Visual num navegador de fato ainda não foi conferido (extensão do Chrome
  não conectou nesta sessão) — abrir `https://vangruver.github.io/ficha-l5r4e/` e checar quando der.

## Segurança

`GEMINI_API_KEY` do Carlos foi exposta no chat em 07/out/2026 (comando `printenv` rodado sem necessidade).
Mesma pendência de rotação que já existe pra outros segredos do projeto principal — rotacionar no
Google AI Studio quando sobrar tempo.
