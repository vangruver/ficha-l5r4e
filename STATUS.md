# Status — ficha-l5r4e

Ficha modular de L5R 4ª edição (AEG), nos moldes do dnd-sheet/ficha-tormenta20.

**9 livros extraídos (10/out/2026)** — os 8 originais + **Secrets of the Empire**, adicionado pelo
Carlos depois (PDF grande, 70MB, ele baixou manualmente do Drive pra `pdfs/` porque não dá pra puxar
arquivo desse tamanho via Drive MCP sem estourar contexto). Extraiu de uma vez só, sem bater cota —
as tabelas universais do Core e a wiki de 9 clãs continuam completas de antes. Compêndio final: 339
itens, **conferido sem nenhuma duplicata** (nome repetido entre livros ou dentro do mesmo livro) —
ver `scripts/checar_duplicatas.py`. **Ficha redesenhada em 09/out pra bater com os campos da ficha
oficial** (ver seção "Redesenho contra a ficha oficial" abaixo). **Cálculos automáticos ligados em
10/out** (Sabedoria, NA, Iniciativa, Nível de Ferimento — ver seção "Cálculos automáticos" abaixo).
**Ficha considerada completa em 10/out** — Magias pra Shugenja, favicon e limite oficial de
Desvantagens (10 pts, confirmado contra o Core pág. 106) foram os últimos itens fechados. O que
resta é só automação futura opcional (Afinidade/Deficiência extraída do livro em vez de manual),
não um item quebrado ou faltando.

**Wiki expandida de 9 pra 307 artigos em 10-11/out** — Carlos pediu uma wiki muito mais completa
depois de notar que só os 9 Clãs Grandes estavam lá ("cadê o Clã Oriole?" — era o Clã do Papa-figos,
um dos 10 Clãs Menores do Secrets of the Empire que ainda não tinham sido extraídos). Ver seção
"Wiki expandida (10-11/out)" abaixo pro detalhe completo — **falta reextrair 1 categoria com bug
(tradições marciais) e extrair Sword & Fan (ameaças/estrangeiros)**, bloqueado pela cota diária do
Gemini até ~21h de 11/out (ver "Cota pendente" nessa seção).

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

**O que falta pra ficha em si:** Rank de Escola continua digitado manualmente (é uma escolha de
build — quais técnicas de escola você tem — relacionada a Sabedoria mas não idêntica a ela; ver
"Cálculos automáticos" abaixo pro porquê de não serem a mesma coisa). Os dois itens pequenos que
restavam (favicon e limite de Desvantagem) foram fechados em 10/out — ver seção abaixo.

## Favicon e limite de Desvantagens (10/out)

**Favicon:** `assets/favicon.svg` novo — 5 pontos vermelhos ao redor de um centro claro (lembra um
mon/emblema, ecoa os 5 Anéis), em `#C8323F` sobre fundo escuro `#171A1F` (cores do tema Clean, fixas
no SVG — favicon não lê variável CSS da página). Referenciado via `<link rel="icon" type="image/svg+xml">`
no `<head>`; legível em 16px, sem precisar gerar `.ico` binário (todo navegador relevante aceita SVG).

**Limite de Desvantagens confirmado:** abri `core.pdf` de novo e busquei o texto da regra (não
estava nas tabelas já extraídas, só nas descrições narrativas do capítulo de criação de personagem).
Achei na pág. 106: *"Desvantagens funcionam similarmente, exceto que personagens ganham Pontos de
Experiência por escolhê-las, até um máximo de 10 pontos extras."* — confirma a lembrança que eu tinha
anotado como não-confirmada: **10 pontos é o limite oficial**. `rules.js` ganhou
`LIMITE_PONTOS_DESVANTAGENS = 10`; `saldoVantagensDesvantagens()` agora retorna `acimaDoLimite`. A
ficha não bloqueia escolher mais (decisão narrativa do jogador/mestre), só avisa: o texto do saldo
mostra `X/10 pts` e fica vermelho+negrito (`.aviso`) quando passa de 10. Testado com clique de
verdade (`puppeteer-core` de novo, instalado/removido só pra esse teste): adicionar desvantagens até
passar de 10 pts dispara o aviso, e ele persiste depois de F5.

## Magias pra Shugenja (10/out)

Seção nova **"Magias (Shugenja)"**: lista de magias conhecidas (adicionar/remover do compêndio, 92
magias disponíveis) e rastreador **"Feitiços por Dia"** por anel (Terra/Ar/Fogo/Água/Vazio) — máximo
de vagas editável com +/-, "usados hoje" que trava no máximo (não deixa passar). O máximo é digitado
à mão — a fórmula oficial de quantas vagas por dia depende de Afinidade/Deficiência da escola, que a
extração dos livros ainda não pega (mesma ressalva do campo Afinidade/Deficiência em Identidade).

`personagem.feiticosPorDia` novo em `storage.js` (5 anéis, `max`+`usados` cada), com `normalizar()`
preenchendo em fichas salvas antes dessa mudança.

