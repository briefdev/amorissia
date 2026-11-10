/* AMORISSEA — store settings: families, labels, display.
   The catalogue itself (products, brands, pairings) lives in catalog.js, generated from the
   real store by tools/import_real.py. All prices in AED. */

window.AM = window.AM || {};

/* 9 main families (explorer), ordered lightest → heaviest.
   `hue` tints the placeholder image and the family dot. */
AM.FAMILIES = [
  { id: 'green',    ar: 'أخضر',  en: 'Green',     hue: '#7E9C6B', notes: { ar: 'أوراق، عشب، شاي أخضر', en: 'Leaves, grass, green tea' }, use: { ar: 'نهار حار ودوام', en: 'Hot days, work' } },
  { id: 'citrus',   ar: 'حمضي',  en: 'Citrus',    hue: '#C9B44E', notes: { ar: 'ليمون، برغموت، جريب فروت', en: 'Lemon, bergamot, grapefruit' }, use: { ar: 'صيف ورياضة', en: 'Summer, sport' } },
  { id: 'aromatic', ar: 'أروماتي', en: 'Aromatic', hue: '#8C93B5', notes: { ar: 'لافندر، مريمية، إكليل الجبل', en: 'Lavender, sage, rosemary' }, use: { ar: 'دوام وطقس معتدل', en: 'Work, mild weather' } },
  { id: 'aquatic',  ar: 'مائي',  en: 'Aquatic',   hue: '#5F93A8', notes: { ar: 'ملح البحر، نسيم، خشب الطفو', en: 'Sea salt, breeze, driftwood' }, use: { ar: 'البحر والأماكن المفتوحة', en: 'Beach, outdoors' } },
  { id: 'fruity',   ar: 'فاكهي', en: 'Fruity',    hue: '#C27B5C', notes: { ar: 'تفاح، كمثرى، توت', en: 'Apple, pear, berries' }, use: { ar: 'يومي ونهاري', en: 'Daily, daytime' } },
  { id: 'floral',   ar: 'زهري',  en: 'Floral',    hue: '#B9798E', notes: { ar: 'ورد، ياسمين، سوسن', en: 'Rose, jasmine, iris' }, use: { ar: 'مناسبات ومسائي', en: 'Occasions, evening' } },
  { id: 'gourmand', ar: 'جورماند (حلو)', en: 'Gourmand', hue: '#A7764A', notes: { ar: 'فانيليا، كراميل، تونكا', en: 'Vanilla, caramel, tonka' }, use: { ar: 'شتاء وسهرات', en: 'Winter, nights out' } },
  { id: 'oriental', ar: 'عنبري',  en: 'Amber',  hue: '#9A5A3C', notes: { ar: 'عود، زعفران، هيل، عنبر', en: 'Oud, saffron, cardamom, amber' }, use: { ar: 'مناسبات وطقس بارد', en: 'Occasions, cold weather' } },
  { id: 'woody',    ar: 'خشبي',  en: 'Woody',     hue: '#6E5A45', notes: { ar: 'صندل، أرز، فيتيفر', en: 'Sandalwood, cedar, vetiver' }, use: { ar: 'مسائي وطوال العام', en: 'Evening, all year' } }
];

/* extra filter families (facets) on top of the 9 above */
AM.FACETS = [
  { id: 'musky',   ar: 'مسكية', en: 'Musky' },
  { id: 'leather', ar: 'جلدية', en: 'Leather' },
  { id: 'spicy',   ar: 'توابلية', en: 'Spicy' },
  { id: 'fresh',   ar: 'منعشة', en: 'Fresh' }
];

