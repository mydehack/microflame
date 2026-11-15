import fs from 'fs';
import path from 'path';

const swcIndexPath = path.resolve('node_modules/next/dist/build/swc/index.js');

if (fs.existsSync(swcIndexPath)) {
  let content = fs.readFileSync(swcIndexPath, 'utf8');
  if (content.includes('let pkgPath = pkg;')) {
    content = content.replace('let pkgPath = pkg;', 'let pkgPath = require.resolve(pkg);');
    fs.writeFileSync(swcIndexPath, content, 'utf8');
    console.log('[PATCH] Successfully patched Next.js SWC wasm pkgPath resolution.');
  }
}

