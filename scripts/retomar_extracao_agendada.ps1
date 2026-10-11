# Rodado pelo Agendador de Tarefas do Windows (tarefa "L5R_RetomarExtracao"),
# independente de qualquer sessão do Claude Code estar aberta. Retoma a
# extração pendente da wiki de L5R quando a cota diária do Gemini resetar e
# sobe o resultado pro GitHub. Não falha o script se a cota bater de novo —
# cada chamada python já salva progresso parcial por conta própria
# (scripts/extract.py); só loga e segue.

$ErrorActionPreference = "Continue"
$raiz = "D:\ficha pasta git\ficha-l5r4e"
$log = Join-Path $raiz "scripts\retomada_agendada.log"

"=== Retomada agendada: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $log -Append -Encoding utf8

Set-Location (Join-Path $raiz "scripts")
$env:GEMINI_API_MODEL = "gemini-3.6-flash"

python extract_lore_elementos.py *>> $log
python extract_lore_sword_fan.py *>> $log
python build_lore.py *>> $log

Set-Location $raiz
$mudancas = git status --porcelain
if ($mudancas) {
    git add -A *>> $log
    $msg = @"
Extracao automatica agendada: wiki L5R (grupos/personagens/regras pendentes)

Rodado pelo Agendador de Tarefas sem sessao do Claude Code aberta.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
"@
    git commit -m $msg *>> $log
    git push *>> $log
    "Commit e push feitos." | Out-File -FilePath $log -Append -Encoding utf8
} else {
    "Nada novo pra commitar (cota ainda esgotada ou extracao ja completa)." | Out-File -FilePath $log -Append -Encoding utf8
}

"=== Fim: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $log -Append -Encoding utf8
