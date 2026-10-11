"""
Schemas de extração por categoria. Cada schema é passado ao Gemini como
response_schema (saída JSON estruturada) junto com o PDF do livro.

Uma categoria pode vir vazia num livro (ex.: Book of Air pode não ter
school nova) — isso é esperado, não é erro.
"""

SCHOOLS = {
    "type": "object",
    "properties": {
        "schools": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string", "description": "nome em inglês/romaji, não traduzir"},
                    "cla": {"type": "string"},
                    "familia": {"type": "string"},
                    "tipo": {"type": "string", "description": "bushi, shugenja, courtier, monk, etc."},
                    "trait_inicial_bonus": {"type": "string"},
                    "skills_de_escola": {"type": "array", "items": {"type": "string"}},
                    "honra_inicial": {"type": "number"},
                    "status_inicial": {"type": "number"},
                    "equipamento_inicial": {"type": "array", "items": {"type": "string"}},
                    "tecnica_por_rank": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "rank": {"type": "integer"},
                                "nome": {"type": "string"},
                                "texto_pt": {"type": "string", "description": "descrição mecânica traduzida"}
                            }
                        }
                    },
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

KATA_KIHO = {
    "type": "object",
    "properties": {
        "kata_kiho": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "tipo": {"type": "string", "enum": ["kata", "kiho"]},
                    "pre_requisito": {"type": "string"},
                    "anel_ou_trait": {"type": "string"},
                    "custo": {"type": "string"},
                    "texto_pt": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

SKILLS = {
    "type": "object",
    "properties": {
        "skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "trait_associado": {"type": "string"},
                    "categoria": {"type": "string", "description": "Alta, Baixa ou Bugei"},
                    "emphases_possiveis": {"type": "array", "items": {"type": "string"}},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

SPELLS = {
    "type": "object",
    "properties": {
        "spells": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "anel": {"type": "string"},
                    "mastery_level": {"type": "integer"},
                    "area": {"type": "string"},
                    "duracao": {"type": "string"},
                    "texto_pt": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

ADVANTAGES_DISADVANTAGES = {
    "type": "object",
    "properties": {
        "advantages": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "custo_pontos": {"type": "integer"},
                    "texto_pt": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        },
        "disadvantages": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "pontos_concedidos": {"type": "integer"},
                    "texto_pt": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

EQUIPMENT = {
    "type": "object",
    "properties": {
        "weapons": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "dano": {"type": "string", "description": "notação XkY"},
                    "preco": {"type": "string"},
                    "raridade": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        },
        "armor": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "bonus_tn": {"type": "string"},
                    "reducao_dano": {"type": "string"},
                    "preco": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        },
        "gear": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "nome": {"type": "string"},
                    "efeito_pt": {"type": "string"},
                    "preco": {"type": "string"},
                    "source_book": {"type": "string"},
                    "pagina": {"type": "integer"}
                }
            }
        }
    }
}

CATEGORIAS = {
    "schools": SCHOOLS,
    "kata_kiho": KATA_KIHO,
    "skills": SKILLS,
    "spells": SPELLS,
    "advantages_disadvantages": ADVANTAGES_DISADVANTAGES,
    "equipment": EQUIPMENT,
}

# ---------------------------------------------------------------------------
# Tabelas universais de regra (não são "opções de personagem" por livro —
# são as tabelas numéricas que a ficha usa pra calcular tudo: níveis de
# ferimento, ranks de Sabedoria/Insight, custos de evolução). Só existem no Core
# Rulebook, por isso ficam fora de CATEGORIAS (que o run_all.ps1 roda em
# todos os livros) e usam um script e um arquivo de saída próprios
# (scripts/extract_core_tables.py -> raw/core-tables.json).
# ---------------------------------------------------------------------------
CORE_TABLES = {
    "type": "object",
    "properties": {
        "aneis_traits": {
            "type": "array",
            "description": "Os 5 Anéis e os 2 Traits de cada (Vazio não tem Trait)",
            "items": {
                "type": "object",
                "properties": {
                    "anel": {"type": "string", "description": "em inglês: Earth, Air, Fire, Water ou Void"},
                    "traits": {"type": "array", "items": {"type": "string"}, "description": "em inglês, vazio pro anel Void"}
                }
            }
        },
        "niveis_ferimento": {
            "type": "array",
            "description": "a tabela de Níveis de Ferimento (Wound Levels), na ordem do Saudável até Fora de Combate",
            "items": {
                "type": "object",
                "properties": {
                    "ordem": {"type": "integer"},
                    "nome_en": {"type": "string"},
                    "nome_pt": {"type": "string"},
                    "multiplicador_anel_terra": {"type": "number", "description": "multiplica o Anel de Terra pra achar o limite de dano desse nível"},
                    "penalidade": {"type": "integer", "description": "penalidade numérica aplicada nesse nível, 0 se não houver"}
                }
            }
        },
        "ranks_discernimento": {
            "type": "array",
            "description": "a tabela de Ranks de Sabedoria (Insight Rank, termo oficial da ficha é \"Sabedoria\") e a faixa de pontos de cada",
            "items": {
                "type": "object",
                "properties": {
                    "rank": {"type": "integer"},
                    "discernimento_minimo": {"type": "integer"},
                    "discernimento_maximo": {"type": "integer", "description": "null/omitir se não tiver topo (rank mais alto)"}
                }
            }
        },
        "custos_evolucao": {
            "type": "object",
            "description": "fórmulas de custo em XP pra evoluir Traits, Skills, Void Points e Emphasis",
            "properties": {
                "trait_formula_pt": {"type": "string", "description": "como o livro descreve o custo pra subir 1 rank de Trait"},
                "skill_formula_pt": {"type": "string", "description": "como o livro descreve o custo pra subir 1 rank de Skill"},
                "void_point_formula_pt": {"type": "string"},
                "emphasis_custo_xp": {"type": "integer"}
            }
        },
        "formula_iniciativa_pt": {"type": "string", "description": "como a Iniciativa é calculada e rolada"},
        "formula_na_armadura_pt": {"type": "string", "description": "como o NA (Número de Armadura) base é calculado antes da armadura"},
        "formula_discernimento_pt": {"type": "string", "description": "como o total de Sabedoria (Insight) é calculado"},
        "source_book": {"type": "string"},
    }
}

# ---------------------------------------------------------------------------
# Wiki de lore — diferente de tudo acima: não é extração de regra mecânica,
# é a parte NARRATIVA dos livros (história, cultura, relações entre clãs e
# famílias). Por isso os prompts (ver extract_lore.py e extract_lore_menores.py)
# pedem expressamente um RESUMO ORIGINAL escrito a partir dos fatos do livro,
# nunca tradução ou cópia de frase — é prosa autoral da AEG, risco de
# copyright bem maior que traduzir uma lista de vantagens.
#
# Duas fontes, dois scripts:
# - The Great Clans -> extract_lore.py -> raw/lore.json (clas + familias,
#   as famílias vassalas dos 9 Clãs Grandes, Apêndice Dois do livro)
# - Secrets of the Empire -> extract_lore_menores.py -> raw/lore-menores.json
#   (clas_menores, familias_menores, familias_imperiais, faccoes — capítulos
#   "The Way of the Minor Clans", "The Imperial Families", "The Way of the
#   Ronin" e "The Brotherhood of Shinsei")
# ---------------------------------------------------------------------------
def _item_grupo_lore(campo: str = "cla", descricao_campo: str | None = None) -> dict:
    """Shape reutilizável pra qualquer 'grupo' estilo clã: clã grande, clã
    menor, facção (Ronin, Irmandade de Shinsei), ordem monástica, reino
    espiritual, tradição marcial, ameaça externa, etc. O nome do campo é
    "cla" por padrão (simplicidade de reuso no código — wiki.js,
    build_lore.py — mesmo quando o grupo não é tecnicamente um clã), mas
    categorias onde "cla" induz o modelo a preencher o CLÃ ASSOCIADO em vez
    do nome do próprio grupo (ex. tradições marciais, que o livro sempre
    menciona ao lado do clã que a pratica) devem passar um `campo` diferente
    — build_lore.py remapeia de volta pra "cla" na hora de montar a saída."""
    descricao_campo = descricao_campo or "nome do grupo em inglês, ex. 'Crab Clan', 'Badger Clan', 'Ronin', 'Brotherhood of Shinsei'"
    return {
        "type": "object",
        "properties": {
            campo: {"type": "string", "description": descricao_campo},
            "resumo_pt": {"type": "string", "description": "resumo ORIGINAL (suas palavras, não tradução) de quem é o grupo e seu papel em Rokugan, 3-5 frases"},
            "valores_pt": {"type": "string", "description": "resumo original dos valores/filosofia que o grupo preza"},
            "aparencia_pt": {"type": "string", "description": "resumo original da estética/cultura visível (vestimenta, arquitetura, maneirismos)"},
            "papel_pt": {"type": "string", "description": "resumo original do papel oficial do grupo no Império (ex. defesa, diplomacia, lei)"},
            "patrono_pt": {"type": "string", "description": "se o grupo tiver um Clã Grande como patrono/protetor oficial, resumo original dessa relação; deixe vazio se não houver"},
            "relacoes": {
                "type": "array",
                "description": "relação com outros clãs/grupos",
                "items": {
                    "type": "object",
                    "properties": {
                        "cla": {"type": "string", "description": "nome do outro clã/grupo em inglês"},
                        "tipo": {"type": "string", "description": "aliado, rival, neutro, tenso, etc."},
                        "descricao_pt": {"type": "string", "description": "resumo original do porquê dessa relação"}
                    }
                }
            },
            "ganchos_roleplay": {
                "type": "array",
                "items": {"type": "string"},
                "description": "3-6 ganchos de roleplay originais (situações, conflitos, ideias de história) pra um personagem desse grupo"
            },
            "source_book": {"type": "string"},
        }
    }


LORE = {
    "type": "object",
    "properties": {
        "clas": {
            "type": "array",
            "description": "um item por clã (os 9 grandes clãs)",
            "items": _item_grupo_lore(),
        }
    }
}

# Clãs menores (Badger, Bat, Boar, Dragonfly, Hare, Monkey, Oriole, Ox,
# Sparrow, Tortoise) — extraído de Secrets of the Empire, capítulo
# "The Way of the Minor Clans". Mesmo shape de LORE.
CLAS_MENORES = {
    "type": "object",
    "properties": {
        "clas_menores": {
            "type": "array",
            "description": "um item por clã menor coberto pelo livro",
            "items": _item_grupo_lore(),
        }
    }
}

# Facções que não são clãs mas funcionam como um no sistema (têm escolas
# próprias no compêndio): Ronin e Irmandade de Shinsei. Mesmo shape de LORE.
FACCOES = {
    "type": "object",
    "properties": {
        "faccoes": {
            "type": "array",
            "description": "Ronin e Irmandade de Shinsei (e subgrupos relevantes, ex. ordens/seitas principais), se o livro cobrir",
            "items": _item_grupo_lore(),
        }
    }
}

# Famílias vassalas (de clãs grandes ou menores) e Famílias Imperiais —
# resumo mais curto que o de clãs/facções, uma família costuma ter só um
# parágrafo no livro-fonte.
_ITEM_FAMILIA = {
    "type": "object",
    "properties": {
        "nome": {"type": "string", "description": "nome da família em romaji/inglês"},
        "cla_pai": {"type": "string", "description": "nome em inglês do clã/grupo ao qual essa família é vassala (ou 'Imperial' se for uma Família Imperial, sem clã)"},
        "familia_principal": {"type": "string", "description": "se a família vassala serve a uma família específica dentro do clã (ex. Fundai serve aos Kaiu), o nome dessa família principal; deixe vazio se servir ao clã como um todo"},
        "resumo_pt": {"type": "string", "description": "resumo original (2-4 frases) da origem e papel da família"},
        "especialidade_pt": {"type": "string", "description": "resumo original curto da função/especialidade prática da família (ex. diplomacia, construção naval, captura de criaturas das Terras Sombrias)"},
        "source_book": {"type": "string"},
        "pagina": {"type": "integer"},
    }
}

FAMILIAS = {
    "type": "object",
    "properties": {
        "familias": {
            "type": "array",
            "description": "famílias vassalas dos Clãs Grandes",
            "items": _ITEM_FAMILIA,
        }
    }
}

FAMILIAS_MENORES = {
    "type": "object",
    "properties": {
        "familias_menores": {
            "type": "array",
            "description": "famílias vassalas dos Clãs Menores",
            "items": _ITEM_FAMILIA,
        }
    }
}

FAMILIAS_IMPERIAIS = {
    "type": "object",
    "properties": {
        "familias_imperiais": {
            "type": "array",
            "description": "as Famílias Imperiais (Hantei, Toturi, Iweko, Seppun, Otomo, Miya e outras cobertas pelo livro)",
            "items": _ITEM_FAMILIA,
        }
    }
}

# Reinos Espirituais (Chikushudo, Gaki-Do, Jigoku, Maigo no Musha, Meido,
# Sakkaku, Tengoku, Toshigoku, Yomi, Yume-Do) e Ordens Monásticas principais
# da Irmandade de Shinsei — mesmo shape "grupo" de clãs/facções, extraído de
# Secrets of the Empire (capítulos "The Spirit Realms" e "The Brotherhood
# of Shinsei").
REINOS_ESPIRITUAIS = {
    "type": "object",
    "properties": {
        "reinos_espirituais": {
            "type": "array",
            "description": "os reinos espirituais cobertos pelo livro (natureza do reino, quem o habita, como se interage com ele)",
            "items": _item_grupo_lore(),
        }
    }
}

ORDENS_MONASTICAS = {
    "type": "object",
    "properties": {
        "ordens_monasticas": {
            "type": "array",
            "description": "as principais ordens/seitas da Irmandade de Shinsei descritas pelo livro, além do resumo geral já coberto em 'faccoes'",
            "items": _item_grupo_lore(),
        }
    }
}

# ---------------------------------------------------------------------------
# Enciclopédia temática dos 5 livros elementais (Air/Earth/Fire/Water/Void) —
# cada um segue a mesma estrutura: capítulo de Guerra (tradições marciais,
# dojos famosos), capítulo do Mundo (criaturas, nemuranai/artefatos), e um
# capítulo dedicado a um grande local de aventura (castelo, floresta, ilha,
# dojo). Mesmo cuidado de copyright que o resto da wiki: resumo original.
# ---------------------------------------------------------------------------

# Tradições marciais e dojos nomeados (ex. Iaijutsu, Heart of the Katana,
# Green Blade Dojo, Hundred Stances Dojo, Kukan-do, Sumai...). Shape "grupo"
# porque tem bastante conteúdo narrativo (história, filosofia, praticantes).
# Campo próprio ("nome_tradicao", não "cla") — tentativa anterior com "cla"
# fez o modelo preencher o CLÃ ASSOCIADO à tradição em vez do nome da
# tradição em si (ex. "Crane Clan" ao invés de "Heart of the Katana"),
# porque o livro sempre menciona os dois juntos. build_lore.py remapeia
# "nome_tradicao" -> "cla" na saída, então o resto do pipeline nem sabe
# que o campo de origem tinha outro nome.
TRADICOES_MARCIAIS = {
    "type": "object",
    "properties": {
        "tradicoes_marciais": {
            "type": "array",
            "description": "artes marciais, estilos de combate e dojos/escolas de treino nomeados que o livro descrever (história, filosofia, o que ensinam, praticantes notáveis)",
            "items": _item_grupo_lore(
                campo="nome_tradicao",
                descricao_campo=(
                    "nome da TRADIÇÃO/ESTILO/DOJO em si, em inglês, ex. "
                    "'Heart of the Katana', 'Iaijutsu', 'Kukan-do', 'Hundred "
                    "Stances Dojo'. NUNCA o nome do clã associado a ela — "
                    "isso vai em 'patrono_pt', não aqui."
                ),
            ),
        }
    }
}

# Entrada curta reutilizável pra catálogos grandes (artefatos, criaturas,
# locais) — um parágrafo no livro-fonte, não dá pra (nem faz sentido) pedir
# o mesmo tanto de detalhe do shape "grupo".
_ITEM_ENTIDADE_CURTA = {
    "type": "object",
    "properties": {
        "nome": {"type": "string", "description": "nome em romaji/inglês"},
        "contexto_pt": {"type": "string", "description": "a quem/o que isso está associado — dono, clã/família, elemento, região (curto, texto livre)"},
        "resumo_pt": {"type": "string", "description": "resumo original (2-4 frases) de origem/descrição"},
        "destaque_pt": {"type": "string", "description": "resumo original curto do que torna essa entrada notável (poder, função, perigo, importância)"},
        "source_book": {"type": "string"},
        "pagina": {"type": "integer"},
    }
}

ARTEFATOS = {
    "type": "object",
    "properties": {
        "artefatos": {
            "type": "array",
            "description": "nemuranai (itens mágicos desperto) notáveis descritos no capítulo 'O Mundo de X' do livro",
            "items": _ITEM_ENTIDADE_CURTA,
        }
    }
}

CRIATURAS = {
    "type": "object",
    "properties": {
        "criaturas": {
            "type": "array",
            "description": "criaturas e seres sobrenaturais/outros mundos associados ao elemento do livro (fortunas, espíritos, raças lendárias, criaturas mundanas notáveis)",
            "items": _ITEM_ENTIDADE_CURTA,
        }
    }
}

LOCAIS = {
    "type": "object",
    "properties": {
        "locais": {
            "type": "array",
            "description": "cortes/castelos notáveis mencionados pelo livro, mais o grande local de aventura do capítulo dedicado (castelo, floresta, ilha, dojo, etc.)",
            "items": _ITEM_ENTIDADE_CURTA,
        }
    }
}

CATEGORIAS_ELEMENTAIS = {
    "tradicoes_marciais": TRADICOES_MARCIAIS,
    "artefatos": ARTEFATOS,
    "criaturas": CRIATURAS,
    "locais": LOCAIS,
}

# ---------------------------------------------------------------------------
# Sword & Fan — livro de política/guerra, não tem clã/família novo, mas tem
# conteúdo narrativo só dele: ameaças externas (capítulo "Enemies") e nações
# gaijin/estrangeiros na política rokugani (capítulo "Outsiders in Rokugani
# Politics").
# ---------------------------------------------------------------------------
AMEACAS = {
    "type": "object",
    "properties": {
        "ameacas": {
            "type": "array",
            "description": "ameaças externas ao Império descritas no capítulo 'Enemies' (grupos, não criaturas isoladas — ex. facções das Terras Sombrias, piratas, bandidos)",
            "items": _item_grupo_lore(),
        }
    }
}

ESTRANGEIROS = {
    "type": "object",
    "properties": {
        "estrangeiros": {
            "type": "array",
            "description": "nações/povos gaijin e sua relação com a política rokugani, do capítulo 'Outsiders in Rokugani Politics'",
            "items": _item_grupo_lore(),
        }
    }
}
