#!/usr/bin/env bash
# Build production artifacts into ./deploy for VPS upload.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Building API"
pnpm --filter api build

echo "==> Building panels"
VITE_API_URL=/api/internal pnpm --filter internal-panel build
VITE_API_URL=/api/external pnpm --filter external-panel build

echo "==> Packaging API with production dependencies"
rm -rf deploy
mkdir -p deploy
pnpm --filter api --prod deploy deploy/api --legacy

echo "==> Copying compiled API output"
cp -a apps/api/dist deploy/api/

echo "==> Copying panel static assets"
mkdir -p deploy/external-panel deploy/internal-panel
cp -a apps/external-panel/dist/. deploy/external-panel/
cp -a apps/internal-panel/dist/. deploy/internal-panel/

echo "==> Replacing workspace TypeScript packages with compiled JS"
for pkg in shared-types shared-validation; do
  target="$(cd "deploy/api/node_modules/@fuel-carrier/$pkg" && pwd -P)"
  rm -rf "$target/src"
  cp -a "deploy/api/dist/packages/$pkg/src" "$target/src"
done

node <<'EOF'
const fs = require('fs');
const path = require('path');

function resolvePkg(name) {
  return fs.realpathSync(
    path.join('deploy/api/node_modules/@fuel-carrier', name),
  );
}

const typesPkg = resolvePkg('shared-types');
const typesJson = JSON.parse(
  fs.readFileSync(path.join(typesPkg, 'package.json'), 'utf8'),
);
typesJson.main = './src/index.js';
typesJson.types = './src/index.d.ts';
typesJson.exports = { '.': './src/index.js', './*': './src/*.js' };
fs.writeFileSync(
  path.join(typesPkg, 'package.json'),
  JSON.stringify(typesJson, null, 2) + '\n',
);

const validationPkg = resolvePkg('shared-validation');
const validationJson = JSON.parse(
  fs.readFileSync(path.join(validationPkg, 'package.json'), 'utf8'),
);
for (const [key, value] of Object.entries(validationJson.exports)) {
  validationJson.exports[key] = String(value).replace(/\.ts$/, '.js');
}
fs.writeFileSync(
  path.join(validationPkg, 'package.json'),
  JSON.stringify(validationJson, null, 2) + '\n',
);

console.log('OK: deploy packages point to compiled JS');
EOF

echo "==> Deploy bundle ready"
du -sh deploy/*