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
# ferimento, ranks de Discernimento, custos de evolução). Só existem no Core
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
            "description": "a tabela de Ranks de Discernimento (Insight Rank) e a faixa de pontos de Discernimento de cada",
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
        "formula_discernimento_pt": {"type": "string", "description": "como o total de Discernimento (Insight) é calculado"},
        "source_book": {"type": "string"},
    }
}