AM.LABELS = {
  conc: {
    extrait: { ar: 'إكستريت دو بارفان', en: 'Extrait de Parfum', abbr: 'Extrait' },
    parfum:  { ar: 'بارفان', en: 'Parfum', abbr: 'Parfum' },
    edp:     { ar: 'أو دو بارفان', en: 'Eau de Parfum', abbr: 'EDP' },
    edt:     { ar: 'أو دو تواليت', en: 'Eau de Toilette', abbr: 'EDT' },
    edc:     { ar: 'أو دو كولون', en: 'Eau de Cologne', abbr: 'EDC' },
    fraiche: { ar: 'أو فريش', en: 'Eau Fraîche', abbr: 'Fraîche' },
    absolu:  { ar: 'أبسولو', en: 'Absolu', abbr: 'Absolu' },
    elixir:  { ar: 'إليكسير', en: 'Elixir', abbr: 'Elixir' },
    body:    { ar: 'بخاخ للجسم', en: 'Body Spray', abbr: 'Body' }
  },
  gender: { men: { ar: 'ذكر', en: 'Male' }, women: { ar: 'أنثى', en: 'Female' }, unisex: { ar: 'للجنسين', en: 'Unisex' } },
  cat: {
    all:         { ar: 'جميع العطور', en: 'All fragrances' },
    new:         { ar: 'وصل حديثًا', en: 'New in' },
    best:        { ar: 'الأكثر مبيعًا', en: 'Best sellers' },
    sale:        { ar: 'التخفيضات', en: 'Sale' },
    collections: { ar: 'المجموعات والهدايا', en: 'Sets & gifts' }
  },
  offers: {
    winter:   { ar: 'الشتاء', en: 'Winter' },
    summer:   { ar: 'الصيف', en: 'Summer' },
    ramadan:  { ar: 'رمضان', en: 'Ramadan' },
    eid:      { ar: 'العيد', en: 'Eid' },
    national: { ar: 'اليوم الوطني', en: 'National Day' },
    annual:   { ar: 'المجموعة السنوية', en: 'Annual set' }
  },
  badges: {
    travel:  { ar: 'حجم سفر', en: 'Travel size' },
    gift:    { ar: 'مجموعة هدايا', en: 'Gift set' },
    limited: { ar: 'إصدار محدود', en: 'Limited edition' }
  },
  season:  { summer: { ar: 'صيفي', en: 'Summer' }, winter: { ar: 'شتوي', en: 'Winter' }, spring: { ar: 'ربيعي', en: 'Spring' }, autumn: { ar: 'خريفي', en: 'Autumn' }, all: { ar: 'كل الفصول', en: 'All seasons' } },
  weather: { hot: { ar: 'حار', en: 'Hot' }, moderate: { ar: 'معتدل', en: 'Mild' }, cold: { ar: 'بارد', en: 'Cold' } },
  time:    { morning: { ar: 'صباحي', en: 'Day' }, evening: { ar: 'مسائي', en: 'Evening' }, all: { ar: 'جميع الأوقات', en: 'Any time' } },
  occasion:{ daily: { ar: 'يومي', en: 'Daily' }, work: { ar: 'العمل', en: 'Work' }, events: { ar: 'المناسبات والأعياد', en: 'Occasions' }, sea: { ar: 'البحر', en: 'Beach' }, sport: { ar: 'النادي والرياضة', en: 'Gym & sport' } },
  place:   { indoor: { ar: 'أماكن مغلقة ومكيّفة', en: 'Indoors, air-conditioned' }, outdoor: { ar: 'أماكن مفتوحة في أجواء حارة', en: 'Outdoors, hot weather' } },
  use:     { daily: { ar: 'يومي', en: 'Daily' }, evening: { ar: 'مسائي', en: 'Evening' }, events: { ar: 'مناسبات', en: 'Occasions' } },
  level:   { 1: { ar: 'عادي', en: 'Soft' }, 2: { ar: 'متوسط', en: 'Moderate' }, 3: { ar: 'قوي', en: 'Strong' } }
};

/* Product display settings — the merchant-adjustable part (a theme setting in Salla).
   cols/count per device, card type, and which parts the card shows. */
AM.DISPLAY = {
  desktop: { cols: 4, count: 8 },
  mobile:  { cols: 2, count: 6 },
  card: 'normal',            // 'normal' | 'wide'
  fields: { brand: false, name: true, conc: true, tags: true, usage: true, performance: true, price: true, buttons: true }
};
