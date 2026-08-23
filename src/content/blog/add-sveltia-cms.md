---
title: "I Wanted a CMS for My Static Site (So I Wrote Two Files)"
description: "How I added Sveltia CMS to my Astro site with no server, no database, and no new repository."
date: 2026-08-23
tags: ["astro", "sveltia cms", "static site", "git"]
---

My blog lives in a git repo. Markdown files, Astro builds it, Cloudflare deploys on push. It's boring and I love it.

But every time I wanted to publish a post from my phone, or fix a typo without opening an editor, the answer was: open laptop, pull, write, commit, push.

So I wanted a CMS. But I gave myself three rules:

1. No new repository or project
2. Same Cloudflare deployment I already have
3. Boring to maintain

That last rule killed most options before I even opened their docs.

---

## The graveyard

**Pages CMS** — you edit your repo through *their* website. Genuinely nice, genuinely zero code. But my content would be managed on someone else's domain forever. I wanted `/admin` on *my* site. Next.

> "Fine, I'll just use Decap CMS. It's the classic. Everyone uses it."

Not so fast.

Decap needs a **server** to log you into GitHub. GitHub's OAuth flow requires exchanging a client secret, and a static site has nowhere to keep secrets. So you deploy an "OAuth proxy" — a tiny server whose only job is brokering your own login.

In 2026. For a personal blog. Hard pass.

**Keystatic** — lovely editor, but it wanted me to convert my fully-static site to SSR mode and add a Cloudflare adapter. That's not a CMS install, that's a migration.

I was close to giving up and hand-editing markdown forever.

---

## The unlock

Then I found [Sveltia CMS](https://sveltiacms.app).

It's a modern rewrite of Decap (same config format, way better UI), and it supports something Decap doesn't lean on: **"Sign In with Token."**

No OAuth app. No proxy server. You paste a **fine-grained PAT** into the login screen once, and the browser talks to the GitHub API directly.

A fine-grained PAT is a GitHub token scoped to *specific repos* with *specific permissions*. Mine can read and write contents of exactly one repository: this site. If it ever leaks, the blast radius is one repo, and I revoke it in ten seconds.

The CMS itself is a single JavaScript file loaded from a CDN. It runs entirely in my browser. There is no backend. There was never a backend.

---

## What it actually took

Two new files:

`public/admin/index.html` — about ten lines, mostly boilerplate:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

`public/admin/config.yml` — ~50 lines describing two collections: my blog posts (matching the Zod schema I already had) and my experience data.

That second collection forced the only structural change. Sveltia edits JSON/YAML, not TypeScript, and my experience entries lived in a `.ts` file. So the array moved to `experience.json`, and the old file became four lines:

```ts
import type { Experience } from '../types/experience';
import data from './experience.json';

export const experiences: Experience[] = data.experiences;
```

Nothing that imports it noticed.

One more one-liner: the CMS saves image paths like `/images/blog/photo.webp`, while my posts used `blog/photo.webp`. A single `.replace()` at the point where the path is consumed made both work.

Total diff: five files, roughly 150 lines added. No dependencies installed. Site still builds to plain static HTML.

---

## The gotchas (learned so you don't have to)

**YAML hates tabs.** My whole codebase indents with tabs, including my first attempt at `config.yml`. YAML does not allow tab indentation. At all. Ever. The parser rejected it and I felt very clever for a minute.

**Localhost serves it differently than prod.** On my dev server, `/admin` returned 404. Panic. Then `/admin/index.html` worked fine — the dev server just doesn't map directories to index files. Production? Cloudflare handles that automatically. One URL works locally, the other in prod, both correct.

**Testing without committing is built in.** Add `local_backend: true` to the config, open the admin on localhost, and Sveltia asks for access to your project folder using the browser's File System Access API. Edits go straight to the real markdown files, Astro hot-reloads them, and nothing touches GitHub. Chrome/Edge only — Safari doesn't support the API.

---

## The payoff

Now: open `/admin`, sign in with token, write post, hit save.

Save = commit to `main`. Commit = Cloudflare rebuilds. Rebuild = post live.

My publishing stack is still a git repo. The CMS is just a nicer window into it, and if Sveltia vanished tomorrow, my content is untouched markdown in git. Zero lock-in.

Would this setup survive a team of non-technical editors? Probably not — they'd need their own tokens. Sveltia offers an OAuth authenticator worker for that case. But that's a bridge to cross when someone else actually wants to write here.

Until then: two files, one token, zero servers.
