You are helping rebuild the Science Mom website from scratch in a local Jekyll repo (GitHub Pages compatible). We are starting fresh, keeping only one legacy requirement:

HARD CONSTRAINT:
- The folder /images is at the repository root and contains many existing PDFs and files referenced externally.
- DO NOT rename, move, reorganize, delete, fingerprint, compress, or otherwise change existing /images contents.
- /images must remain accessible at https://science.mom/images/... when deployed.

GOAL:
Create a new, clean Jekyll site structure with a modern, friendly homepage style based on a provided mockup (rounded cards, soft shadows, clear hierarchy, cheerful academic feel). The site is hosted on GitHub Pages but we are developing locally first. Do not modify DNS or Teachable yet.

PHASE 1 SCOPE (must complete):
1) Create a minimal Jekyll scaffold:
   - _layouts/default.html
   - _includes/nav.html
   - _includes/footer.html
   - assets/css/main.css
   - assets/js/main.js (optional, only if needed)
   - index.html homepage
   - stub pages: /start/, /free/, /activities/, /about/, /support/, /contact/

2) Use a simple design system:
   - max-width container 1100–1200px
   - hero section with headline + subheadline + 2 CTA buttons
   - feature card grid (4 cards)
   - “Popular right now” section (3 cards)
   - CTA band (Patreon/support)
   - footer with 3–5 links
   - responsive behavior: mobile single column, tablet 2-col, desktop multi-col
   - typography: system font stack, readable sizes, generous spacing
   - color palette: light background, deep blue primary, warm orange accent, dark text

3) Links:
   - “Browse Courses” CTA links to https://sciencemom.teachable.com (for now).
   - “Support / Chess Club” links to https://patreon.com/sciencemom.
   - Internal nav links to /start/, /free/, /activities/, /about/, /support/, /contact/.

4) Keep the configuration simple:
   - Use a cleaned _config.yml with only essential settings and plugins (jekyll-seo-tag and jekyll-feed are OK).
   - Avoid complicated plugins or build tooling (must remain GitHub Pages compatible).

IMPORTANT WORKFLOW:
- Do not delete anything in /images folder.
- You can add new assets to /images and Jekyll include/layout folders.
- Keep everything working with `bundle exec jekyll serve`.
- When creating pages, use layouts/includes so the site is consistent.

DELIVERABLES:
- Fully working local site with the above pages.
- Clear file structure and comments in code where appropriate.
- A short README.md explaining:
  - how to run locally
  - the purpose of /images constraint
  - where to update nav links and homepage content
  - how to later change the courses link from sciencemom.teachable.com to courses.science.mom

ACCEPTANCE CHECKS:
- Site builds with `bundle exec jekyll serve` without errors.
- All internal links work.
- Files aren't removed or moved inside /images folder.
- Homepage matches the general styling and layout of the mockup.
