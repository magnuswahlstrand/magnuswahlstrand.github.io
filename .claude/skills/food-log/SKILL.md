---
name: food-log
description: Add a meal (photo + dish name) to the food log at /food-log. Use when the user shares a food photo and asks to add it to the food log.
---

# Adding a food log entry

The food log is `src/data/food-log.json`, rendered by `src/pages/food-log.astro`.
Photos live in `public/img/food-log/`.

## Inputs

- **Photo** — usually an uploaded image. If the attachment didn't arrive, ask for it
  again rather than guessing at other files in the uploads directory.
- **Dish name** — in Swedish, as the user wrote it. If the photo clearly shows sides
  (e.g. "med fläsk, svartkål och lingonsylt"), you may offer a fuller name, but use
  the user's wording unless they agree.

## Steps

1. **Date** — use the photo's EXIF capture date (`DateTimeOriginal`), not today's
   date; meals are often logged a day or two later. Fall back to asking if there is
   no EXIF.

   ```bash
   export NODE_PATH=$PWD/node_modules/.pnpm/sharp@0.33.5/node_modules  # adjust version
   node -e "require('sharp')('<photo>').metadata().then(m => console.log(
     m.width, m.height, m.exif?.toString('latin1').match(/20\d\d:\d\d:\d\d \d\d:\d\d:\d\d/)?.[0]))"
   ```

2. **Filename** — `YYYY-MM-DD-<slug>.jpg`, slug in lowercase ASCII from the dish
   name (å/ä → a, ö → o), short: `2026-10-02-korean-bbq-kyckling-pitabrod.jpg`.

3. **Shrink the photo** — phone photos are 3–5 MB at 3472×4624 and nothing in the
   build resizes them. Resize to a 1600 px long edge at quality 60 (lands around
   80–250 KB):

   ```bash
   # Linux (sharp is in node_modules via Astro; .rotate() applies EXIF orientation)
   node -e "require('sharp')('<photo>').rotate()
     .resize(1600, 1600, { fit: 'inside' }).jpeg({ quality: 60, mozjpeg: true })
     .toFile('public/img/food-log/<filename>').then(console.log)"
   # macOS
   sips -Z 1600 -s format jpeg -s formatOptions 60 <photo> --out public/img/food-log/<filename>
   ```

4. **Add the entry** at the **top** of `entries` — the list is newest first, and the
   page reads `entries[0]` / the last entry for its date range. If the date is older
   than the current top entry, insert it in date order instead.

   ```json
   {
     "date": "YYYY-MM-DD",
     "dish": "Dish name",
     "image": "/img/food-log/<filename>"
   }
   ```

   Edit only the new entry. Dish names repeat (there are two "Raggmunk" entries), so
   never rename with a global find-and-replace — match on the `image` path instead.

5. **Commit on `main`** — food log entries go straight to `main`, one commit per meal:
   `Add <Month> <day> meal to food log`. The pre-commit hook runs prettier.

6. **Push** — pushing `main` deploys to GitHub Pages. Remote `main` may have moved,
   so fetch and rebase first. If SSH isn't available (cloud sessions), go through the
   `gh` login over HTTPS without changing the remote:

   ```bash
   U=https://github.com/magnuswahlstrand/magnuswahlstrand.github.io.git
   git -c credential.helper= -c 'credential.helper=!gh auth git-credential' fetch $U main
   git rebase FETCH_HEAD
   git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push $U main
   ```

   Check the deploy with `gh run list -L 1`.
