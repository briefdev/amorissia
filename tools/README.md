# Page generator

Header, footer, cart drawer and quick-view are shared across all pages.
Edit `build.py` (partials) or `pages/*.html` (page bodies), then run:

    python3 tools/build.py site

Body templates use `[[عربي|English]]` markers; `{R}` is the asset root.
Arabic pages go to `site/`, English pages to `site/en/`.
