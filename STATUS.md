# Status — ficha-l5r4e

Ficha modular de L5R 4ª edição (AEG), nos moldes do dnd-sheet/ficha-tormenta20.
Fase atual: extração de dados dos livros via Gemini (quase terminada) + primeira versão do
compêndio pesquisável e da ficha de personagem (prontas, rodando com os 7/8 livros já extraídos).

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

Com as duas contas, a cota de hoje à noite vira **40/dia** em vez de 20 — mais que suficiente pros
7 requests que faltam (Sword and Fan + core-tables + lore), tudo numa rodada só.

## Escopo (8 livros)

Core + Book of Air/Earth/Fire/Water/Void + Sword and Fan + The Great Clans (extra, adicionado depois do escopo original).

PDFs em `pdfs/`, vieram do Drive do Carlos (pasta "Lenda dos 5 aneis").

## Pipeline

- `glossario.json` — termos fixos EN→PT (anéis, traits, clãs, termos de sistema); nomes próprios de escola/kata/kiho ficam em inglês/romaji.
- `scripts/schema.py` — schema de extração por categoria: schools, kata_kiho, skills, spells, advantages_disadvantages, equipment.
- `scripts/extract.py` — sobe o PDF pro Gemini File API, extrai categoria por categoria, salva em `raw/<slug>.json` com `source_book`+`pagina` por item. **Salva incremental** (categoria por categoria) e **retoma** sozinho — se rodar de novo num livro que já tem progresso parcial, só busca o que falta.
- `scripts/run_all.ps1` — roda `extract.py` nos livros que faltam, em sequência.

## Status dos livros

| Livro | Slug | Status |
|---|---|---|
| Book of Air | `air` | ✅ feito (piloto) |
| Core Rulebook | `core` | ✅ feito |
| Book of Water | `water` | ✅ feito |
| Book of Fire | `fire` | ✅ feito (08/out) |
| Book of Earth | `earth` | ✅ feito (09/out) |
| Book of Void | `void` | ✅ feito (09/out) |
| The Great Clans | `great-clans` | ✅ feito (09/out) |
| Sword and Fan | `sword-and-fan` | 🟡 parcial — só `schools` (09/out); faltam `kata_kiho`, `skills`, `spells`, `advantages_disadvantages`, `equipment` (5 categorias) |

Só falta **Sword and Fan** (5 categorias) pra terminar a extração dos 8 livros.

## Bloqueio atual

Free tier do Gemini API: **20 requests/dia** por modelo (`gemini-3.5-flash`). Cada livro = 6 requests
(uma por categoria). 3ª batida de cota em **09/out/2026 ~09:55** (logo depois de extrair `schools` do
Sword and Fan) — mensagem de erro dizia "retry em 11h30", ou seja reset previsto **~09/out ~21:30**
(confirmar hora exata na mensagem de erro se for retomar antes).

Nota: na 1ª categoria do Sword and Fan, numa rodada anterior (08/out), o Gemini devolveu um JSON
malformado (`Invalid \uXXXX escape`) que quebrou o parser — não era erro de cota, foi uma resposta
ruim do modelo. Não se repetiu na tentativa seguinte (09/out), então parece intermitente; se voltar a
acontecer em `sword-and-fan`/`schools` especificamente, vale investigar se é algo no PDF daquele livro
(ex. caractere especial que o Gemini escapa errado).

Decisão do Carlos: esperar o reset (de graça), não ativar billing.

## Retomar

Depois do reset (`$env:GEMINI_API_KEY` já setado como variável de ambiente de usuário no PC do
Carlos), rodar nessa ordem (cabe fácil num dia de 20 requests — são só 7 no total):

1. `D:\ficha pasta git\ficha-l5r4e\scripts\run_all.ps1` (powershell) — termina o `sword-and-fan`
   (5 categorias; com save incremental, não regasta o que já tem).
2. `py scripts/extract_core_tables.py` — 1 request, extrai as tabelas universais do Core
   (níveis de ferimento, ranks de Discernimento, custos de evolução) pra `raw/core-tables.json`.
3. `py scripts/build_core.py` — sem gastar cota, converte `raw/core-tables.json` pra
   `data/core/niveis-ferimento.json`, `ranks-discernimento.json`, `custos-evolucao.json`, `formulas.json`.