**Testado com clique de verdade:** adicionar/remover magia conhecida, não duplica clicando
"adicionar" de novo com a mesma selecionada, +/- no máximo e nos usados do Feitiços por Dia, usados
trava no máximo sem passar, tudo persiste depois de F5.

## Cálculos automáticos (10/out)

Bloco novo **"Combate"** na ficha (logo depois de Anéis e Traits), calculado sozinho a partir de
Anéis/Traits/Skills/Armadura/Dano — não é editável diretamente, só reage ao resto da ficha:

- **Sabedoria** (= "Insight Rank" — termo oficial da ficha é "Sabedoria", ver "Redesenho contra a
  ficha oficial" acima): total = (soma dos 5 Anéis, incluindo Vazio, x10) + soma de todos os níveis
  de Perícia. O **rank** vem de `data/core/ranks-sabedoria.json` (só confirmado até o Rank 8 — ver
  ressalva acima; acima de 324 pontos mostra "8+" em vez de inventar um rank não confirmado).
- **NA (Número de Armadura):** Reflexos x5 + 5 + bônus digitado no campo "Bônus de NA" da Armadura
  (texto livre, ex. "+3" — `rules.js` extrai o número).
- **Iniciativa:** mostrado como **pool de dados** ("Rolar k Manter", ex. "5k4"), não um número único
  — é pra rolar, não pra exibir um resultado fixo. Rolar = Rank de Sabedoria + Reflexos, Manter =
  Reflexos.
- **Nível de Ferimento + penalidade:** a partir do dano acumulado (`feridasAtuais`) e do Anel de
  Terra, usando `data/core/niveis-ferimento.json`. Os limites são **cumulativos**: Saudável = Terra x5,
  cada nível seguinte soma mais Terra x2 ao limite anterior (confirmado contra a nota da ficha
  oficial: "Terra x2 por Nível, Terra x5 para Saudável").
- **Recuperação de Ferimentos:** Vigor x2 + Rank de Sabedoria — o campo que antes era digitado à mão
  agora é só leitura (`disabled`), preenchido sozinho.

**Por que Rank de Escola continua manual:** Sabedoria e Rank de Escola são coisas relacionadas mas
não idênticas no sistema — Rank de Escola é uma escolha de progressão (quais técnicas você já
aprendeu), normalmente acompanha a Sabedoria mas pode divergir (multiclasse, por exemplo). Preferi
não forçar os dois a serem sempre iguais sem confirmar essa regra específica contra o livro.

`src/rules.js` ganhou `sabedoriaTotal`, `rankSabedoria`, `naTotal`, `iniciativaPool`,
`recuperacaoFerimentos`, `nivelFerimentoAtual`. `src/database.js` carrega as tabelas de `data/core/`
que faltavam (`niveisFerimento`, `ranksSabedoria`, `formulas`). O recálculo roda centralizado dentro
de `salvar()` em `src/app.js` — qualquer mudança que persista o personagem também atualiza o bloco
Combate.

**Testado com clique de verdade** (`puppeteer-core` + Chrome headless local, instalado só pro teste
e removido depois): valores iniciais corretos pra um personagem novo (Sabedoria 100/Rank 1, NA 15,
Iniciativa 3k2, Recuperação 5, Saudável), NA e Iniciativa reagem a mudar Reflexos pelos botões +/-,
NA reage ao bônus de armadura digitado, Nível de Ferimento muda corretamente com dano acumulado
(inclusive a penalidade certa), Sabedoria sobe ao adicionar skill, tudo recalcula idêntico depois de
recarregar a página.

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

## Wiki expandida (10-11/out)

Carlos: "Você só botou os grandes clãs... cadê o Clã Oriole e as famílias menores? Eu quero a wiki
mais completa possível, com todas as informações do livro." Fui atrás e achei: o Clã Oriole é um dos
**10 Clãs Menores** cobertos só por `secrets-of-the-empire.pdf` (capítulo "The Way of the Minor
Clans") — nunca tinha sido extraído. Carlos então pediu pra ir além: todos os clãs de todos os
livros, todas as famílias, e "qualquer outra informação" dos livros (reinos espirituais, tradições
marciais, armas/estilos, etc.). A wiki foi de **9 artigos (só os Clãs Grandes) pra 307**.

**Categorias novas** (schema em `scripts/schema.py`, dois shapes reutilizáveis: "grupo" — rico, tipo
clã, com resumo/valores/aparência/papel/relações/ganchos — e "entidade curta" — catálogo, um
parágrafo, tipo família/artefato):

| Categoria | Fonte | Itens | Script |
|---|---|---|---|
| Clãs Grandes (já existia) | The Great Clans | 9 | `extract_lore.py` |
| **Famílias** (vassalas dos Clãs Grandes/Menores + Imperiais, unificado com tag `categoria`) | Great Clans Apêndice 2 + Secrets cap. 1/2 | 72 | `extract_lore.py` + `extract_lore_menores.py` |
| **Clãs Menores** (Badger, Bat, Boar, Dragonfly, Hare, Monkey, **Oriole**, Ox, Sparrow, Tortoise) | Secrets cap. 1 | 10 | `extract_lore_menores.py` |
| **Facções** (Ronin, Irmandade de Shinsei) | Secrets cap. 3/4 | 2 | `extract_lore_menores.py` |
| **Ordens Monásticas** (seitas/ordens da Irmandade) | Secrets cap. 4 | 9 | `extract_lore_menores.py` |
| **Reinos Espirituais** (Chikushudo, Jigoku, Yomi, Yume-Do...) | Secrets cap. 5 | 10 | `extract_lore_menores.py` |
| **Artefatos** (nemuranai notáveis) | 5 livros elementais | 89 | `extract_lore_elementos.py` |
| **Criaturas** (fortunas, espíritos, raças lendárias) | 5 livros elementais | 71 | `extract_lore_elementos.py` |
| **Locais Notáveis** (cortes famosas + grande local de cada livro) | 5 livros elementais | 35 | `extract_lore_elementos.py` |
| **Tradições Marciais** (dojos, estilos de combate nomeados) | 5 livros elementais | 0 (bug, ver abaixo) | `extract_lore_elementos.py` |
| **Ameaças Externas** / **Estrangeiros** | Sword and Fan cap. "Enemies"/"Outsiders" | ainda não extraído | `extract_lore_sword_fan.py` |

`src/database.js` carrega todos os `data/lore/*.json` novos. `src/wiki.js` foi reescrito do zero:
antes era só lista+artigo de clã, agora tem uma barra de **seções** no topo (só mostra seção com
dado — nenhuma aba vazia) e link cruzado funciona entre QUALQUER par de seções "grupo" (ex. uma
relação de Clã Menor pode apontar pra um Clã Grande) e de família pro clã-pai. `index.html`/
`style.css` ganharam `.wiki-secoes`/`.wiki-corpo` pra acomodar o nível extra de navegação.

**Bug achado e corrigido antes de subir ruim:** a categoria `tradicoes_marciais` reusava o campo
`"cla"` do schema genérico (pensado pra nomear o PRÓPRIO grupo) — mas como o livro sempre menciona a
tradição marcial ao lado do clã que a pratica (ex. "Heart of the Katana, dojo do Clã do Leão"), o
Gemini confundiu e preencheu o **clã associado** em vez do nome da tradição em ~65% dos itens (37
extraídos, só 13 nomes únicos — ex. 4 entradas diferentes todas rotuladas "Clã do Leão", cada uma
com conteúdo de um dojo diferente escondido atrás do mesmo rótulo). Pego a tempo rodando
`checar_duplicatas`-style nos `data/lore/*.json` antes de considerar pronto. Corrigido: schema agora
usa um campo próprio (`nome_tradicao`, nunca exposto pro resto do código — `build_lore.py` remapeia
pra `"cla"` na saída) com instrução explícita no prompt. **Apaguei a categoria `tradicoes_marciais`
dos 5 `raw/lore-<elemento>.json`** pra forçar reextração com o schema corrigido — as outras 3
categorias de cada um (`artefatos`/`criaturas`/`locais`) não tinham esse problema (conferido: ids
únicos em todas as categorias, zero duplicata) e ficaram como estão.

**Cota pendente (retomar quando resetar, ~21h de 11/out):** `GEMINI_API_MODEL` também precisou
mudar — `gemini-2.0-flash` foi descontinuado pela Google entre sessões (`model no longer available`),
e na troca `gemini-2.5-flash` deu 404 "no longer available to new users" e `gemini-3.8-flash`/
`gemini-3.7-flash` estavam com sobrecarga de servidor (503) persistente. **`gemini-3.6-flash`
funcionou bem** e é o valor atual de `GEMINI_API_MODEL` (setado via `setx`, mas lembrar de exportar
de novo em terminal novo — ver nota de sempre sobre `GEMINI_API_KEY_2`/`setx` não propagar pra shell
já aberto). Faltam **3 requests** pra fechar tudo: `tradicoes_marciais` dos 5 livros elementais (na
real seriam 5 requests, mas Vazio já tem as outras 3 categorias, só falta reextrair essa 1 categoria
nova ali também — total real: 5 de tradições + 2 do Sword & Fan = 7, não 3; corrigir essa conta
quando for rodar). Comando pra retomar: `python extract_lore_elementos.py` (resumível, só pega o que
falta) seguido de `python extract_lore_sword_fan.py`, depois `python build_lore.py` de novo.

**Testado com clique real** (`puppeteer-core`, instalado/removido só pra esse teste): as 9 seções
com dado aparecem (nenhuma vazia — Ameaças/Estrangeiros/Tradições Marciais ficam escondidas até
terem conteúdo), contagem de itens bate em cada uma, link cruzado entre clã e clã funciona, link de
família pro clã-pai funciona, zero erro de console.

## Segurança

`GEMINI_API_KEY` do Carlos foi exposta no chat em 07/out/2026 (comando `printenv` rodado sem necessidade).
Mesma pendência de rotação que já existe pra outros segredos do projeto principal — rotacionar no
Google AI Studio quando sobrar tempo.
