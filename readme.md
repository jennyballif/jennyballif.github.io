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

## Courses and Bundles

The course list lives in two data files. Edit these, not the pages:

- `_data/courses.yml`: each science course (name, Teachable path, thumbnail, price, summary), grouped by grade band
- `_data/bundles.yml`: each bundle (name, Teachable path, thumbnail, price, what it includes)

These files feed the `/courses/` page, the course list on the homepage, `llms.txt`, and the course structured data (JSON-LD) on `/courses/`. A course with no `price` (like the live Earth Science course) shows without one.

Course thumbnails are 800x450 web copies in `images/CourseThumbnails/ScienceThumbnails/web/`, made from the full-size images one folder up.

## Changing the Courses Link

Every link to the Teachable course site uses one setting in `_config.yml`:

```yaml
courses_url: "https://sciencemom.teachable.com"
```

After making `courses.science.mom` the primary domain in Teachable, change it to:

```yaml
courses_url: "https://courses.science.mom"
```

Leave off the trailing slash. Commit and push, and every course link, `llms.txt`, and the structured data update together. `jekyll serve` doesn't reload `_config.yml`, so restart it to test locally. After the switch, check that an old `sciencemom.teachable.com` link redirects to the new domain.

When adding a new link to the course site anywhere, write it as `{{ site.courses_url }}/p/...` rather than typing the domain.

## Search and AI Visibility

- **Page descriptions:** set `description:` in each page's front matter. `jekyll-seo-tag` turns it into the meta description and social previews.
- **Page titles:** set in `_layouts/default.html` ("Page · Science Mom"; the homepage has its own). `{% seo title=false %}` keeps the plugin from adding a second title.
- **Structured data:** `_includes/schema-org.html` describes the business and founders. It loads on the homepage, About, and Courses pages.
- **llms.txt:** a plain-language summary of the site for AI assistants. Its course and bundle lists come from the data files above.
- **robots.txt:** allows all crawlers, including AI crawlers.
- **Image descriptions (alt text):** add `alt:` to entries in `_data/experiments.yml` and `_data/printables.yml`, and `imagealt:` to experiment posts. If they're missing, a description is built from the title.

## File Structure

```
├── _config.yml          # Jekyll configuration (includes courses_url)
├── _data/
│   ├── courses.yml      # Science courses (feeds /courses/, homepage, llms.txt)
│   ├── bundles.yml      # Course bundles
│   ├── experiments.yml  # Quick experiments
│   └── printables.yml   # Printables
├── _includes/
│   ├── nav.html         # Site navigation
│   ├── footer.html      # Site footer
│   └── schema-org.html  # Business and founder structured data
├── _layouts/
│   └── default.html     # Base HTML template
├── assets/
│   ├── css/main.css     # Main stylesheet
│   └── js/main.js       # JavaScript (minimal)
├── images/              # Legacy assets (DO NOT MODIFY)
├── index.html           # Homepage
├── courses/index.html   # Courses and bundles page
├── llms.txt             # Site summary for AI assistants
├── robots.txt           # Crawler rules
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
- `jekyll-sitemap` - sitemap.xml
