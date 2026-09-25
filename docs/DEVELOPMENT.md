# Browser-only demo

The GitHub Pages workflow publishes this directory directly. The existing full-stack app remains in `app/`; this demo does not call its API or database.

`src/App.tsx` reuses the Nextstep interface. React renders user input as text. `src/storage.ts` validates records and saves them under the existing `nextstep-demo-applications` local-storage key. Valid records from the previous demo remain compatible. Invalid or inaccessible storage is left untouched and shown as an error. Failed writes keep the editor open.

After installing the root locked dependencies, run `node scripts/build-pages.mjs` from the repository root to regenerate `docs/app.js`. The committed `styles.css` is the original app's compiled responsive stylesheet. No build is needed on GitHub Pages.

Each browser keeps its own records. Data is not synchronized across devices; clearing site storage removes it. Concurrent changes in separate tabs are refreshed through storage events, with stale edits rejected before saving. Local storage is not an atomic multi-user database.
