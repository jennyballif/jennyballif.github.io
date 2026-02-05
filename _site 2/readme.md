# Science Mom Website (V2 Rebuild)

A fresh rebuild of the Science Mom website using Jekyll (GitHub Pages compatible).

## Run Locally

```bash
bundle install
bundle exec jekyll serve
```

Then open [http://localhost:4000](http://localhost:4000) in your browser.

## The /images Constraint

**Important:** The `/images` folder at the repository root contains PDFs and assets referenced by external links (Teachable courses, existing bookmarks, etc.).

- Do NOT rename, move, delete, or reorganize files in `/images`
- Do NOT add fingerprinting/hashing or compression to these files
- These files must remain accessible at `https://science.mom/images/...`

You can add new files to `/images` if needed, but leave existing content untouched.

## Where to Update Content

### Navigation Links
Edit `_includes/nav.html` to change the main navigation menu.

### Footer Links
Edit `_includes/footer.html` to change footer content and links.

### Homepage Content
Edit `index.html` in the root directory. The homepage includes:
- Hero section with headline and CTAs
- Feature cards (4-column grid)
- "Popular right now" section (3-column grid)
- Support/Patreon CTA band

### Stub Pages
Each page lives in its own folder with an `index.md`:
- `/start/index.md` - Start Here page
- `/free/index.md` - Free Resources page
- `/activities/index.md` - Activities page
- `/about/index.md` - About page
- `/support/index.md` - Support/Patreon page
- `/contact/index.md` - Contact page

### Styling
Main stylesheet: `assets/css/main.css`

CSS uses custom properties (variables) for easy theming:
- `--primary`: Deep blue (#1f5fa8)
- `--accent`: Warm orange (#e07a2f)
- `--bg`: Light background (#f5f8fb)
- `--text`: Dark text (#13233a)

## Changing the Courses Link

Currently, "Browse Courses" links to `https://sciencemom.teachable.com`.

When ready to switch to `https://courses.science.mom`:

1. **Update nav.html**: Change the `href` in `_includes/nav.html`
2. **Update index.html**: Search for `sciencemom.teachable.com` and replace with `courses.science.mom`
3. **Update stub pages**: Check `/start/index.md` and `/free/index.md` for Teachable links

A quick find-and-replace across the project:
```
Find: sciencemom.teachable.com
Replace: courses.science.mom
```

## File Structure

```
├── _config.yml          # Jekyll configuration
├── _includes/
│   ├── nav.html         # Site navigation
│   └── footer.html      # Site footer
├── _layouts/
│   └── default.html     # Base HTML template
├── assets/
│   ├── css/main.css     # Main stylesheet
│   └── js/main.js       # JavaScript (minimal)
├── images/              # Legacy assets (DO NOT MODIFY)
├── index.html           # Homepage
├── start/index.md       # Start Here page
├── free/index.md        # Free Resources page
├── activities/index.md  # Activities page
├── about/index.md       # About page
├── support/index.md     # Support page
└── contact/index.md     # Contact page
```

## Deployment

This site is configured for GitHub Pages. Push to the `master` branch to deploy.

The site uses only GitHub Pages-compatible plugins:
- `jekyll-feed` - RSS feed generation
- `jekyll-seo-tag` - SEO meta tags
