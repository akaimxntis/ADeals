import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data", "extensions.json");
const chromeDir = path.join(root, "updates", "chrome");
const firefoxDir = path.join(root, "updates", "firefox");

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function requireField(extension, field, value) {
  if (!value) {
    throw new Error(`Extensão "${extension.slug || extension.name}" está sem ${field}.`);
  }
}

async function main() {
  const raw = await fs.readFile(dataPath, "utf8");
  const data = JSON.parse(raw);
  const extensions = data.extensions || [];

  await fs.mkdir(chromeDir, { recursive: true });
  await fs.mkdir(firefoxDir, { recursive: true });

  for (const extension of extensions) {
    requireField(extension, "slug", extension.slug);
    requireField(extension, "version", extension.version);

    const update = extension.update || {};
    const downloads = extension.downloads || {};

    if (update.chromeId && downloads.chromiumCrx) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">
  <app appid="${xmlEscape(update.chromeId)}">
    <updatecheck codebase="${xmlEscape(downloads.chromiumCrx)}" version="${xmlEscape(extension.version)}" />
  </app>
</gupdate>
`;
      await fs.writeFile(path.join(chromeDir, `${extension.slug}.xml`), xml, "utf8");
    }

    if (update.firefoxAddonId && downloads.firefoxXpi) {
      const json = {
        addons: {
          [update.firefoxAddonId]: {
            updates: [
              {
                version: extension.version,
                update_link: downloads.firefoxXpi,
              },
            ],
          },
        },
      };

      if (update.firefoxUpdateHash) {
        json.addons[update.firefoxAddonId].updates[0].update_hash = update.firefoxUpdateHash;
      }

      await fs.writeFile(path.join(firefoxDir, `${extension.slug}.json`), JSON.stringify(json, null, 2) + "\n", "utf8");
    }
  }

  console.log(`Manifests gerados para ${extensions.length} extensão(ões).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
