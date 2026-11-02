#!/usr/bin/env python3
"""Assemble static pages (ar at site/, en at site/en/) from shared partials.
Body templates use [[arabic|english]] markers and {R} for the asset root."""
import re, sys, pathlib

SITE = pathlib.Path(sys.argv[1])
PAGES = pathlib.Path(__file__).parent / "pages"

FONTS = ("https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700"
         "&family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500"
         "&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap")

SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-drop" viewBox="0 0 24 32"><path d="M12 0c1 6 10 12 10 21 0 6-5 9-10 11C7 30 2 27 2 21 2 12 11 6 12 0z"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/></symbol>
<symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8.5h14l-1.1 11.5H6.1L5 8.5z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.2"/><path d="M20 20l-4.4-4.4"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M6 12h12"/></symbol>
<symbol id="i-compare" viewBox="0 0 24 24"><path d="M4 8h14l-3-3M20 16H6l3 3"/></symbol>
<symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z"/></symbol>
<symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z"/><path d="M5 19l7-7"/></symbol>
<symbol id="i-snow" viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></symbol>
<symbol id="i-wind" viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/></symbol>
</svg>"""

NAV = [("shop.html", "[[التسوق|Shop]]"), ("index.html#explorer", "[[مستكشف العطور|Scent explorer]]"),
       ("index.html#compose", "[[ركّب عطرك|Layer your scent]]"), ("index.html#annual", "[[الباقة السنوية|The annual four]]"),
       ("compare.html", "[[المقارنة|Compare]]")]

def head(lang, page, meta, root):
    other = ("en/" if lang == "ar" else "../") + page
    ar_url = ("" if lang == "ar" else "../") + page
    en_url = ("en/" if lang == "ar" else "") + page
    cur = ' aria-current="page"'
    nav = "".join(f'<a href="{h}"{cur if h == page else ""}>{t}</a>' for h, t in NAV)
    mnav = "".join(f'<a href="{h}">{t} <svg class="drop drop--line" viewBox="0 0 24 32"><use href="#i-drop"/></svg></a>' for h, t in NAV)
    return f"""<!doctype html>
<html lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}" data-theme="evening" data-root="{root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta['title']}</title>
<meta name="description" content="{meta['desc']}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AMORISSEA">
<meta property="og:title" content="{meta['title']}">
<meta property="og:description" content="{meta['desc']}">
<meta property="og:image" content="{root}assets/img/logo-full.png">
<meta property="og:locale" content="{'ar_AE' if lang == 'ar' else 'en_AE'}">
<!-- hreflang: replace with absolute URLs once the domain is set -->
<link rel="alternate" hreflang="ar" href="{ar_url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="alternate" hreflang="x-default" href="{ar_url}">
<link rel="icon" type="image/png" href="{root}assets/img/favicon.png">
<link rel="apple-touch-icon" href="{root}assets/img/apple-touch-icon.png">
<meta name="theme-color" content="#0D1427">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="{root}css/style.css">
<script>try{{var t=localStorage.getItem('am_theme');if(t)document.documentElement.dataset.theme=JSON.parse(t)}}catch(e){{}}</script>
</head>
<body>
{SPRITE}
<a class="skip" href="#main">[[تخطَّ إلى المحتوى|Skip to content]]</a>
<header class="site-header">
  <div class="wrap">
    <button class="icon-btn menu-btn" type="button" data-open="menu" aria-label="[[القائمة|Menu]]"><svg class="ico" aria-hidden="true"><use href="#i-menu"/></svg></button>
    <a class="brand" href="index.html" aria-label="AMORISSEA — [[الرئيسية|Home]]"><img src="{root}assets/img/logo-h.webp" alt="AMORISSEA أموريسيا" width="145" height="40"></a>
    <nav class="nav" aria-label="[[القائمة الرئيسية|Main]]">{nav}</nav>
    <div class="tools">
      <button class="theme-btn" type="button" aria-label="[[تبديل الوضع صباحي/مسائي|Toggle morning/evening mode]]"></button>
      <a class="lang-link" href="{other}" hreflang="{'en' if lang == 'ar' else 'ar'}" lang="{'en' if lang == 'ar' else 'ar'}">[[EN|عربي]]</a>
      <a class="icon-btn" href="shop.html?focus=search" aria-label="[[بحث|Search]]"><svg class="ico" aria-hidden="true"><use href="#i-search"/></svg></a>
      <a class="icon-btn" href="shop.html?fav=1" aria-label="[[المفضلة|Favourites]]"><svg class="ico" aria-hidden="true"><use href="#i-heart"/></svg><span class="count" data-count="fav"></span></a>
      <button class="icon-btn" type="button" data-open="cart" aria-label="[[السلة|Bag]]"><svg class="ico" aria-hidden="true"><use href="#i-bag"/></svg><span class="count" data-count="cart"></span></button>
    </div>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true">
  <div class="menu__scrim"></div>
  <div class="menu__panel" role="dialog" aria-modal="true" aria-label="[[القائمة|Menu]]">
    <div class="menu__row" style="justify-content:space-between"><img src="{root}assets/img/logo-h.webp" alt="" width="116" height="32"><button class="icon-btn" type="button" data-close aria-label="[[إغلاق|Close]]"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button></div>
    <nav aria-label="[[القائمة الرئيسية|Main]]"><a href="index.html">[[الرئيسية|Home]] <svg class="drop" viewBox="0 0 24 32"><use href="#i-drop"/></svg></a>{mnav}</nav>
    <div class="menu__row"><button class="theme-btn" type="button"></button><a class="lang-link" href="{other}">[[English|عربي]]</a></div>
  </div>
