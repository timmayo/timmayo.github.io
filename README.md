# timmayo.github.io

Personal site for Tim Mayo, Power Platform architect, instructor, and consultant. Published with GitHub Pages at https://timmayo.github.io/. It is plain HTML, CSS, and JavaScript with no build step.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page: intro, class tiles linking to each course datasheet (PDF), and a live feed of public GitHub repositories |
| `materials.html` | Class materials. Students enter the class password and get download links for their slides |
| `feedback.html` | Student feedback. Shows all feedback publicly; a form (gated by the class password) lets students add more |

All pages share the same header (Teaching, Class materials, Student feedback, Repositories, LinkedIn, and a light/dark toggle) and the same stylesheet.

## Structure

```
index.html              Landing page
materials.html          Class materials (password-protected downloads)
feedback.html           Student feedback list and submit form
datasheet/              Course datasheet PDFs linked from the class tiles
assets/css/styles.css   Theme (light/dark, reduced-motion aware) for all pages
assets/js/app.js        Repository feed, search/filter/sort, theme toggle, scroll reveal
assets/js/materials.js  Password check and materials list (Power Automate flow)
assets/js/feedback.js   Feedback list and submit form (Power Automate flows)
.nojekyll               Serve files as-is (no Jekyll processing)
```

## Course datasheets

The "What I teach" tiles on `index.html` link to PDFs in `datasheet/`:

- Power Apps for Power Users
- Power Automate for Power Users
- Power Platform AI Builder
- Power Platform ALM with Dataverse
- Power Platform Copilot Studio
- Power Platform for Administrators
- Power Platform Governance with CoE

File names are case-sensitive. If you rename or add a PDF, update the matching link in `index.html`.

## Repository feed

- Source: `GET https://api.github.com/users/timmayo/repos?per_page=100&sort=updated` (paginated, unauthenticated).
- Each card shows name, description, topics, language, stars, forks, last update, a link to the code, and a live-demo link when the repo's `homepage` is set.
- Controls: text search, language filter, sort (recently updated, most stars, name, newest), and a hide-forks toggle.
- States: loading placeholders, empty account, no matches, and an error state with a retry button.
- Results are cached in `localStorage` for 30 minutes. Refresh forces a re-fetch.
- Unauthenticated GitHub API calls are limited to 60 requests per hour per IP.

## Class materials and student feedback

Both pages talk to Power Automate flows (HTTP trigger). The password check happens inside the flows, not in the page.

**`materials.html`** (`assets/js/materials.js`)
- `POST` to the flow in `POWER_AUTOMATE_URL` with `{ "password": "..." }`.
- Expects `{ "name": "...", "materials": [{ "title": "...", "url": "..." }] }`.
- A non-OK response shows "Invalid password."

**`feedback.html`** (`assets/js/feedback.js`)
- `GET_FEEDBACK_URL` returns an array of `{ ClassTitle, Timestamp, Name, Feedback }`, shown newest first.
- `SUBMIT_FEEDBACK_URL` accepts `POST { "password", "name", "feedback" }`. A `401` means the password is wrong.

The flow URLs include a `sig` token and are visible in the page source. Treat them as public: the flows must validate the password and return only what students should see. To rotate a token, regenerate the trigger URL in the flow and update the constant in the matching `.js` file.

## Analytics

Microsoft Clarity is installed in the `<head>` of every page (project ID in the snippet). Remove the snippet from a page to stop tracking it.

## Local preview

```
python -m http.server 8080
# then open http://localhost:8080
```

## Deployment

GitHub Pages serves the `main` branch from the repository root. Pushing to `main` publishes the site within a minute or two.

## Customizing

- Change the GitHub account for the repo feed: `USER` at the top of `assets/js/app.js`.
- Change colors: the CSS variables in `:root` (and the dark-theme blocks) in `assets/css/styles.css`.
- Change the intro text width: `.lede` in `assets/css/styles.css`.
- Edit copy, nav links, and class tiles: the HTML files.
