/* AMORISSEA — store data.
   Replace PRODUCTS with real data; keep the same keys.
   All prices in AED. Sample = 2ml decant. */

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
  { id: 'oriental', ar: 'شرقي',  en: 'Oriental',  hue: '#9A5A3C', notes: { ar: 'عود، زعفران، هيل، عنبر', en: 'Oud, saffron, cardamom, amber' }, use: { ar: 'مناسبات وطقس بارد', en: 'Occasions, cold weather' } },
  { id: 'woody',    ar: 'خشبي',  en: 'Woody',     hue: '#6E5A45', notes: { ar: 'صندل، أرز، فيتيفر', en: 'Sandalwood, cedar, vetiver' }, use: { ar: 'مسائي وطوال العام', en: 'Evening, all year' } }
];

/* 14 filter families = the 9 above + 5 facets */
AM.FACETS = [
  { id: 'amber',   ar: 'عنبرية', en: 'Amber' },
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
    fraiche: { ar: 'أو فريش', en: 'Eau Fraîche', abbr: 'Fraîche' }
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

/* Brands = the house lines (replace with real brands if the store carries others) */
AM.BRANDS = [
  { id: 'signature', ar: 'أموريسيا سيغنتشر', en: 'Amorissea Signature' },
  { id: 'prive',     ar: 'أموريسيا بريفيه', en: 'Amorissea Privé' },
  { id: 'atelier',   ar: 'أتيليه العود', en: 'Oud Atelier' }
];

/* sizes: ml → price (AED). `was` = price before discount. */
AM.PRODUCTS = [
  {
    id: 'fig-leaf', brand: 'signature',
    name: { ar: 'ورق التين', en: 'Fig Leaf' },
    desc: { ar: 'خضرة ورقة التين بعد المطر مع شاي أخضر خفيف. عطر نهاري نظيف يناسب الدوام والحر.', en: 'Rain-wet fig leaves over a light green tea. A clean daytime scent for work and heat.' },
    family: 'green', facets: ['fresh'], conc: 'edt', gender: 'unisex',
    notes: { top: ['برغموت', 'ورق التين', 'عشب أخضر'], heart: ['شاي أخضر', 'ياسمين'], base: ['مسك أبيض', 'أرز'] },
    notesEn: { top: ['Bergamot', 'Fig leaf', 'Green grass'], heart: ['Green tea', 'Jasmine'], base: ['White musk', 'Cedar'] },
    longevity: 2, sillage: 1,
    season: ['summer', 'spring'], weather: ['hot', 'moderate'], time: ['morning'], occasion: ['daily', 'work'], place: ['indoor', 'outdoor'],
    sizes: { 30: 165, 50: 240, 100: 360 }, sample: 20,
    cats: ['new', 'best'], offers: ['summer'], badges: ['travel'], inStock: true
  },
  {
    id: 'noon-citrus', brand: 'signature',
    name: { ar: 'ليمون الظهيرة', en: 'Noon Citrus' },
    desc: { ar: 'انفجار حمضيات مع نعناع بارد ونيرولي. خفيف وسريع، للرياضة وأيام الصيف الطويلة.', en: 'A burst of citrus with cool mint and neroli. Light and quick, for sport and long summer days.' },
    family: 'citrus', facets: ['fresh'], conc: 'edc', gender: 'unisex',
    notes: { top: ['ليمون', 'جريب فروت', 'نعناع'], heart: ['نيرولي', 'زهر البرتقال'], base: ['فيتيفر', 'مسك'] },
    notesEn: { top: ['Lemon', 'Grapefruit', 'Mint'], heart: ['Neroli', 'Orange blossom'], base: ['Vetiver', 'Musk'] },
    longevity: 1, sillage: 2,
    season: ['summer'], weather: ['hot'], time: ['morning'], occasion: ['daily', 'sport'], place: ['outdoor'],
    sizes: { 50: 180, 100: 260 }, was: { 50: 225, 100: 325 }, sample: 15,
    cats: ['sale', 'best', 'new'], offers: ['summer'], badges: [], inStock: true
  },
  {
    id: 'desert-lavender', brand: 'signature',
    name: { ar: 'لافندر الصحراء', en: 'Desert Lavender' },
    desc: { ar: 'لافندر ومريمية على قاعدة تونكا دافئة. أنيق وهادئ للدوام والمساء المعتدل.', en: 'Lavender and sage on a warm tonka base. Calm and polished for work and mild evenings.' },
    family: 'aromatic', facets: [], conc: 'edp', gender: 'men',
    notes: { top: ['لافندر', 'مريمية', 'إكليل الجبل'], heart: ['جيرانيوم', 'لافندر'], base: ['تونكا', 'أرز'] },
    notesEn: { top: ['Lavender', 'Sage', 'Rosemary'], heart: ['Geranium', 'Lavender'], base: ['Tonka', 'Cedar'] },
    longevity: 2, sillage: 2,
    season: ['spring', 'autumn'], weather: ['moderate'], time: ['morning', 'evening'], occasion: ['work', 'daily'], place: ['indoor'],
    sizes: { 30: 190, 50: 280, 100: 420 }, sample: 20,
    cats: [], offers: ['annual'], badges: [], inStock: true
  },
  {
    id: 'sea-horizon', brand: 'signature',
    name: { ar: 'أفق البحر', en: 'Sea Horizon' },
    desc: { ar: 'ملح البحر ونسيم الشاطئ مع خشب الطفو. للبحر والأماكن المفتوحة في الحر.', en: 'Sea salt and shore breeze with driftwood. For the beach and the outdoors in the heat.' },
    family: 'aquatic', facets: ['fresh'], conc: 'edt', gender: 'men',
    notes: { top: ['ملح البحر', 'برغموت', 'شمام'], heart: ['ياسمين مائي', 'إكليل الجبل'], base: ['خشب الطفو', 'عنبر رمادي'] },
    notesEn: { top: ['Sea salt', 'Bergamot', 'Melon'], heart: ['Water jasmine', 'Rosemary'], base: ['Driftwood', 'Ambergris'] },
    longevity: 2, sillage: 2,
    season: ['summer'], weather: ['hot'], time: ['morning'], occasion: ['sea', 'sport', 'daily'], place: ['outdoor'],
    sizes: { 50: 230, 100: 340 }, sample: 18,
    cats: ['best', 'new'], offers: ['summer', 'national'], badges: ['travel'], inStock: true
  },
  {
    id: 'golden-apple', brand: 'signature',
    name: { ar: 'تفاح الذهب', en: 'Golden Apple' },
    desc: { ar: 'تفاح مقرمش وكمثرى فوق ورد وفانيليا ناعمة. مرح ونهاري للاستخدام اليومي.', en: 'Crisp apple and pear over rose and soft vanilla. Playful and bright for every day.' },
    family: 'fruity', facets: ['musky'], conc: 'edp', gender: 'women',
    notes: { top: ['تفاح', 'كمثرى', 'ليمون'], heart: ['ورد', 'فريزيا'], base: ['فانيليا', 'مسك'] },
    notesEn: { top: ['Apple', 'Pear', 'Lemon'], heart: ['Rose', 'Freesia'], base: ['Vanilla', 'Musk'] },
    longevity: 2, sillage: 2,
    season: ['spring', 'summer'], weather: ['moderate', 'hot'], time: ['morning'], occasion: ['daily'], place: ['indoor', 'outdoor'],
    sizes: { 30: 150, 50: 220, 100: 330 }, sample: 18,
    cats: ['new'], offers: ['eid'], badges: [], inStock: true
  },
  {
    id: 'taif-rose', brand: 'prive',
    name: { ar: 'ورد الطائف', en: 'Taif Rose' },
    desc: { ar: 'ورد طائفي مع فلفل وردي وباتشولي. زهري عميق للمناسبات والمساء.', en: 'Taif rose with pink pepper and patchouli. A deep floral for occasions and evenings.' },
    family: 'floral', facets: ['spicy'], conc: 'edp', gender: 'women',
    notes: { top: ['فلفل وردي', 'برغموت'], heart: ['ورد طائفي', 'ياسمين'], base: ['مسك', 'باتشولي'] },
    notesEn: { top: ['Pink pepper', 'Bergamot'], heart: ['Taif rose', 'Jasmine'], base: ['Musk', 'Patchouli'] },
    longevity: 3, sillage: 2,
    season: ['spring', 'autumn', 'winter'], weather: ['moderate', 'cold'], time: ['evening'], occasion: ['events'], place: ['indoor'],
    sizes: { 50: 390, 100: 560 }, sample: 30,
    cats: ['best', 'new'], offers: ['eid', 'ramadan', 'annual'], badges: ['gift'], inStock: true
  },
  {
    id: 'night-jasmine', brand: 'prive',
    name: { ar: 'ياسمين الليل', en: 'Night Jasmine' },
    desc: { ar: 'ياسمين سمبك ومسك الروم على عنبر وفانيليا. ساحر ومسائي، يدوم طويلًا.', en: 'Sambac jasmine and tuberose on amber and vanilla. Bewitching, made for the night, lasts long.' },
    family: 'floral', facets: ['amber'], conc: 'parfum', gender: 'women',
    notes: { top: ['زهر البرتقال', 'ماندرين'], heart: ['ياسمين سمبك', 'مسك الروم'], base: ['عنبر', 'فانيليا'] },
    notesEn: { top: ['Orange blossom', 'Mandarin'], heart: ['Sambac jasmine', 'Tuberose'], base: ['Amber', 'Vanilla'] },
    longevity: 3, sillage: 3,
    season: ['autumn', 'winter'], weather: ['moderate', 'cold'], time: ['evening'], occasion: ['events'], place: ['indoor'],
    sizes: { 50: 480, 100: 690 }, was: { 50: 560, 100: 790 }, sample: 35,
    cats: ['sale'], offers: ['winter', 'ramadan'], badges: ['limited'], inStock: true
  },
  {
    id: 'amber-caramel', brand: 'prive',
    name: { ar: 'كراميل وعنبر', en: 'Amber Caramel' },
    desc: { ar: 'كراميل محروق وقرفة على فانيليا وتونكا. حلو ودافئ لليالي الشتاء.', en: 'Burnt caramel and cinnamon on vanilla and tonka. Sweet and warm for winter nights.' },
    family: 'gourmand', facets: ['amber', 'spicy'], conc: 'edp', gender: 'unisex',
    notes: { top: ['هيل', 'برغموت'], heart: ['كراميل', 'قرفة'], base: ['فانيليا', 'تونكا', 'عنبر'] },
    notesEn: { top: ['Cardamom', 'Bergamot'], heart: ['Caramel', 'Cinnamon'], base: ['Vanilla', 'Tonka', 'Amber'] },
    longevity: 3, sillage: 2,
    season: ['winter', 'autumn'], weather: ['cold'], time: ['evening'], occasion: ['events', 'daily'], place: ['indoor'],
    sizes: { 30: 210, 50: 310, 100: 450 }, sample: 22,
    cats: ['new', 'best'], offers: ['winter'], badges: [], inStock: true
  },
  {
    id: 'cardamom-nights', brand: 'atelier',
    name: { ar: 'ليالي الهيل', en: 'Cardamom Nights' },
    desc: { ar: 'هيل وزعفران فوق ورد وقرفة، وقاعدة عود وعنبر. شرقي فاخر للمجالس والمناسبات.', en: 'Cardamom and saffron over rose and cinnamon, on oud and amber. A rich oriental for gatherings.' },
    family: 'oriental', facets: ['spicy', 'amber'], conc: 'extrait', gender: 'unisex',
    notes: { top: ['هيل', 'زعفران'], heart: ['ورد', 'قرفة'], base: ['عود', 'عنبر', 'مسك'] },
    notesEn: { top: ['Cardamom', 'Saffron'], heart: ['Rose', 'Cinnamon'], base: ['Oud', 'Amber', 'Musk'] },
    longevity: 3, sillage: 3,
    season: ['winter', 'autumn'], weather: ['cold', 'moderate'], time: ['evening'], occasion: ['events'], place: ['indoor'],
    sizes: { 50: 620, 100: 890 }, sample: 40,
    cats: ['best'], offers: ['ramadan', 'eid', 'annual'], badges: ['gift'], inStock: true
  },
  {
    id: 'sandal-smoke', brand: 'atelier',
    name: { ar: 'صندل ودخان', en: 'Sandalwood Smoke' },
    desc: { ar: 'صندل كريمي وأرز مع لمسة جلد ودخان. خشبي هادئ للمساء والدوام في الشتاء.', en: 'Creamy sandalwood and cedar with a touch of leather and smoke. A quiet woody for evenings and winter work.' },
    family: 'woody', facets: ['leather'], conc: 'edp', gender: 'men',
    notes: { top: ['فلفل أسود', 'برغموت'], heart: ['سوسن', 'جلد'], base: ['صندل', 'أرز', 'فيتيفر'] },
    notesEn: { top: ['Black pepper', 'Bergamot'], heart: ['Iris', 'Leather'], base: ['Sandalwood', 'Cedar', 'Vetiver'] },
    longevity: 3, sillage: 2,
    season: ['autumn', 'winter', 'all'], weather: ['moderate', 'cold'], time: ['evening'], occasion: ['work', 'events'], place: ['indoor'],
    sizes: { 50: 340, 100: 490 }, sample: 25,
    cats: [], offers: ['winter', 'national'], badges: [], inStock: false
  },
  {
    id: 'oud-athar', brand: 'atelier',
    name: { ar: 'عود الأثر', en: 'Oud Athar' },
    desc: { ar: 'توقيع الدار: زعفران وتوت على عود وجلد وعنبر. أثر يبقى بعد مغادرتك المكان.', en: 'The house signature: saffron and berries on oud, leather and amber. A trail that stays after you leave.' },
    family: 'oriental', facets: ['leather', 'amber'], conc: 'extrait', gender: 'unisex',
    notes: { top: ['زعفران', 'توت'], heart: ['ورد', 'باتشولي'], base: ['عود', 'جلد', 'عنبر'] },
    notesEn: { top: ['Saffron', 'Berries'], heart: ['Rose', 'Patchouli'], base: ['Oud', 'Leather', 'Amber'] },
    longevity: 3, sillage: 3,
    season: ['winter', 'autumn'], weather: ['cold'], time: ['evening'], occasion: ['events'], place: ['indoor'],
    sizes: { 50: 780, 100: 950 }, sample: 45,
    cats: ['new', 'best'], offers: ['national', 'annual'], badges: ['limited', 'gift'], inStock: true
  },
  {
    id: 'morning-musk', brand: 'signature',
    name: { ar: 'مسك الصباح', en: 'Morning Musk' },
    desc: { ar: 'مسك أبيض وزهر القطن مع سوسن ناعم. رائحة النظافة الهادئة، تناسب كل الأوقات.', en: 'White musk and cotton flower with soft iris. The quiet scent of clean skin, for any time.' },
    family: 'floral', facets: ['musky'], conc: 'edp', gender: 'unisex',
    notes: { top: ['كمثرى', 'برغموت'], heart: ['سوسن', 'زهر القطن'], base: ['مسك أبيض', 'عنبر'] },
    notesEn: { top: ['Pear', 'Bergamot'], heart: ['Iris', 'Cotton flower'], base: ['White musk', 'Amber'] },
    longevity: 2, sillage: 1,
    season: ['all'], weather: ['hot', 'moderate', 'cold'], time: ['morning', 'evening'], occasion: ['daily', 'work'], place: ['indoor', 'outdoor'],
    sizes: { 30: 140, 50: 200, 100: 300 }, sample: 15,
    cats: ['best', 'new'], offers: ['annual'], badges: ['travel'], inStock: true
  }
];

/* Annual set: 4 uses × 3 tiers → product id */
AM.ANNUAL = {
  uses: [
    { id: 'daily',  ar: 'يومي', en: 'Daily' },
    { id: 'events', ar: 'مناسبات', en: 'Occasions' },
    { id: 'summer', ar: 'صيفي', en: 'Summer' },
    { id: 'winter', ar: 'شتوي', en: 'Winter' }
  ],
  tiers: [
    { id: 'high', ar: 'غالي', en: 'Premium' },
    { id: 'mid',  ar: 'متوسط', en: 'Mid' },
    { id: 'low',  ar: 'اقتصادي', en: 'Essential' }
  ],
  grid: {
    daily:  { high: 'desert-lavender', mid: 'golden-apple', low: 'morning-musk' },
    events: { high: 'oud-athar', mid: 'taif-rose', low: 'amber-caramel' },
    summer: { high: 'sea-horizon', mid: 'fig-leaf', low: 'noon-citrus' },
    winter: { high: 'cardamom-nights', mid: 'sandal-smoke', low: 'amber-caramel' }
  }
};

/* "Your style" → suggestion */
AM.STYLES = [
  { id: 'classic', ar: 'كلاسيكي هادئ', en: 'Quiet classic', pick: 'desert-lavender' },
  { id: 'bold',    ar: 'جريء ولافت', en: 'Bold', pick: 'oud-athar' },
  { id: 'soft',    ar: 'ناعم ونظيف', en: 'Soft & clean', pick: 'morning-musk' },
  { id: 'sport',   ar: 'رياضي ونشيط', en: 'Active', pick: 'noon-citrus' },
  { id: 'romantic',ar: 'رومانسي', en: 'Romantic', pick: 'night-jasmine' }
];

/* Compose: sample pairings shown as examples */
AM.PAIRINGS = [
  { a: 'taif-rose', b: 'oud-athar', ar: 'ورد على عود — شرقي زهري للمناسبات', en: 'Rose over oud — a floral oriental for occasions' },
  { a: 'fig-leaf', b: 'morning-musk', ar: 'خضرة ناعمة بأثر مسكي نظيف', en: 'Soft greens with a clean musky trail' },
  { a: 'noon-citrus', b: 'sandal-smoke', ar: 'حمضيات مشرقة فوق خشب دافئ', en: 'Bright citrus over warm woods' }
];

/* SKU shown on the product page (replace with real SKUs) */
AM.PRODUCTS.forEach((p, i) => { p.sku = p.sku || `AMR-${1001 + i}`; });

/* Product display settings — the merchant-adjustable part (a theme setting in Salla).
   cols/count per device, card type, and which parts the card shows. */
AM.DISPLAY = {
  desktop: { cols: 4, count: 8 },
  mobile:  { cols: 2, count: 6 },
  card: 'normal',            // 'normal' | 'wide'
  fields: { brand: false, name: true, conc: true, tags: true, usage: true, performance: true, price: true, buttons: true }
};
