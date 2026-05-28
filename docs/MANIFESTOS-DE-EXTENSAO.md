# Snippets para colocar nas extensões

## Chromium

Coloque isto no `manifest.json` da extensão:

```json
{
  "update_url": "https://SEU_USUARIO.github.io/SEU_REPOSITORIO/updates/chrome/minha-extensao.xml"
}
```

Empacote sempre o `.crx` novo usando a mesma chave `.pem`.

## Firefox

Coloque isto no `manifest.json` da extensão:

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

O valor de `id` precisa bater com `update.firefoxAddonId` em `data/extensions.json`.
