// scripts/fix-imports.cjs
const fs = require('fs');
const path = require('path');

const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const root = path.join(process.cwd(), 'src');

function walk(dir) {
  let out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out = out.concat(walk(p));
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

function replaceAll(file) {
  let src = fs.readFileSync(file, 'utf8');
  let out = src;

  // Cambiar imports relativos a client.js -> alias @/api/client.js
  // ../../api/client(.js)?  o  ../api/client(.js)?  o  ./api/client(.js)?
  out = out.replace(/from\s+['"](?:\.\.\/){2,}api\/client(?:\.js)?['"]/g, "from \"@/api/client.js\"");
  out = out.replace(/from\s+['"]\.\.\/api\/client(?:\.js)?['"]/g,             "from \"@/api/client.js\"");
  out = out.replace(/from\s+['"]\.\/api\/client(?:\.js)?['"]/g,               "from \"@/api/client.js\"");

  // Si usabas client sin extensión, normaliza también
  out = out.replace(/from\s+['"](?:\.\.\/){2,}api\/client['"]/g, "from \"@/api/client.js\"");
  out = out.replace(/from\s+['"]\.\.\/api\/client['"]/g,         "from \"@/api/client.js\"");
  out = out.replace(/from\s+['"]\.\/api\/client['"]/g,           "from \"@/api/client.js\"");

  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    return true;
  }
  return false;
}

if (!fs.existsSync(root)) {
  console.error('❌ No existe la carpeta src en este proyecto.');
  process.exit(1);
}

const files = walk(root);
let changed = 0;
for (const f of files) {
  if (replaceAll(f)) {
    console.log('fixed:', path.relative(process.cwd(), f));
    changed++;
  }
}
console.log(`\n✅ Hecho. Archivos modificados: ${changed}`);