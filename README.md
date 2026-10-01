# SiteSmith

A one-page website builder where the template fills itself in.

The owner picks a template, answers four questions about their business, and Mistral
writes the whole page — headline, about, services, sample projects, testimonials.
They then edit anything by clicking it, swap in their own photos, and download a
finished website as a single HTML file.

Everything runs on your machine. No database, no cloud storage, no deployment.

---

## Run it

```bash
setup-env.cmd     # writes .env.local with the Mistral key (run once)
npm install
npm run dev
```

Open http://localhost:3000

If you'd rather do it by hand, copy `.env.example` to `.env.local` and fill in
`MISTRAL_API_KEY`. Restart the dev server after changing it — Next only reads
env files at startup.

---

## The flow

1. **`/`** — template gallery. Portfolio is live; the others are placeholders that
   plug into the same engine.
2. **`/new`** — four questions: business name, what you do, tone, what you offer.
3. **`/api/generate`** — sends the brief to Mistral in JSON mode, gets back structured
   copy, merges it over a complete default so a bad response can never break the page.
4. **`/editor/[id]`** — live preview plus four panels:
   - **Design** — 8 colour schemes, 6 type pairings, corner rounding, hero layout, spacing
   - **Content** — every text slot, each with a one-click "rewrite this with Mistral"
   - **Images** — upload, paste a URL, or get AI-suggested search terms
   - **Sections** — turn sections off, reorder them
   You can also click any text or image **directly in the preview** and change it there.
5. **Download** — one self-contained `index.html`: inlined CSS, base64 images, no
   build step, works offline. **Publish locally** writes the same file to
   `exports/<business-name>/index.html`.

---

## How it's put together

```
src/
  app/
    page.tsx                  landing + template gallery
    new/                      the 4-question wizard
    editor/[id]/              the editor (Editor.tsx, fields.ts, ImagePicker.tsx)
    sites/                    saved sites
    preview/[id]/route.ts     the finished site, no editing hooks
    api/
      generate/               brief  -> full page copy (Mistral)
      rewrite/                one field or one section  -> rewritten (Mistral)
      photos/                 industry -> photo search terms (Mistral) [+ Pexels]
      sites/                  CRUD against .data/sites.json
      upload/ media/[name]/   image upload + serving from .data/uploads
      export/[id]/            download one standalone index.html
      publish/[id]/           write that file into ./exports/
  lib/
    types.ts      content shape, design tokens, the Site record
    mistral.ts    the only AI client. Retries once, fails with a readable message.
    store.ts      the "database": one JSON file
    paths.ts      get/set by dot path + deep-merge with fallbacks
    inline.ts     turns every image into a data: URI for export
  templates/
    themes.ts     palettes, font pairings, radii, spacing
    document.ts   builds the full HTML document (editor + export share this)
    registry.ts   template metadata for the gallery
    portfolio/
      content.ts  default content + the JSON contract handed to Mistral
      styles.ts   the template's entire stylesheet, generated from design tokens
      render.ts   the template's markup
```

### One rendering path

The editor preview and the exported file come from the same function,
`buildDocument()`. The only difference is that the preview adds `contenteditable`
hooks and a small script. So what the owner sees really is what ships — there is no
second renderer to drift out of sync.

The preview runs inside an `<iframe srcDoc>`, which keeps the template's CSS
completely isolated from the builder's UI and makes the mobile preview honest.
The iframe talks to the editor over `postMessage`: text edits come back on blur,
image clicks open the picker, and the editor patches single fields back into the
live document rather than reloading it, so typing never causes a flicker.

### Templates are plain CSS on purpose

The builder UI uses Tailwind. The generated websites do not — they use a stylesheet
generated from design tokens. That is what makes the export a single file that opens
anywhere with no build step.

### Nothing breaks if the AI does

`defaultPortfolioContent()` is a complete, publishable page. Every Mistral response is
deep-merged over it, so a missing field, a short array or a malformed answer just falls
back to the default for that one slot. If the API call itself fails, you still land in
the editor with working copy and a banner explaining what went wrong.

---

## Adding the next template

1. `src/templates/<name>/` — `content.ts` (default content + JSON contract),
   `styles.ts` (tokens to CSS), `render.ts` (markup).
2. Add it to `TEMPLATES` and `TEMPLATE_IMPL` in `src/templates/registry.ts`.
3. Branch on `site.templateId` in `buildDocument()`.

The wizard, the editor, the theming, the image handling and the exporter are all
template-agnostic already.

---

## Where things are stored

| What | Where |
|---|---|
| Sites | `.data/sites.json` |
| Uploaded images | `.data/uploads/` |
| Published sites | `exports/<business-name>/index.html` |
| Secrets | `.env.local` |

All four are gitignored. Delete `.data/` to start clean.

---

## Optional: stock photo suggestions

Without a key, "Suggest photos" still asks Mistral for good search terms and then
tells you to upload your own. Add a free key from https://www.pexels.com/api/ to
`.env.local` as `PEXELS_API_KEY` and restart, and it will show real results you can
click straight into a slot.

---

## Not done yet (deliberately)

Deployment, hosting, custom domains, accounts, payments. The report calls for proving
the "answer questions → get a usable site" moment first; that is what this builds.
