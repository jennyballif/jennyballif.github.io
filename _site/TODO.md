# Site Build TODO

## 0) Preflight (do this first)
- [x] Confirm the YAML files are readable by Jekyll (`site.data.videos`, `site.data.experiments`, `site.data.printables`).
  - videos.yml: 173 entries with categories (QuaranTime, Math, archive, Projects, Miscellaneous, Water, Songs, Nature)
  - experiments.yml: ~30 entries with categories (chemistry, physics, ecology)
  - printables.yml: ~20 entries with category field (foldable)
- [x] Add a shared "card" include and a "tag/category pill" style so all pages match the homepage styling.
  - Created `_includes/card.html` with support for title, description, url, image, category, icon, meta
  - Created `_includes/pills.html` for category filter pills
  - Added CSS for `.pill`, `.pill-active`, `.card-thumb`, `.card-title`, `.card-desc`, `.card-category`, `.card-meta`
- [x] Add a consistent page header pattern if it doesn't yet exist: title, short intro, and optional filter UI (category pills).
  - Created `_includes/page-header.html` with title, intro, and optional pills integration
  - Added CSS for `.page-header`, `.page-title`, `.page-intro`

---

## 1) Video feeds (from `videos.yml`)
### 1.1 Videos landing page
- [x] Create `/videos/index.html` (or `.md`) with:
  - [x] Page intro ("Browse Science Mom videos by topic…")
  - [x] A grid/list of cards for *all videos*, newest first (if there is a date field; otherwise as listed).
  - [x] Category filter UI at top (pills linking to each category page).
  - [x] Each video card includes:
    - [x] Title
    - [x] Category
    - [x] Short description (if present)
    - [x] Thumbnail (if present) or placeholder — using YouTube thumbnail API
    - [x] Link to YouTube (or wherever the URL points)
    - [x] Optional: duration, grade band, tags if present — shows bonus materials

### 1.2 Separate feeds per category (auto-generated)
- [x] Create a category index system:
  - [x] Determine the set of unique categories from `videos.yml`.
  - [x] Generate a page per category:
    - [x] `/videos/category/<slug>/index.html` (recommended)
  - [x] Each category page shows:
    - [x] Header with category name + count
    - [x] Cards for videos in that category
    - [x] Links back to all videos + other categories
  - Created: quarantime, math, projects, water, nature, songs, miscellaneous, archive

---

## 2) Experiments page (from `experiments.yml`)
### 2.1 Experiments landing page with formatted cards
- [x] Create `/experiments/index.html` with:
  - [x] Grid of experiment cards styled to match the homepage
  - [x] Card fields (use what exists in YAML; fall back gracefully):
    - [x] Title
    - [x] Time estimate / difficulty (if present)
    - [x] Supplies preview (short list)
    - [x] Concepts (short list)
    - [x] Image thumbnail (if present; can use `/images/...` without moving files)
    - [x] Link to worksheet/PDF/video if present

### 2.2 Filtering (if there are tags/categories)
- [x] Added filter pills for chemistry, physics, ecology categories
- [x] Created category pages at `/experiments/category/<slug>/`

### 2.3 Optional: individual experiment pages
- [ ] Skipped for now — experiments don't have step-by-step instructions in YAML

---

## 3) Printables page (from `printables.yml`)
### 3.1 Printables landing page with formatted cards
- [x] Create `/printables/index.html` with:
  - [x] Grid of printable cards styled to match homepage
  - [x] Each card includes:
    - [x] Title
    - [x] Type (foldable/booklet/worksheet)
    - [x] Thumbnail preview (wideimage or image)
    - [x] Link to Patreon

### 3.2 Filtering (if there are topics/types)
- [x] Add filter pills for foldable, booklet, worksheet categories
- [x] Created category pages at `/printables/category/<slug>/`

---

## 4) Free Resources hub page
### 4.1 Free Resources landing page
- [x] Create `/free/index.html` that acts as a hub and links to the pages created above.
- [x] Include a card grid with (at minimum):
  - [x] **Videos** → `/videos/` with icon and count
  - [x] **Experiments** → `/experiments/` with icon and count
  - [x] **Printables** → `/printables/` with icon and count

### 4.2 Optional: Featured sections
- [x] Add "Featured" row (3 items) pulling first item from each YAML file
- [x] Added CTA band linking to Teachable courses

---

## 5) Navigation + internal links
- [x] Add nav links (if not already):
  - [x] Free → `/free/`
  - [x] Videos → `/videos/`
  - [x] Experiments → `/experiments/`
  - [x] Printables (in footer) → `/printables/`
- [x] Updated footer with all resource links
- [ ] Add cross-links:
  - [ ] Each video card optionally links to related experiment/printable if IDs/tags overlap. (Skipped - no ID overlap in data)
  - [x] Free Resources hub links to all sections

---

## 6) Consistent styling and components
- [x] Create reusable includes:
  - [x] `_includes/card.html` (generic card wrapper)
  - [x] `_includes/pills.html` (category/tags pills)
  - [x] `_includes/page-header.html` (title + intro)
  - [ ] `_includes/empty-state.html` ("No items found…") — not needed yet
- [x] Ensure cards look consistent across all pages (spacing, hover, buttons).
- [x] Make responsive: 1-col mobile, 2-col tablet, 3-col desktop (via existing grid CSS).

---

## 7) QA checklist
- [x] `bundle exec jekyll serve` runs cleanly.
- [x] `/images/...` links still resolve; no renames/moves. (103 files intact)
- [x] All new pages load:
  - [x] `/videos/`
  - [x] `/videos/category/<slug>/` (8 categories)
  - [x] `/experiments/`
  - [x] `/experiments/category/<slug>/` (3 categories)
  - [x] `/printables/`
  - [x] `/printables/category/<slug>/` (3 categories)
  - [x] `/free/`
- [x] Category pages correctly filter.
- [x] Cards render gracefully when optional fields are missing.

---

## 8) Nice-to-have later (not required now)
- [ ] Add search on `/videos/`, `/experiments/`, `/printables/` (client-side, lightweight).
- [ ] Add an RSS feed for videos (optional).
- [ ] Add OpenGraph images + consistent metadata.
