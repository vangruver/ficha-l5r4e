$env:GEMINI_API_MODEL = "gemini-3.5-flash"
Set-Location "D:\ficha pasta git\ficha-l5r4e\scripts"

$livros = @(
    @{ pdf = "../pdfs/core.pdf"; slug = "core"; nome = "Core Rulebook" },
    @{ pdf = "../pdfs/book-of-water.pdf"; slug = "water"; nome = "Book of Water" },
    @{ pdf = "../pdfs/book-of-fire.pdf"; slug = "fire"; nome = "Book of Fire" },
    @{ pdf = "../pdfs/book-of-earth.pdf"; slug = "earth"; nome = "Book of Earth" },
    @{ pdf = "../pdfs/book-of-void.pdf"; slug = "void"; nome = "Book of Void" },
    @{ pdf = "../pdfs/sword-and-fan.pdf"; slug = "sword-and-fan"; nome = "Sword and Fan" },
    @{ pdf = "../pdfs/great-clans.pdf"; slug = "great-clans"; nome = "The Great Clans" },
    @{ pdf = "../pdfs/secrets-of-the-empire.pdf"; slug = "secrets-of-the-empire"; nome = "Secrets of the Empire" }
)

foreach ($livro in $livros) {
    Write-Output "=== $($livro.nome) ==="
    py extract.py $livro.pdf $livro.slug $livro.nome
    if ($LASTEXITCODE -ne 0) {
        Write-Output "FALHOU: $($livro.nome) (exit $LASTEXITCODE) -- seguindo pro proximo"
    }
}
Write-Output "=== TUDO PROCESSADO ==="
