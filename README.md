# GitHub Extension Hub

Site estático grátis para listar extensões, baixar arquivos pelo navegador e hospedar manifests de atualização para Chromium e Firefox.

Funciona com:

- GitHub Pages para hospedar o site e os manifests.
- GitHub Releases para hospedar arquivos `.crx`, `.zip` e `.xpi`.
- GitHub Actions para gerar automaticamente `updates/chrome/*.xml` e `updates/firefox/*.json`.

## 1. Como publicar o site

1. Crie um repositório público no GitHub.
2. Envie todos estes arquivos para a branch `main`.
3. Vá em **Settings > Pages**.
4. Em **Source**, escolha **GitHub Actions**.
5. Faça um commit ou rode o workflow **Deploy GitHub Pages** manualmente.

Depois disso, o site ficará em:

```txt
https://SEU_USUARIO.github.io/SEU_REPOSITORIO/
```

## 2. Como cadastrar uma extensão

Edite o arquivo:

```txt
data/extensions.json
```

Troque `SEU_USUARIO`, `SEU_REPOSITORIO`, nome, descrição, versão, links e IDs.

Cada extensão precisa de um `slug` único, por exemplo:

```json
"slug": "minha-extensao"
```

Esse `slug` também vira o caminho dos manifests:

```txt
updates/chrome/minha-extensao.xml
updates/firefox/minha-extensao.json
```

## 3. Como lançar uma versão nova

1. Aumente a versão no `manifest.json` da extensão.
2. Gere os arquivos finais:
   - Chromium: `.crx` e, se quiser, `.zip`.
   - Firefox: `.xpi` assinado.
3. No GitHub, vá em **Releases > Draft a new release**.
4. Crie uma tag, exemplo:

```txt
minha-extensao-v1.0.1
```

5. Anexe os arquivos da versão.
6. Copie os links dos assets e atualize `data/extensions.json`.
7. Faça commit. O GitHub Actions publica o site e recria os manifests.

## 4. Chromium / Chrome / Edge: auto-update

No `manifest.json` da extensão Chromium, adicione:

```json
{
  "update_url": "https://SEU_USUARIO.github.io/SEU_REPOSITORIO/updates/chrome/minha-extensao.xml"
}
```

O arquivo `.crx` novo precisa ser empacotado com a **mesma chave `.pem`** da versão anterior. Sem a mesma chave, o navegador considera outra extensão.

Importante: o Chrome comum no Windows/macOS não é tão livre para instalar extensão fora da Chrome Web Store. Este modelo é mais útil para testes, Chromium, Linux, Edge/ambientes compatíveis ou distribuição controlada. Mesmo assim, o site deixa `.crx` e `.zip` prontos para download.

## 5. Firefox: auto-update

No `manifest.json` da extensão Firefox, adicione:

```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "minha-extensao@exemplo.com",
      "update_url": "https://SEU_USUARIO.github.io/SEU_REPOSITORIO/updates/firefox/minha-extensao.json"
    }
  }
}
```

O `.xpi` final precisa estar assinado para uso normal. Você pode publicar na AMO ou usar distribuição não listada/assinada.

## 6. Gerar manifests localmente

Opcionalmente, com Node instalado:

```bash
npm run generate
```

Isso gera:

```txt
updates/chrome/*.xml
updates/firefox/*.json
```

O GitHub Actions também faz isso automaticamente no deploy.

## 7. Estrutura

```txt
.
├── index.html
├── assets/
│   ├── app.js
│   ├── icon.svg
│   └── style.css
├── data/
│   └── extensions.json
├── scripts/
│   └── generate-updates.mjs
├── updates/
│   ├── chrome/
│   └── firefox/
└── .github/workflows/pages.yml
```

## 8. Limitações reais

- GitHub Pages é público. Não coloque token, cookie, chave privada `.pem` ou segredo no repositório.
- GitHub Pages não tem painel admin com upload, porque é site estático.
- Para atualizar Chromium, mantenha a mesma chave `.pem` ao empacotar `.crx`.
- Para atualizar Firefox fora da AMO, use manifesto JSON HTTPS e XPI assinado.
