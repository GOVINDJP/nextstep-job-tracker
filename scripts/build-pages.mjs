import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
await build({entryPoints:[path.join(root,'docs/src/main.tsx')],outfile:path.join(root,'docs/app.js'),bundle:true,minify:true,format:'esm',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},alias:{'@':root},legalComments:'eof'});
