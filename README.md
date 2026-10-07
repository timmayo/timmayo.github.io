# timmayo.github.io

Personal site for Tim Mayo: Power Platform teaching, class materials link, and a live GitHub repository feed.

## Structure

```
index.html            Landing page
assets/css/styles.css Theme (light/dark, reduced-motion aware)
assets/js/app.js      Live repo feed (GitHub REST API), search/filter/sort, theme toggle
.nojekyll             Serve files as-is
```

## Notes

- Repos load from `https://api.github.com/users/timmayo/repos` at page load and are cached in `localStorage` for 30 minutes. Unauthenticated limit is 60 requests/hour per IP.
- The "Class materials" button links to `/classes/`, which is served by the `timmayo/classes` project site.
- Change the account by editing `USER` at the top of `assets/js/app.js`.

## Local preview

```
python -m http.server 8080
```
