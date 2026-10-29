# My Recipe Book

A personal recipe collection built with plain HTML, CSS, and JavaScript. No build step or application dependencies are required.

## Run locally

From `/workspace/my-recipe-app`:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open port 8000 in a browser when your environment supports port forwarding. The server must be restarted in a new session.

## Features

- Three starter recipes with ingredient lists and cooking instructions
- Add, view, edit, and delete recipes; deletion requires confirmation
- Search recipe names and ingredients, filter by category, and save favorites
- Recipes and favorites persist in localStorage in the current browser and origin
- Responsive layouts, labeled forms, keyboard-accessible native dialogs

Data stays in this browser; there is no account, cloud synchronization, or backend. Clearing browser storage removes your saved collection. Private browsing may limit persistence. If storage fails, the app warns that edits only last for the current session.

## Validation

```sh
node --check app.js
node tests/smoke.cjs
```

The browser smoke test requires Playwright and Chromium (both supplied by the current cloud environment), plus the server running on port 8000. It uses an isolated browser context and tests creation, editing, deletion and cancellation, search, filters, favorites, persistence, safe text rendering, and mobile overflow. It does not change your normal browser's collection. If Chromium is elsewhere, update the executable path in the test.

## Photos, servings, shopping, and backups

Attach a JPEG, PNG, or WebP photo (up to 2 MB) when adding or editing a recipe. Photos are saved with the recipe and included in backups; browser storage quotas still apply. You can remove a photo in the editor.

Open a recipe to adjust servings from 1–100. Leading whole numbers, decimals, fractions (`1/2`), and mixed fractions (`1 1/2`) scale; unquantified ingredients remain unchanged. Enter quantities in that format rather than Unicode fractions or ranges. Adjustments affect the displayed ingredients and shopping-list additions, without changing the saved base recipe.

Add ingredients to the shopping list from a recipe, check purchased items, and clear the list when finished. Entries stay separate rather than attempting to merge incompatible units. The list and checkmarks persist in this browser.

Export a JSON backup before clearing browser data or moving devices. Import validates the file and asks before replacing the current recipes and shopping list. Photos are included. Treat backups as personal files. Run `node tests/features.cjs` with the server running to test these features.

## Free hosting on phone and computer

GitHub Pages is a good fit for this static app: no backend, dependencies, or build are needed. For a public repository, GitHub Free supports Pages. After merging the app pull request, open repository **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then save. GitHub will show the HTTPS site address after deployment; the expected address is `https://srit1992-byte.github.io/my-recipe-app/`. This address is not live or verified until Pages deployment succeeds.

If the repository is private, GitHub Pages requires a qualifying paid plan; Cloudflare Pages has a free static-hosting option with private GitHub repository integration. Connect the repository, use no build command, and publish the repository root. Hosting has not been enabled by this implementation task.

Open the same hosted HTTPS address on your phone and computer. Recipes, photos, favorites, and shopping lists remain separate in each browser and do **not** synchronize. Export on one device and import on the other for a manual transfer. Changing from the local development address to the hosted address also starts a separate collection; use a backup to transfer it.