</div>
"""

def foot(lang, root, script):
    year = "2026"
    return f"""
<footer class="site-footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="stack">
        <img class="footer__logo" src="{root}assets/img/logo-full.webp" alt="AMORISSEA أموريسيا — [[عطور تترك أثرًا|Scents that leave a mark]]" width="900" height="288" loading="lazy">
      </div>
      <div class="footer__cols">
        <div><h3>[[تسوّق|Shop]]</h3>
          <a href="shop.html">[[جميع العطور|All fragrances]]</a><a href="shop.html?cat=new">[[وصل حديثًا|New in]]</a><a href="shop.html?cat=best">[[الأكثر مبيعًا|Best sellers]]</a><a href="shop.html?cat=sale">[[التخفيضات|Sale]]</a><a href="shop.html?cat=collections">[[المجموعات والهدايا|Sets &amp; gifts]]</a></div>
        <div><h3>[[أدوات الاختيار|Finders]]</h3>
          <a href="index.html#explorer">[[مستكشف العطور|Scent explorer]]</a><a href="index.html#compose">[[ركّب عطرك|Layer your scent]]</a><a href="index.html#annual">[[الباقة السنوية|The annual four]]</a><a href="compare.html">[[مقارنة العطور|Compare]]</a></div>
        <div><h3>[[المساعدة|Help]]</h3>
          <a href="#">[[الشحن والتوصيل|Shipping]]</a><a href="#">[[الاستبدال والاسترجاع|Returns]]</a><a href="#">[[تواصل معنا|Contact]]</a></div>
      </div>
      <form class="newsletter">
        <label for="nl-email">[[أثرٌ في بريدك|A trace in your inbox]]</label>
        <p class="muted" style="font-size:.92rem">[[إصدارات جديدة وعروض المواسم، بدون إزعاج.|New releases and seasonal offers, no noise.]]</p>
        <div class="field-row"><input id="nl-email" type="email" required placeholder="[[بريدك الإلكتروني|Your email]]" autocomplete="email"><button class="btn btn--gold" type="submit">[[اشترك|Subscribe]]</button></div>
      </form>
    </div>
    <div class="footer__bottom">
      <span>© {year} AMORISSEA · [[أموريسيا|Amorissea]]</span>
      <span><a href="#">Instagram</a> · <a href="#">TikTok</a> · <a href="#">Snapchat</a> · <a href="#">X</a> <span class="muted">([[روابط مؤقتة|placeholder links]])</span></span>
    </div>
  </div>
</footer>

<div class="drawer" id="cart" aria-hidden="true">
  <div class="drawer__scrim"></div>
  <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <div class="drawer__head"><h2 id="cart-title">[[السلة|Your bag]]</h2><button class="icon-btn" type="button" data-close aria-label="[[إغلاق|Close]]"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button></div>
    <div class="drawer__body" id="cart-body"></div>
    <div class="drawer__foot" id="cart-foot" hidden>
      <p class="ship-note" id="ship-note"></p><div class="ship-bar" id="ship-bar"><i></i></div>
      <div class="sum-row"><span>[[المجموع الفرعي|Subtotal]]</span><span id="cart-sub" class="lat"></span></div>
      <div class="sum-row"><span>[[الشحن|Shipping]]</span><span id="cart-ship"></span></div>
      <div class="sum-row sum-row--total"><span>[[الإجمالي|Total]]</span><span id="cart-total" class="lat"></span></div>
      <button class="btn btn--gold btn--block" id="checkout" type="button">[[إتمام الطلب|Checkout]]</button>
      <p class="placeholder-note">[[زر مؤقت — يُربط ببوابة الدفع عند النقل للمنصة|Placeholder — connects to payment once moved to a platform]]</p>
    </div>
  </aside>
</div>

<dialog class="qv" id="qv" aria-label="[[عرض سريع|Quick view]]">
  <div class="qv__inner"><div class="qv__media" id="qv-media"></div><div class="qv__body" id="qv-body"></div></div>
  <button class="icon-btn qv__close" type="button" data-close-qv aria-label="[[إغلاق|Close]]"><svg class="ico" aria-hidden="true"><use href="#i-close"/></svg></button>
</dialog>

<script src="{root}js/products.js" defer></script>
<script src="{root}js/main.js" defer></script>
{''.join(f'<script src="{root}js/{x.strip()}" defer></script>' for x in script.split(',') if x.strip())}
</body>
</html>
"""

def pick(text, lang):
    i = 0 if lang == "ar" else 1
    return re.sub(r"\[\[(.*?)\|(.*?)\]\]", lambda m: m.group(1 + i), text, flags=re.S)

def build():
    for tpl in sorted(PAGES.glob("*.html")):
        src = tpl.read_text(encoding="utf-8")
        meta_block, body = src.split("\n---\n", 1)
        meta = dict(l.split(": ", 1) for l in meta_block.strip().splitlines())
        for lang, root, out in (("ar", "", SITE / tpl.name), ("en", "../", SITE / "en" / tpl.name)):
            m = {"title": pick(meta["title"], lang), "desc": pick(meta["desc"], lang)}
            html = head(lang, tpl.name, m, root) + body.replace("{R}", root) + foot(lang, root, meta.get("script", "").strip())
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(pick(html, lang), encoding="utf-8")
            print("wrote", out.relative_to(SITE))

build()