4. `py scripts/extract_lore.py` — 1 request, extrai a wiki de clãs do The Great Clans (resumo
   original, não tradução — ver "Wiki de clãs" abaixo) pra `raw/lore.json`.
5. `py scripts/build_lore.py` — sem gastar cota, converte `raw/lore.json` pra `data/lore/clas.json`.
6. `py scripts/merge.py` — sem gastar cota, regera `data/raw/*.json` já com o Sword and Fan completo
   (compêndio final dos 8 livros).
7. `git add -A && git commit -m "..." && git push` — manda tudo isso pro
   [repo no GitHub](https://github.com/vangruver/ficha-l5r4e) (ver seção "Publicado no GitHub" acima).

Depois disso a extração está 100% feita.

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
  o Gemini, não gasta cota — roda a qualquer momento que `raw/` mudar. Já rodou uma vez com os 7
  livros prontos: **25 schools, 75 kata/kiho, 42 skills, 91 spells, 22 advantages, 15 disadvantages,
  17 weapons, 11 armor, 12 gear** (310 itens).
- **`data/core/aneis.json` e `data/core/traits.json`** — os 5 Anéis e os 8 Traits com o mapeamento
  Anel→Trait (Terra: Vigor/Vontade, Ar: Reflexos/Prontidão, Água: Força/Percepção, Fogo:
  Agilidade/Intelecto, Vazio: nenhum) — escrito à mão, é regra básica estável do sistema desde
  sempre. Fica pra conferir contra `core_tables` (abaixo) quando essa extração rodar, só por
  garantia.
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
- **Validação feita sem navegador** (extensão do Chrome não conectou nesta sessão): sintaxe de todo
  o JS (`node --check`), e a lógica de verdade (`rules.js` + `database.js`) rodada em Node direto
  contra os dados reais extraídos (anéis derivados, técnicas por rank de uma escola real, saldo de
  vantagens/desvantagens, busca/filtro) — todos os testes passaram. **O que não foi testado:** cliques
  e renderização de fato num navegador — abrir `index.html` (local, `python -m http.server`, ou
  publicado) e confirmar visualmente na primeira oportunidade.
- **O que falta pra ficha em si:** Insight Rank (depende do `core_tables`, ver abaixo) — hoje o Rank de
  Escola é digitado manualmente em vez de calculado; penalidade de Nível de Ferimento (mesma
  dependência); magias conhecidas/preparadas pra Shugenja (schema do personagem já tem o campo,
  UI ainda não feita); NA de combate e Iniciativa (fórmulas também vêm do `core_tables`).
- **`scripts/schema.py` (`CORE_TABLES`) + `scripts/extract_core_tables.py` + `scripts/build_core.py`**
  — pipeline novo, separado do `run_all.ps1`, pra extrair do Core (só dele) as tabelas universais que
  a ficha de personagem vai precisar calcular: níveis de ferimento, ranks de Discernimento, custos de
  evolução em XP, fórmulas de iniciativa/NA/Discernimento. Decidi extrair essas tabelas do PDF via
  Gemini em vez de digitar de memória — são números de regra, e eu não tinha 100% de certeza deles
  de cor; o risco de errar silenciosamente um cálculo da ficha é maior que o custo de **mais 1
  request** no Gemini. Ainda não rodou (precisa de cota) — ver "Retomar".

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
  se `data/lore/clas.json` ainda não existir (caso de agora — só rodou com dado sintético pra testar
  o pipeline, removido antes de commitar).
- **Testado:** pipeline `extract_lore.py`→`build_lore.py` com um clã sintético (normalização de
  nome, geração de id e de link entre clãs) — passou. **Não testado:** dado de verdade (precisa da
  extração rodar) nem a aba Wiki num navegador de fato.
- Ainda não rodou (precisa de cota) — ver "Retomar" acima.

## Segurança

`GEMINI_API_KEY` do Carlos foi exposta no chat em 07/out/2026 (comando `printenv` rodado sem necessidade).
Mesma pendência de rotação que já existe pra outros segredos do projeto principal — rotacionar no
Google AI Studio quando sobrar tempo.
