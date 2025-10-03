import type {
  SiddurApplicability,
  SiddurBucketEntry,
  SiddurCategoryEntry,
  SiddurImportance,
  SiddurItemEntry,
  SiddurMetadata,
  SiddurServiceEntry,
  SiddurTradition
} from "@/types/siddur";

const ALL_TRADITIONS: SiddurTradition[] = ["ashkenaz", "sefard", "edot_hamizrach"];

const baseApplicability = (overrides: Partial<SiddurApplicability> = {}): SiddurApplicability => ({
  shabbat: null,
  roshChodesh: null,
  omer: null,
  motzaeiShabbat: null,
  holidays: [],
  fastDays: [],
  weekdays: [],
  diasporaOrIsrael: "both",
  requiresMinyan: false,
  mournerOnly: false,
  kaddishType: null,
  amidahSection: null,
  pesukeiSection: null,
  torahReadingContext: null,
  ...overrides
});

const category = (definition: {
  id: string;
  title: string;
  description: string;
  order: number;
  importance?: SiddurImportance;
  nusach?: SiddurTradition[];
  applicability?: Partial<SiddurApplicability>;
  notes?: string;
}): SiddurCategoryEntry => ({
  type: "category",
  id: definition.id,
  title: definition.title,
  description: definition.description,
  outline: [],
  order: definition.order,
  importance: definition.importance ?? "core",
  nusach: definition.nusach ?? ALL_TRADITIONS,
  applicability: baseApplicability(definition.applicability ?? {}),
  notes: definition.notes,
  status: "placeholder",
  he: {},
  en: {}
});

const service = (definition: {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  order: number;
  importance?: SiddurImportance;
  nusach?: SiddurTradition[];
  applicability?: Partial<SiddurApplicability>;
  notes?: string;
}): SiddurServiceEntry => ({
  type: "service",
  id: definition.id,
  title: definition.title,
  description: definition.description,
  outline: [],
  categoryId: definition.categoryId,
  categoryName: definition.categoryName,
  order: definition.order,
  importance: definition.importance ?? "core",
  nusach: definition.nusach ?? ALL_TRADITIONS,
  applicability: baseApplicability(definition.applicability ?? {}),
  notes: definition.notes,
  status: "placeholder",
  he: {},
  en: {}
});

const bucketEntry = (definition: {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  order: number;
  importance?: SiddurImportance;
  nusach?: SiddurTradition[];
  applicability?: Partial<SiddurApplicability>;
  notes?: string;
}): SiddurBucketEntry => ({
  type: "bucket",
  id: definition.id,
  title: definition.title,
  description: definition.description,
  outline: [],
  categoryId: definition.categoryId,
  categoryName: definition.categoryName,
  serviceId: definition.serviceId,
  serviceName: definition.serviceName,
  order: definition.order,
  importance: definition.importance ?? "core",
  nusach: definition.nusach ?? ALL_TRADITIONS,
  applicability: baseApplicability(definition.applicability ?? {}),
  notes: definition.notes,
  status: "placeholder",
  he: {},
  en: {}
});

const itemEntry = (definition: {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  bucketId: string;
  bucketName: string;
  order: number;
  outline?: string[];
  importance?: SiddurImportance;
  nusach?: SiddurTradition[];
  applicability?: Partial<SiddurApplicability>;
  notes?: string;
  tags?: string[];
}): SiddurItemEntry => ({
  type: "item",
  id: definition.id,
  title: definition.title,
  description: definition.description,
  outline: definition.outline,
  categoryId: definition.categoryId,
  categoryName: definition.categoryName,
  serviceId: definition.serviceId,
  serviceName: definition.serviceName,
  bucketId: definition.bucketId,
  bucketName: definition.bucketName,
  order: definition.order,
  importance: definition.importance ?? "core",
  nusach: definition.nusach ?? ALL_TRADITIONS,
  applicability: baseApplicability(definition.applicability ?? {}),
  notes: definition.notes,
  tags: definition.tags,
  status: "placeholder",
  he: {},
  en: {}
});

interface BucketDefinition {
  id: string;
  title: string;
  description: string;
  serviceId: string;
  order: number;
  importance?: SiddurImportance;
  nusach?: SiddurTradition[];
  applicability?: Partial<SiddurApplicability>;
  notes?: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    outline?: string[];
    importance?: SiddurImportance;
    nusach?: SiddurTradition[];
    applicability?: Partial<SiddurApplicability>;
    notes?: string;
    tags?: string[];
  }>;
}

const categories: SiddurCategoryEntry[] = [
  category({
    id: "daily",
    title: "Daily",
    description: "Weekday services and shared daily additions.",
    order: 1
  }),
  category({
    id: "shabbat",
    title: "Shabbat",
    description: "Welcoming, praying, and departing Shabbat.",
    order: 2,
    applicability: { shabbat: true }
  }),
  category({
    id: "rosh_chodesh",
    title: "Rosh Chodesh",
    description: "New month services with Hallel and Musaf.",
    order: 3,
    applicability: { roshChodesh: true }
  }),
  category({
    id: "festivals_high_holidays",
    title: "Festivals & High Holidays",
    description: "Major festivals, Yamim Nora'im, and their unique prayers.",
    order: 4
  }),
  category({
    id: "fast_days",
    title: "Fast Days",
    description: "The six communal fasts and their liturgy.",
    order: 5
  }),
  category({
    id: "synagogue_flow",
    title: "Synagogue Service Flow",
    description: "Torah service flow, aliyot, and kaddish quick references.",
    order: 6
  }),
  category({
    id: "practice_specific",
    title: "Practice-Specific Blessings",
    description: "Daily routines, seasonal practices, and experiential brachot.",
    order: 7
  }),
  category({
    id: "meals",
    title: "Meals & Food Blessings",
    description: "Blessings before and after eating with meal rituals.",
    order: 8
  }),
  category({
    id: "bedtime_personal",
    title: "Bedtime & Personal",
    description: "Bedtime Shema, personal reflection, and travel prayers.",
    order: 9
  }),
  category({
    id: "life_cycle",
    title: "Life-Cycle & Special Occasions",
    description: "From birth and naming to mourning and milestones.",
    order: 10
  }),
  category({
    id: "seasonal_inserts",
    title: "Additions & Seasonal Inserts",
    description: "Reminders for text inserts and calendar-sensitive changes.",
    order: 11
  })
];

const services: SiddurServiceEntry[] = [];

const serviceDefinitions = [
  { id: "daily-shacharit", title: "Shacharit (Weekday)", desc: "Morning service for weekdays.", cat: "daily", order: 10, applicability: { shabbat: false } },
  { id: "daily-mincha", title: "Mincha", desc: "Afternoon service.", cat: "daily", order: 20 },
  { id: "daily-maariv", title: "Ma'ariv", desc: "Evening service for weekdays.", cat: "daily", order: 30 },
  { id: "daily-musaf", title: "Musaf (Weekdays on special days)", desc: "Additional service for Rosh Chodesh and festivals that fall on weekdays.", cat: "daily", order: 40, applicability: { roshChodesh: true } },
  { id: "daily-shared", title: "Shared Daily Additions", desc: "Common additions like Hallel, Torah readings, and seasonal notes.", cat: "daily", order: 50 },
  { id: "shabbat-kabbalat", title: "Kabbalat Shabbat", desc: "Welcoming Shabbat with psalms and song.", cat: "shabbat", order: 10, applicability: { shabbat: true } },
  { id: "shabbat-evening", title: "Shabbat Evening", desc: "Maariv of Shabbat with Kiddush guidance.", cat: "shabbat", order: 20, applicability: { shabbat: true } },
  { id: "shabbat-morning", title: "Shabbat Morning", desc: "Shacharit, Torah service, and Musaf components.", cat: "shabbat", order: 30, applicability: { shabbat: true } },
  { id: "shabbat-musaf", title: "Shabbat Musaf", desc: "Additional Amidah for Shabbat mornings.", cat: "shabbat", order: 40, applicability: { shabbat: true } },
  { id: "shabbat-mincha", title: "Shabbat Mincha", desc: "Afternoon service with Torah reading.", cat: "shabbat", order: 50, applicability: { shabbat: true } },
  { id: "shabbat-havdalah", title: "Havdalah", desc: "Closing Shabbat with wine, spices, and flame.", cat: "shabbat", order: 60, applicability: { motzaeiShabbat: true } },
  { id: "rosh-chodesh-shacharit", title: "Rosh Chodesh Shacharit", desc: "Morning service with Ya'aleh V'yavo and partial Hallel.", cat: "rosh_chodesh", order: 10, applicability: { roshChodesh: true } },
  { id: "rosh-chodesh-musaf", title: "Rosh Chodesh Musaf", desc: "Musaf Amidah for the new month.", cat: "rosh_chodesh", order: 20, applicability: { roshChodesh: true } },
  { id: "rosh-chodesh-hallel", title: "Rosh Chodesh Hallel", desc: "Order of psalms for partial Hallel.", cat: "rosh_chodesh", order: 30, applicability: { roshChodesh: true } },
  { id: "festival-rosh-hashanah", title: "Rosh Hashanah", desc: "High Holiday structure with Malchuyot, Zichronot, and Shofarot.", cat: "festivals_high_holidays", order: 10, applicability: { holidays: ["rosh_hashanah"] } },
  { id: "festival-yom-kippur", title: "Yom Kippur", desc: "Kol Nidrei through Ne'ilah.", cat: "festivals_high_holidays", order: 20, applicability: { holidays: ["yom_kippur"] } },
  { id: "festival-pesach", title: "Pesach", desc: "Festival services including Chol HaMoed variations.", cat: "festivals_high_holidays", order: 30, applicability: { holidays: ["pesach"] } },
  { id: "festival-shavuot", title: "Shavuot", desc: "Tikkun Leil Shavuot and Musaf additions.", cat: "festivals_high_holidays", order: 40, applicability: { holidays: ["shavuot"] } },
  { id: "festival-sukkot", title: "Sukkot", desc: "Hoshana circuits and lulav blessings.", cat: "festivals_high_holidays", order: 50, applicability: { holidays: ["sukkot"] } },
  { id: "festival-shemini-atzeret", title: "Shemini Atzeret & Simchat Torah", desc: "Musaf, Geshem, and Hakafot planning.", cat: "festivals_high_holidays", order: 60, applicability: { holidays: ["shemini_atzeret", "simchat_torah"] } },
  { id: "festival-chanukah", title: "Chanukah", desc: "Candle lighting and Al HaNisim inserts.", cat: "festivals_high_holidays", order: 70, applicability: { holidays: ["chanukah"] } },
  { id: "festival-purim", title: "Purim", desc: "Megillah, Mishloach Manot, and Seudah.", cat: "festivals_high_holidays", order: 80, applicability: { holidays: ["purim"] } },
  { id: "fast-gedaliah", title: "Tzom Gedaliah", desc: "Fast day schedule and readings.", cat: "fast_days", order: 10, applicability: { fastDays: ["tzom_gedaliah"] } },
  { id: "fast-asara-btevet", title: "Asara B'Tevet", desc: "Morning and Mincha customs for the fast.", cat: "fast_days", order: 20, applicability: { fastDays: ["asara_btevet"] } },
  { id: "fast-taanit-esther", title: "Ta'anit Esther", desc: "Fast preceding Purim.", cat: "fast_days", order: 30, applicability: { fastDays: ["taanit_esther"] } },
  { id: "fast-shivah-asar", title: "Shivah Asar B'Tammuz", desc: "Summer fast liturgy.", cat: "fast_days", order: 40, applicability: { fastDays: ["shivah_asar_btammuz"] } },
  { id: "fast-tisha-bav", title: "Tisha B'Av", desc: "Night and day services with kinot.", cat: "fast_days", order: 50, applicability: { fastDays: ["tisha_bav"] } },
  { id: "fast-taanit-bechorot", title: "Ta'anit Bechorot", desc: "Fast of the firstborn before Pesach.", cat: "fast_days", order: 60, applicability: { fastDays: ["taanit_bechorot"] } },
  { id: "flow-torah-service", title: "Torah Service", desc: "Step-by-step aliyah and scroll handling.", cat: "synagogue_flow", order: 10, applicability: { requiresMinyan: true } },
  { id: "flow-kaddish", title: "Kaddish Variants", desc: "When to say each form of Kaddish.", cat: "synagogue_flow", order: 20, applicability: { requiresMinyan: true } },
  { id: "flow-aliyot", title: "Aliyot & Blessings", desc: "Blessings before and after Torah and Haftarah.", cat: "synagogue_flow", order: 30, applicability: { requiresMinyan: true } },
  { id: "flow-special-readings", title: "Special Readings", desc: "Maftir, Haftara introductions, and special cases.", cat: "synagogue_flow", order: 40 },
  { id: "practice-daily", title: "Daily Practices", desc: "Blessings for routine actions.", cat: "practice_specific", order: 10 },
  { id: "practice-seasonal", title: "Seasonal Moments", desc: "Seasonal mitzvot and experiences.", cat: "practice_specific", order: 20 },
  { id: "practice-phenomena", title: "Phenomena & Experiences", desc: "Brachot for natural wonders and news.", cat: "practice_specific", order: 30 },
  { id: "meals-before", title: "Before Eating", desc: "Brachot over foods and drink.", cat: "meals", order: 10 },
  { id: "meals-after", title: "After Eating", desc: "Birkat Hamazon and related blessings.", cat: "meals", order: 20 },
  { id: "meals-special", title: "Festive Meals", desc: "Kiddush, Havdalah, and seudot mitzvah.", cat: "meals", order: 30 },
  { id: "personal-bedtime", title: "Bedtime", desc: "Kriat Shema al HaMitah and nighttime rituals.", cat: "bedtime_personal", order: 10 },
  { id: "personal-reflection", title: "Personal Reflection", desc: "Daily accounting and gratitude practices.", cat: "bedtime_personal", order: 20 },
  { id: "personal-travel", title: "Travel & Safety", desc: "Tefilat HaDerech and other protections.", cat: "bedtime_personal", order: 30 },
  { id: "lifecycle-birth", title: "Birth & Naming", desc: "Welcoming a new baby.", cat: "life_cycle", order: 10 },
  { id: "lifecycle-coming-of-age", title: "Coming of Age", desc: "Bar/Bat Mitzvah guidance.", cat: "life_cycle", order: 20 },
  { id: "lifecycle-wedding", title: "Wedding", desc: "Erusin, nissuin, and Sheva Brachot.", cat: "life_cycle", order: 30 },
  { id: "lifecycle-mourning", title: "Mourning", desc: "Shiva structure and comfort practices.", cat: "life_cycle", order: 40, applicability: { mournerOnly: true } },
  { id: "lifecycle-home", title: "Home & Milestones", desc: "Chanukat Bayit, anniversaries, and milestones.", cat: "life_cycle", order: 50 },
  { id: "seasonal-amidah", title: "Amidah Inserts", desc: "Seasonal swaps in the Amidah.", cat: "seasonal_inserts", order: 10 },
  { id: "seasonal-guides", title: "Seasonal Guides", desc: "Quick references for added texts.", cat: "seasonal_inserts", order: 20 },
  { id: "seasonal-special-days", title: "Special Day Reminders", desc: "What changes when certain days arrive.", cat: "seasonal_inserts", order: 30 }
];

const categoryMap = new Map(categories.map((entry) => [entry.id, entry]));

serviceDefinitions.forEach((definition) => {
  const categoryEntry = categoryMap.get(definition.cat);
  if (!categoryEntry) return;
  services.push(
    service({
      id: definition.id,
      title: definition.title,
      description: definition.desc,
      categoryId: categoryEntry.id,
      categoryName: categoryEntry.title,
      order: definition.order,
      applicability: definition.applicability ?? {}
    })
  );
});

const serviceMap = new Map(services.map((entry) => [entry.id, entry]));

const buckets: SiddurBucketEntry[] = [];
const items: SiddurItemEntry[] = [];

const weekdayAmidahBlessings = [
  { key: "1-avot", title: "Avot", description: "Opening blessing recalling the patriarchs and matriarchs." },
  { key: "2-gevurot", title: "Gevurot", description: "Celebrating divine strength and revival." },
  { key: "3-kedushat-hashem", title: "Kedushat Hashem", description: "Declaring God's holiness." },
  { key: "4-binah", title: "Binah", description: "Requesting wisdom and understanding." },
  { key: "5-teshuvah", title: "Teshuvah", description: "Seeking a return to Torah." },
  { key: "6-selichah", title: "Selichah", description: "Asking for forgiveness." },
  { key: "7-geulah", title: "Geulah", description: "Requesting redemption from distress." },
  { key: "8-refuah", title: "Refuah", description: "Praying for healing." },
  { key: "9-barech-alenu", title: "Birkat HaShanim", description: "Blessing for livelihood and rain." },
  { key: "10-kibbutz-galiyot", title: "Kibbutz Galuyot", description: "Gathering the exiles." },
  { key: "11-mishpat", title: "Din", description: "Restoring righteous judges." },
  { key: "12-minim", title: "Against Slander", description: "Guarding the community from those who sow harm." },
  { key: "13-tzadikim", title: "Tzadikim", description: "Supporting the righteous." },
  { key: "14-yerushalayim", title: "Boneh Yerushalayim", description: "Rebuilding Jerusalem." },
  { key: "15-mashiach", title: "Malchut Beit David", description: "Restoring the House of David." },
  { key: "16-tefillah", title: "Shomea Tefillah", description: "Hearing our prayers." },
  { key: "17-avodah", title: "Avodah", description: "Returning divine service to Zion." },
  { key: "18-hodaah", title: "Modim", description: "Offering thanksgiving." },
  { key: "19-shalom", title: "Sim Shalom", description: "Concluding blessing for peace." }
];

const makeWeekdayAmidahItems = (
  serviceId: string,
  bucketId: string,
  bucketName: string,
  baseOrder: number
) => {
  const serviceEntry = serviceMap.get(serviceId);
  if (!serviceEntry) return;
  items.push(
    itemEntry({
      id: `${serviceId}-amidah-opening`,
      title: "Amidah Opening",
      description: "Steps back, Adonai Sefatai, and quiet stance before the blessings.",
      categoryId: serviceEntry.categoryId,
      categoryName: serviceEntry.categoryName,
      serviceId: serviceEntry.id,
      serviceName: serviceEntry.title,
      bucketId,
      bucketName,
      order: baseOrder,
      applicability: { shabbat: false }
    })
  );
  weekdayAmidahBlessings.forEach((blessing, index) => {
    items.push(
      itemEntry({
        id: `${serviceId}-${blessing.key}`,
        title: blessing.title,
        description: blessing.description,
        categoryId: serviceEntry.categoryId,
        categoryName: serviceEntry.categoryName,
        serviceId: serviceEntry.id,
        serviceName: serviceEntry.title,
        bucketId,
        bucketName,
        order: baseOrder + (index + 1) * 10,
        applicability: { shabbat: false, amidahSection: blessing.key }
      })
    );
  });
  items.push(
    itemEntry({
      id: `${serviceId}-amidah-conclusion`,
      title: "Amidah Conclusion",
      description: "Elokai Netzor, personal prayers, and stepping back.",
      categoryId: serviceEntry.categoryId,
      categoryName: serviceEntry.categoryName,
      serviceId: serviceEntry.id,
      serviceName: serviceEntry.title,
      bucketId,
      bucketName,
      order: baseOrder + (weekdayAmidahBlessings.length + 1) * 10,
      applicability: { shabbat: false }
    })
  );
};

const bucketDefinitions: BucketDefinition[] = [
  {
    id: "daily-shacharit-morning-prep",
    title: "Awakening & Preparation",
    description: "Morning blessings before formal prayer begins.",
    serviceId: "daily-shacharit",
    order: 10,
    items: [
      { id: "daily-modeh-ani", title: "Modeh Ani", description: "Gratitude upon waking.", order: 10 },
      { id: "daily-netilat-yadayim", title: "Netilat Yadayim", description: "Hand washing blessing to begin the day.", order: 20 },
      {
        id: "daily-birchot-hashachar",
        title: "Birchot HaShachar",
        description: "Series of recognitions for daily abilities and freedoms.",
        outline: ["Opening", "Fifteen blessings", "Closing passages"],
        order: 30
      },
      {
        id: "daily-tallit",
        title: "Blessing on the Tallit",
        description: "Wrapping instructions and kavvanot for the tallit.",
        order: 40
      },
      {
        id: "daily-tefillin",
        title: "Blessings on Tefillin",
        description: "Shel yad and shel rosh with placement notes.",
        order: 50,
        applicability: { shabbat: false },
        notes: "Omitted on Shabbat and festivals."
      }
    ]
  },
  {
    id: "daily-shacharit-pesukei",
    title: "Pesukei D'Zimra",
    description: "Psalms of praise building toward the Shema.",
    serviceId: "daily-shacharit",
    order: 20,
    items: [
      { id: "daily-baruch-sheamar", title: "Baruch She'amar", description: "Opening blessing for the psalms section.", order: 10 },
      { id: "daily-hodu", title: "Hodu LaShem", description: "Psalm celebrating divine kindness.", order: 20 },
      { id: "daily-yehi-kavod", title: "Yehi Kavod", description: "Verses praising God's glory across generations.", order: 30 },
      { id: "daily-ashrei", title: "Ashrei", description: "Alphabetic psalm anchoring the section.", order: 40 },
      { id: "daily-psalms-146-150", title: "Halleluyah Psalms", description: "Final psalms crescendoing to Yishtabach.", order: 50 },
      {
        id: "daily-nishmat",
        title: "Nishmat Kol Chai",
        description: "Shabbat and festival expansion of praise.",
        order: 60,
        importance: "extended",
        applicability: { shabbat: true },
        notes: "Optional on weekdays."
      },
      { id: "daily-yishtabach", title: "Yishtabach", description: "Closing blessing sealing Pesukei D'Zimra.", order: 70 }
    ]
  },
  {
    id: "daily-shacharit-shema",
    title: "Shema and Blessings",
    description: "From Barchu through redemption before the Amidah.",
    serviceId: "daily-shacharit",
    order: 30,
    items: [
      { id: "daily-barchu", title: "Barchu", description: "Call to prayer inviting the minyan into the blessings.", order: 10, applicability: { requiresMinyan: true } },
      { id: "daily-yotzer-or", title: "Yotzer Or", description: "Blessing praising the renewal of light.", order: 20 },
      { id: "daily-ahavah-rabbah", title: "Ahavah Rabbah", description: "Love of Torah blessing preparing for Shema.", order: 30 },
      {
        id: "daily-shema-paragraphs",
        title: "Shema Paragraphs",
        description: "Three paragraphs of the Shema with focus hints.",
        outline: ["Shema/V'ahavta", "Vehaya Im Shamoa", "Vayomer"],
        order: 40
      },
      { id: "daily-emet-veyatziv", title: "Emet V'Yatziv", description: "Blessing of redemption linking to the Amidah.", order: 50 }
    ]
  },
  {
    id: "daily-shacharit-weekday-amidah",
    title: "Weekday Amidah",
    description: "Silent Amidah with nineteen blessings and concluding customs.",
    serviceId: "daily-shacharit",
    order: 40,
    applicability: { shabbat: false },
    items: []
  },
  {
    id: "daily-shacharit-post",
    title: "Post-Amidah Flow",
    description: "Supplications, psalms, and concluding prayers after the silent Amidah.",
    serviceId: "daily-shacharit",
    order: 50,
    applicability: { shabbat: false },
    items: [
      {
        id: "daily-tachanun-long",
        title: "Tachanun (Long Form)",
        description: "Monday/Thursday version including Vidui and the Thirteen Attributes.",
        order: 10,
        importance: "extended",
        applicability: { shabbat: false, weekdays: ["mon", "thu"] },
        notes: "Skipped on festivals, Rosh Chodesh, and joyous occasions."
      },
      {
        id: "daily-tachanun-short",
        title: "Tachanun (Daily Form)",
        description: "Standard weekday supplication recited seated.",
        order: 20,
        applicability: { shabbat: false }
      },
      { id: "daily-ashrei-repeat", title: "Ashrei", description: "Psalm bridging to concluding prayers.", order: 30 },
      { id: "daily-uva-letzion", title: "U'va Letzion", description: "Kedusha with Aramaic translation.", order: 40 },
      { id: "daily-shir-shel-yom", title: "Shir Shel Yom", description: "Daily psalm for each day of the week.", order: 50 },
      { id: "daily-aleinu", title: "Aleinu", description: "Final declaration of hope and unity.", order: 60 }
    ]
  },
  {
    id: "daily-shacharit-omer",
    title: "Counting the Omer",
    description: "Blessing and daily count between Pesach and Shavuot.",
    serviceId: "daily-shacharit",
    order: 60,
    applicability: { omer: true },
    items: [
      { id: "daily-omer-intro", title: "Omer Introduction", description: "Preparatory verses such as Psalm 67 or Ana Bekoach.", order: 10, applicability: { omer: true } },
      { id: "daily-omer-count", title: "Today's Count", description: "Blessing and counting formula for the current day.", order: 20, applicability: { omer: true } }
    ]
  },
  {
    id: "daily-mincha-opening",
    title: "Mincha Opening",
    description: "Ashrei and Half Kaddish before the Amidah.",
    serviceId: "daily-mincha",
    order: 10,
    items: [
      { id: "daily-mincha-ashrei", title: "Ashrei", description: "Psalm 145 before Mincha.", order: 10 },
      {
        id: "daily-mincha-kaddish",
        title: "Half Kaddish",
        description: "Leader's Kaddish marking the transition to the Amidah.",
        order: 20,
        applicability: { requiresMinyan: true },
        notes: "Requires a minyan."
      }
    ]
  },
  {
    id: "daily-mincha-amidah",
    title: "Mincha Amidah",
    description: "Weekday Amidah repeated in the afternoon service.",
    serviceId: "daily-mincha",
    order: 20,
    applicability: { shabbat: false },
    items: []
  },
  {
    id: "daily-mincha-conclusion",
    title: "Mincha Conclusion",
    description: "Tachanun, Aleinu, and final Kaddishim.",
    serviceId: "daily-mincha",
    order: 30,
    applicability: { shabbat: false },
    items: [
      { id: "daily-mincha-tachanun", title: "Mincha Tachanun", description: "Short supplication after the Amidah.", order: 10, applicability: { shabbat: false } },
      { id: "daily-mincha-aleinu", title: "Aleinu", description: "Closing prayer for Mincha.", order: 20 },
      {
        id: "daily-mincha-kaddish-yatom",
        title: "Mourner's Kaddish",
        description: "Opportunity for mourners after Mincha.",
        order: 30,
        applicability: { requiresMinyan: true, mournerOnly: true, kaddishType: "yatom" }
      }
    ]
  },
  {
    id: "daily-maariv-shema",
    title: "Ma'ariv Shema and Blessings",
    description: "Evening Shema with surrounding blessings.",
    serviceId: "daily-maariv",
    order: 10,
    items: [
      { id: "daily-maaliv-barchu", title: "Barchu", description: "Evening call to prayer.", order: 10, applicability: { requiresMinyan: true } },
      { id: "daily-maaliv-aravim", title: "Ma'ariv Aravim", description: "Blessing for the arrival of evening.", order: 20 },
      { id: "daily-maaliv-ahavat-olam", title: "Ahavat Olam", description: "Evening expression of divine love.", order: 30 },
      { id: "daily-maaliv-shema", title: "Shema and V'ahavta", description: "Recitation of the Shema at night.", order: 40 },
      { id: "daily-maaliv-emet-veemuna", title: "Emet V'Emunah", description: "Blessing affirming redemption at night.", order: 50 },
      { id: "daily-maaliv-hashkiveinu", title: "Hashkiveinu", description: "Prayer for peaceful sleep and protection.", order: 60 }
    ]
  },
  {
    id: "daily-maariv-amidah",
    title: "Ma'ariv Amidah",
    description: "Weekday Amidah recited quietly at night.",
    serviceId: "daily-maariv",
    order: 20,
    applicability: { shabbat: false },
    items: []
  },
  {
    id: "daily-maariv-conclusion",
    title: "Ma'ariv Conclusion",
    description: "Aleinu and Kaddishim closing the evening service.",
    serviceId: "daily-maariv",
    order: 30,
    items: [
      { id: "daily-maaliv-aleinu", title: "Aleinu", description: "Final declaration before Kaddish.", order: 10 },
      {
        id: "daily-maaliv-kaddish-titkabal",
        title: "Kaddish Titkabal",
        description: "Leader's Kaddish requesting acceptance of prayers.",
        order: 20,
        applicability: { requiresMinyan: true, kaddishType: "titkabal" }
      },
      {
        id: "daily-maaliv-kaddish-yatom",
        title: "Mourner's Kaddish",
        description: "Final Kaddish for mourners at night.",
        order: 30,
        applicability: { requiresMinyan: true, mournerOnly: true, kaddishType: "yatom" }
      }
    ]
  },
  {
    id: "daily-musaf-structure",
    title: "Weekday Musaf Structure",
    description: "Outline for Musaf on Rosh Chodesh and Chol HaMoed weekdays.",
    serviceId: "daily-musaf",
    order: 10,
    applicability: { roshChodesh: true },
    items: [
      { id: "daily-musaf-intro", title: "Musaf Intro", description: "Hazarat HaShatz preparations and silent Amidah notes.", order: 10, applicability: { roshChodesh: true } },
      { id: "daily-musaf-kedusha", title: "Musaf Kedusha", description: "Differences in the Kedusha text for Musaf.", order: 20, applicability: { roshChodesh: true } },
      { id: "daily-musaf-yaaleh", title: "Ya'aleh V'Yavo", description: "Insert recited in Musaf for the new month.", order: 30, applicability: { roshChodesh: true } }
    ]
  },
  {
    id: "daily-shared-halel",
    title: "Hallel Options",
    description: "Full and partial Hallel structures for weekdays.",
    serviceId: "daily-shared",
    order: 10,
    items: [
      { id: "daily-halel-intro", title: "Hallel Introduction", description: "Guidance for when to recite Hallel and how to begin.", order: 10 },
      { id: "daily-halel-full", title: "Full Hallel", description: "Order of psalms for full recitation.", order: 20, applicability: { holidays: ["pesach", "shavuot", "sukkot", "shemini_atzeret", "simchat_torah"] } },
      { id: "daily-halel-partial", title: "Partial Hallel", description: "Weekday Hallel as practiced on Rosh Chodesh and last days of Pesach.", order: 30, applicability: { roshChodesh: true } }
    ]
  },
  {
    id: "daily-shared-torah",
    title: "Weekday Torah Readings",
    description: "Aliyah breakdown for Mondays, Thursdays, and fast days.",
    serviceId: "daily-shared",
    order: 20,
    applicability: { requiresMinyan: true },
    items: [
      { id: "daily-torah-mon-thu", title: "Monday/Thursday Torah", description: "Three aliyot structure with blessing reminders.", order: 10, applicability: { weekdays: ["mon", "thu"], requiresMinyan: true } },
      { id: "daily-torah-fast-day", title: "Fast Day Torah", description: "Special readings for communal fasts.", order: 20, applicability: { fastDays: ["tzom_gedaliah", "asara_btevet", "taanit_esther", "shivah_asar_btammuz"] } },
      { id: "daily-torah-rosh-chodesh", title: "Rosh Chodesh Torah", description: "Aliyah plan for the new month reading.", order: 30, applicability: { roshChodesh: true } }
    ]
  },
  {
    id: "daily-shared-kaddish",
    title: "Daily Kaddishim",
    description: "Quick reference for which Kaddish variant appears where.",
    serviceId: "daily-shared",
    order: 30,
    applicability: { requiresMinyan: true },
    items: [
      { id: "daily-kaddish-half", title: "Chatzi Kaddish", description: "Marker between sections of the service.", order: 10, applicability: { requiresMinyan: true, kaddishType: "chatzi" } },
      { id: "daily-kaddish-titkabal", title: "Kaddish Titkabal", description: "Leader's Kaddish after the Amidah repetitions.", order: 20, applicability: { requiresMinyan: true, kaddishType: "titkabal" } },
      { id: "daily-kaddish-yatom", title: "Kaddish Yatom", description: "Mourner's Kaddish guidelines for each service.", order: 30, applicability: { requiresMinyan: true, mournerOnly: true, kaddishType: "yatom" } }
    ]
  },
  {
    id: "shabbat-kabbalat-psalms",
    title: "Kabbalat Shabbat Psalms",
    description: "Sequence of six psalms ushering in Shabbat.",
    serviceId: "shabbat-kabbalat",
    order: 10,
    items: [
      { id: "shabbat-psalm95", title: "Psalm 95", description: "Opening call to sing to God.", order: 10, applicability: { shabbat: true } },
      { id: "shabbat-psalm96", title: "Psalm 96", description: "Declare God's glory among the nations.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-psalm97", title: "Psalm 97", description: "God reigns; the earth rejoices.", order: 30, applicability: { shabbat: true } },
      { id: "shabbat-psalm98", title: "Psalm 98", description: "Sing a new song for redemption.", order: 40, applicability: { shabbat: true } },
      { id: "shabbat-psalm99", title: "Psalm 99", description: "Holy is God enthroned between the cherubim.", order: 50, applicability: { shabbat: true } },
      { id: "shabbat-psalm29", title: "Psalm 29", description: "Voice of God over the waters.", order: 60, applicability: { shabbat: true } }
    ]
  },
  {
    id: "shabbat-kabbalat-lecha-dodi",
    title: "Lecha Dodi & Welcoming",
    description: "Verses and customs for greeting the Shabbat bride.",
    serviceId: "shabbat-kabbalat",
    order: 20,
    items: [
      { id: "shabbat-lecha-dodi", title: "Lecha Dodi", description: "Acrostic poem welcoming Shabbat.", order: 10, applicability: { shabbat: true } },
      { id: "shabbat-mizmor-shir", title: "Mizmor Shir", description: "Psalm for Shabbat after Lecha Dodi.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-barchu-evening", title: "Barchu", description: "Call to prayer that transitions to Maariv.", order: 30, applicability: { shabbat: true, requiresMinyan: true } }
    ]
  },
  {
    id: "shabbat-evening-amidah",
    title: "Maariv Amidah (Shabbat)",
    description: "Seven-blessing structure highlighting Shabbat themes.",
    serviceId: "shabbat-evening",
    order: 10,
    items: [
      { id: "shabbat-evening-me-ein-sheva", title: "Me'ein Sheva", description: "Leader's repetition summarizing the Amidah.", order: 10, applicability: { shabbat: true, requiresMinyan: true } },
      { id: "shabbat-evening-vayechulu", title: "Vayechulu", description: "Declaring the completion of creation.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-evening-kiddush", title: "Friday Night Kiddush", description: "Sanctifying Shabbat over wine.", order: 30, applicability: { shabbat: true }, notes: "Variants for home and synagogue. Text coming soon." }
    ]
  },
  {
    id: "shabbat-morning-pesukei",
    title: "Shabbat Pesukei D'Zimra",
    description: "Expanded morning psalms with Nishmat and Shochen Ad.",
    serviceId: "shabbat-morning",
    order: 10,
    items: [
      { id: "shabbat-birchot-song", title: "Additional Psalms", description: "Shabbat expansions before Nishmat.", order: 10, applicability: { shabbat: true } },
      { id: "shabbat-nishmat", title: "Nishmat Kol Chai", description: "Extended praise unique to Shabbat.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-shochen-ad", title: "Shochen Ad", description: "Transition prayer before the Shema blessings.", order: 30, applicability: { shabbat: true } }
    ]
  },
  {
    id: "shabbat-morning-torah",
    title: "Torah Service Highlights",
    description: "Blessings and honors for the Shabbat Torah service.",
    serviceId: "shabbat-morning",
    order: 30,
    applicability: { shabbat: true, requiresMinyan: true },
    items: [
      { id: "shabbat-torah-opening", title: "Opening the Ark", description: "Ein Kamocha and Berich Shmei custom.", order: 10, applicability: { shabbat: true, requiresMinyan: true } },
      { id: "shabbat-aliyah-blessings", title: "Aliyah Blessings", description: "Before and after Torah blessings.", order: 20, applicability: { shabbat: true, requiresMinyan: true, torahReadingContext: "aliyah" } },
      { id: "shabbat-hagbah", title: "Hagbah & Gelilah", description: "Raising and dressing the scroll.", order: 30, applicability: { shabbat: true, requiresMinyan: true, torahReadingContext: "hagbah" } }
    ]
  },
  {
    id: "shabbat-musaf-structure",
    title: "Shabbat Musaf",
    description: "Musaf Amidah recalling the additional Shabbat offering.",
    serviceId: "shabbat-musaf",
    order: 10,
    items: [
      { id: "shabbat-musaf-kedusha", title: "Kedusha for Shabbat", description: "Text unique to Shabbat Musaf.", order: 10, applicability: { shabbat: true } },
      { id: "shabbat-musaf-retzei", title: "Retzei & Inserts", description: "References to the Temple service.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-musaf-kaddish", title: "Kaddish After Musaf", description: "Placement of Kaddish Titkabal after Musaf.", order: 30, applicability: { shabbat: true, requiresMinyan: true } }
    ]
  },
  {
    id: "shabbat-mincha-elements",
    title: "Shabbat Mincha Components",
    description: "Torah reading and Amidah for late Shabbat.",
    serviceId: "shabbat-mincha",
    order: 10,
    items: [
      { id: "shabbat-mincha-torah", title: "Shabbat Mincha Torah", description: "Reading the upcoming week's portion.", order: 10, applicability: { shabbat: true, requiresMinyan: true } },
      { id: "shabbat-mincha-amidah", title: "Mincha Amidah Text", description: "Three blessing structure for Shabbat afternoon.", order: 20, applicability: { shabbat: true } },
      { id: "shabbat-mincha-tzidkatcha", title: "Tzidkatcha Tzedek", description: "Psalm verses recited toward Shabbat's end.", order: 30, applicability: { shabbat: true } }
    ]
  },
  {
    id: "shabbat-havdalah-elements",
    title: "Havdalah Elements",
    description: "Wine, spices, and flame marking Shabbat's close.",
    serviceId: "shabbat-havdalah",
    order: 10,
    applicability: { motzaeiShabbat: true },
    items: [
      { id: "havdalah-intro", title: "Hinei El Yeshuati", description: "Introductory verses for Havdalah.", order: 10, applicability: { motzaeiShabbat: true } },
      { id: "havdalah-brachot", title: "Havdalah Blessings", description: "Blessings over wine, spices, and flame.", order: 20, applicability: { motzaeiShabbat: true } },
      { id: "havdalah-song", title: "Eliyahu HaNavi", description: "Songs and customs following Havdalah.", order: 30, applicability: { motzaeiShabbat: true } }
    ]
  },
  {
    id: "rosh-chodesh-shacharit-elements",
    title: "Rosh Chodesh Highlights",
    description: "Additions within the Shacharit service for the new month.",
    serviceId: "rosh-chodesh-shacharit",
    order: 10,
    applicability: { roshChodesh: true },
    items: [
      { id: "rosh-chodesh-yaaleh", title: "Ya'aleh V'Yavo", description: "Insert recited in the Amidah.", order: 10, applicability: { roshChodesh: true } },
      { id: "rosh-chodesh-halel", title: "Partial Hallel Notes", description: "Guidance for Rosh Chodesh Hallel custom.", order: 20, applicability: { roshChodesh: true }, notes: "Custom varies by community." },
      { id: "rosh-chodesh-torah", title: "Torah Reading", description: "Aliyah plan for the new month reading.", order: 30, applicability: { roshChodesh: true, requiresMinyan: true } }
    ]
  },
  {
    id: "rosh-chodesh-musaf-elements",
    title: "Rosh Chodesh Musaf",
    description: "Musaf Amidah for the renewal of the moon.",
    serviceId: "rosh-chodesh-musaf",
    order: 10,
    applicability: { roshChodesh: true },
    items: [
      { id: "rosh-chodesh-musaf-intro", title: "Musaf Opening", description: "Silent Amidah notes for Rosh Chodesh.", order: 10, applicability: { roshChodesh: true } },
      { id: "rosh-chodesh-musaf-middle", title: "Middle Blessings", description: "Text recalling the new month offerings.", order: 20, applicability: { roshChodesh: true } },
      { id: "rosh-chodesh-musaf-kaddish", title: "Concluding Kaddish", description: "Placement of Kaddish Titkabal after Musaf.", order: 30, applicability: { roshChodesh: true, requiresMinyan: true } }
    ]
  },
  {
    id: "rosh-chodesh-hallel-order",
    title: "Rosh Chodesh Hallel Order",
    description: "Psalms for partial Hallel with responsive reading cues.",
    serviceId: "rosh-chodesh-hallel",
    order: 10,
    applicability: { roshChodesh: true },
    items: [
      { id: "rosh-chodesh-halel-opening", title: "Opening Psalms", description: "Beginning with Psalm 113.", order: 10, applicability: { roshChodesh: true } },
      { id: "rosh-chodesh-halel-skipped", title: "Skipped Verses", description: "Outline of verses traditionally omitted.", order: 20, applicability: { roshChodesh: true }, notes: "Practice differs by tradition." },
      { id: "rosh-chodesh-halel-closing", title: "Closing Blessing", description: "Final beracha for partial Hallel.", order: 30, applicability: { roshChodesh: true } }
    ]
  },
  {
    id: "festival-rosh-hashanah-outline",
    title: "Rosh Hashanah Services",
    description: "Overview of Musaf sections and shofar blasts.",
    serviceId: "festival-rosh-hashanah",
    order: 10,
    items: [
      { id: "rh-musaf-malchuyot", title: "Malchuyot", description: "Kingship verses and liturgy.", order: 10, applicability: { holidays: ["rosh_hashanah"], requiresMinyan: true } },
      { id: "rh-musaf-zichronot", title: "Zichronot", description: "Remembrance section with ten verses.", order: 20, applicability: { holidays: ["rosh_hashanah"] } },
      { id: "rh-musaf-shofarot", title: "Shofarot", description: "Verses and blasts for shofar service.", order: 30, applicability: { holidays: ["rosh_hashanah"], requiresMinyan: true } }
    ]
  },
  {
    id: "festival-yom-kippur-sections",
    title: "Yom Kippur Highlights",
    description: "Key prayers from Kol Nidrei to Ne'ilah.",
    serviceId: "festival-yom-kippur",
    order: 10,
    items: [
      { id: "yk-kol-nidrei", title: "Kol Nidrei", description: "Annulment declaration opening Yom Kippur.", order: 10, applicability: { holidays: ["yom_kippur"], requiresMinyan: true } },
      { id: "yk-vidui", title: "Vidui Series", description: "Ashamnu and Al Chet confessions.", order: 20, applicability: { holidays: ["yom_kippur"] } },
      { id: "yk-neilah", title: "Ne'ilah", description: "Closing service with final shofar blast.", order: 30, applicability: { holidays: ["yom_kippur"], requiresMinyan: true } }
    ]
  },
  {
    id: "festival-pesach-outline",
    title: "Pesach Services",
    description: "Festival Amidah and Hallel notes for Pesach.",
    serviceId: "festival-pesach",
    order: 10,
    items: [
      { id: "pesach-halel", title: "Festival Hallel", description: "Full Hallel first day, partial on later days.", order: 10, applicability: { holidays: ["pesach"] } },
      { id: "pesach-yaaleh", title: "Ya'aleh V'Yavo", description: "Insertions for festival Amidah.", order: 20, applicability: { holidays: ["pesach"] } },
      { id: "pesach-torah", title: "Torah Readings", description: "Outline of daily Torah portions during Pesach.", order: 30, applicability: { holidays: ["pesach"], requiresMinyan: true } }
    ]
  },
  {
    id: "festival-shavuot-outline",
    title: "Shavuot Services",
    description: "Akdamut, Ten Commandments reading, and Musaf notes.",
    serviceId: "festival-shavuot",
    order: 10,
    items: [
      { id: "shavuot-akdamut", title: "Akdamut", description: "Piyut introduction before Torah reading.", order: 10, applicability: { holidays: ["shavuot"], requiresMinyan: true } },
      { id: "shavuot-ten-commandments", title: "Torah Reading", description: "Public reading of the Decalogue.", order: 20, applicability: { holidays: ["shavuot"], requiresMinyan: true } },
      { id: "shavuot-musaf", title: "Shavuot Musaf", description: "Festival-specific middle blessing.", order: 30, applicability: { holidays: ["shavuot"] } }
    ]
  },
  {
    id: "festival-sukkot-outline",
    title: "Sukkot Services",
    description: "Hoshanot, lulav, and festival Amidah guidance.",
    serviceId: "festival-sukkot",
    order: 10,
    items: [
      { id: "sukkot-hoshanot", title: "Hoshanot Circuits", description: "Daily processions with lulav.", order: 10, applicability: { holidays: ["sukkot"], requiresMinyan: true } },
      { id: "sukkot-halel", title: "Sukkot Hallel", description: "Full Hallel each day.", order: 20, applicability: { holidays: ["sukkot"] } },
      { id: "sukkot-musaf", title: "Sukkot Musaf", description: "Musaf outline with unique offerings.", order: 30, applicability: { holidays: ["sukkot"] } }
    ]
  },
  {
    id: "festival-shemini-outline",
    title: "Shemini Atzeret & Simchat Torah",
    description: "Geshem prayer and Hakafot celebrations.",
    serviceId: "festival-shemini-atzeret",
    order: 10,
    items: [
      { id: "shemini-geshem", title: "Tefillat Geshem", description: "Prayer for rain during Musaf.", order: 10, applicability: { holidays: ["shemini_atzeret"] } },
      { id: "simchat-hakafot", title: "Hakafot", description: "Seven circuits with Torah scrolls.", order: 20, applicability: { holidays: ["simchat_torah"], requiresMinyan: true } },
      { id: "simchat-aliyot", title: "Aliyah Customs", description: "Kol HaNe'arim and Chatan Torah/Bereshit honors.", order: 30, applicability: { holidays: ["simchat_torah"], requiresMinyan: true } }
    ]
  },
  {
    id: "festival-chanukah-outline",
    title: "Chanukah Rituals",
    description: "Lighting procedure, Al HaNisim, and Hallel.",
    serviceId: "festival-chanukah",
    order: 10,
    items: [
      { id: "chanukah-lighting", title: "Menorah Lighting", description: "Order of lights and blessings for each night.", order: 10, applicability: { holidays: ["chanukah"] } },
      { id: "chanukah-al-hanisim", title: "Al HaNisim", description: "Insert for Amidah and Birkat Hamazon.", order: 20, applicability: { holidays: ["chanukah"] } },
      { id: "chanukah-halel", title: "Chanukah Hallel", description: "Full Hallel each morning.", order: 30, applicability: { holidays: ["chanukah"] } }
    ]
  },
  {
    id: "festival-purim-outline",
    title: "Purim Observances",
    description: "Megillah readings, Mishloach Manot, and festive meal.",
    serviceId: "festival-purim",
    order: 10,
    items: [
      { id: "purim-megillah-night", title: "Night Megillah", description: "Evening reading with blessings.", order: 10, applicability: { holidays: ["purim"], requiresMinyan: true } },
      { id: "purim-al-hanisim", title: "Al HaNisim", description: "Insert for Amidah and Birkat Hamazon on Purim.", order: 20, applicability: { holidays: ["purim"] } },
      { id: "purim-day-megillah", title: "Day Megillah", description: "Morning reading and associated mitzvot.", order: 30, applicability: { holidays: ["purim"], requiresMinyan: true } }
    ]
  },
  {
    id: "fast-general-structure",
    title: "Weekday Fast Structure",
    description: "Selichot, Torah readings, and Anenu insertions.",
    serviceId: "fast-gedaliah",
    order: 10,
    items: [
      { id: "fast-selichot", title: "Selichot Outline", description: "Structure of penitential prayers.", order: 10, applicability: { fastDays: ["tzom_gedaliah"] } },
      { id: "fast-anenu", title: "Anenu", description: "Insert for the leader during fast day Amidah.", order: 20, applicability: { fastDays: ["tzom_gedaliah"], requiresMinyan: true } },
      { id: "fast-torah", title: "Torah Reading", description: "Readings for fast day mornings and afternoons.", order: 30, applicability: { fastDays: ["tzom_gedaliah"], requiresMinyan: true } }
    ]
  },
  {
    id: "fast-mincha-supplements",
    title: "Fast Day Mincha",
    description: "Torah reading, Haftarah, and special prayers at Mincha.",
    serviceId: "fast-asara-btevet",
    order: 10,
    items: [
      { id: "fast-mincha-torah", title: "Torah Reading", description: "Reading for afternoon service.", order: 10, applicability: { fastDays: ["asara_btevet"], requiresMinyan: true } },
      { id: "fast-mincha-haftarah", title: "Haftarah", description: "Reading from Yeshayahu for consolation.", order: 20, applicability: { fastDays: ["asara_btevet"], requiresMinyan: true } },
      { id: "fast-mincha-anenu", title: "Anenu (Individuals)", description: "Instructions when fasting personally.", order: 30, applicability: { fastDays: ["asara_btevet"] } }
    ]
  },
  {
    id: "flow-torah-service-guide",
    title: "Torah Service Flow",
    description: "Removing, reading, and returning the Torah scroll.",
    serviceId: "flow-torah-service",
    order: 10,
    applicability: { requiresMinyan: true },
    items: [
      { id: "flow-opening-ark", title: "Opening the Ark", description: "Ein Kamocha and Berich Shmei overview.", order: 10, applicability: { requiresMinyan: true } },
      { id: "flow-aliyah-sequence", title: "Aliyah Sequence", description: "Calling the oleh, blessings, and reading cadence.", order: 20, applicability: { requiresMinyan: true, torahReadingContext: "aliyah" } },
      { id: "flow-hagbah-gelilah", title: "Hagbah & Gelilah", description: "Raising, displaying, and dressing the Torah.", order: 30, applicability: { requiresMinyan: true, torahReadingContext: "hagbah" } }
    ]
  },
  {
    id: "flow-kaddish-variants",
    title: "Kaddish Variants",
    description: "When to recite each Kaddish form and who leads it.",
    serviceId: "flow-kaddish",
    order: 10,
    applicability: { requiresMinyan: true },
    items: [
      { id: "flow-chatzi-kaddish", title: "Chatzi Kaddish", description: "Transitional Kaddish between sections.", order: 10, applicability: { requiresMinyan: true, kaddishType: "chatzi" } },
      { id: "flow-kaddish-d-rabbanan", title: "Kaddish D'Rabbanan", description: "After learning or reciting rabbinic texts.", order: 20, applicability: { requiresMinyan: true, kaddishType: "derabbanan" } },
      { id: "flow-kaddish-yatom-guide", title: "Kaddish Yatom Guide", description: "Who says it and when throughout services.", order: 30, applicability: { requiresMinyan: true, mournerOnly: true, kaddishType: "yatom" } }
    ]
  },
  {
    id: "flow-special-readings-overview",
    title: "Special Readings",
    description: "Handling Maftir, Haftarah, and special Shabbatot.",
    serviceId: "flow-special-readings",
    order: 10,
    items: [
      { id: "flow-maftir", title: "Maftir Guidance", description: "When to add Maftir and the extra aliyah.", order: 10, applicability: { requiresMinyan: true, torahReadingContext: "maftir" } },
      { id: "flow-haftarah-blessings", title: "Haftarah Blessings", description: "Blessings before and after the Haftarah.", order: 20, applicability: { requiresMinyan: true, torahReadingContext: "haftarah" } },
      { id: "flow-special-parshiot", title: "Special Parshiot", description: "Notes for Shekalim, Zachor, Parah, and HaChodesh.", order: 30 }
    ]
  },
  {
    id: "practice-daily-routines",
    title: "Daily Routines",
    description: "Blessings for everyday mitzvot and practices.",
    serviceId: "practice-daily",
    order: 10,
    items: [
      { id: "practice-asher-yatzar", title: "Asher Yatzar", description: "Blessing after using the restroom.", order: 10 },
      { id: "practice-tzitzit-check", title: "Checking Tzitzit", description: "Reminder and blessing for tzitzit wearing.", order: 20 },
      { id: "practice-birkat-hatorah", title: "Birkat HaTorah", description: "Blessings before morning Torah study.", order: 30 }
    ]
  },
  {
    id: "practice-seasonal-moments",
    title: "Seasonal Moments",
    description: "Blessings marking seasonal shifts and mitzvot.",
    serviceId: "practice-seasonal",
    order: 10,
    items: [
      {
        id: "practice-birkat-hailanot",
        title: "Birkat Ha'Ilanot",
        description: "Blessing on blossoming trees in Nissan.",
        order: 10,
        applicability: { holidays: ["pesach"] },
        notes: "Said once each spring when seeing blossoming trees."
      },
      { id: "practice-sefirat-intro", title: "Sefirat HaOmer Prep", description: "Checklist before counting the Omer.", order: 20, applicability: { omer: true } },
      { id: "practice-sukkah", title: "Blessing for the Sukkah", description: "Leishev BaSukkah for sitting in the sukkah.", order: 30, applicability: { holidays: ["sukkot"] } }
    ]
  },
  {
    id: "practice-phenomena-moments",
    title: "Phenomena & Experiences",
    description: "Blessings for natural wonders and life events.",
    serviceId: "practice-phenomena",
    order: 10,
    items: [
      { id: "practice-thunder", title: "Blessing for Thunder", description: "Shekocho Ugvurato for powerful weather.", order: 10 },
      { id: "practice-rainbow", title: "Blessing for Rainbow", description: "Zochair HaBrit when seeing a rainbow.", order: 20 },
      { id: "practice-good-news", title: "Shehecheyanu", description: "Blessing for joyous new experiences.", order: 30 }
    ]
  },
  {
    id: "meals-before-blessings",
    title: "Blessings Before Eating",
    description: "Brachot for primary food categories.",
    serviceId: "meals-before",
    order: 10,
    items: [
      { id: "meals-hamotzi", title: "Hamotzi", description: "Bread blessing before meals.", order: 10 },
      { id: "meals-mezonot", title: "Mezonot", description: "Blessing over grain-based foods.", order: 20 },
      { id: "meals-hagefen", title: "Borei Pri HaGafen", description: "Blessing over wine and grape juice.", order: 30 },
      { id: "meals-haetz", title: "Borei Pri Ha'etz", description: "Blessing over fruit of the tree.", order: 40 },
      { id: "meals-haadama", title: "Borei Pri HaAdama", description: "Blessing over produce of the ground.", order: 50 },
      { id: "meals-shehakol", title: "Shehakol", description: "Blessing for all other foods and drinks.", order: 60 }
    ]
  },
  {
    id: "meals-after-blessings",
    title: "After-Eating Blessings",
    description: "Birkat Hamazon and short forms.",
    serviceId: "meals-after",
    order: 10,
    items: [
      { id: "meals-birkat-hamazon", title: "Birkat Hamazon", description: "Grace after meals with section overview.", order: 10, outline: ["Zimun", "First blessing", "Second blessing", "Third blessing", "Harachaman"] },
      { id: "meals-al-hamichya", title: "Al HaMichya", description: "Blessing after mezonot, wine, and fruit.", order: 20 },
      { id: "meals-borei-nefashot", title: "Borei Nefashot", description: "Short after-blessing for snacks and drinks.", order: 30 }
    ]
  },
  {
    id: "meals-special-rituals",
    title: "Festive Meal Rituals",
    description: "Kiddush, Havdalah, and seudot mitzvah notes.",
    serviceId: "meals-special",
    order: 10,
    items: [
      { id: "meals-shabbat-kiddush", title: "Shabbat Kiddush", description: "Daytime Kiddush text and customs.", order: 10, applicability: { shabbat: true } },
      { id: "meals-havdalah-table", title: "Havdalah at the Table", description: "When Havdalah follows a meal or Yom Tov.", order: 20, applicability: { motzaeiShabbat: true } },
      { id: "meals-zimun", title: "Zimun", description: "Inviting others to Birkat Hamazon.", order: 30, applicability: { requiresMinyan: false } }
    ]
  },
  {
    id: "personal-bedtime-flow",
    title: "Bedtime Shema",
    description: "Kriat Shema al HaMitah with protective psalms.",
    serviceId: "personal-bedtime",
    order: 10,
    items: [
      { id: "bedtime-shema", title: "Shema at Bedtime", description: "Text and meditations before sleep.", order: 10 },
      { id: "bedtime-hamapil", title: "Hamapil", description: "Blessing for restful sleep.", order: 20 },
      { id: "bedtime-psalm91", title: "Psalm 91", description: "Protective psalm recited by many communities.", order: 30 }
    ]
  },
  {
    id: "personal-reflection-tools",
    title: "Personal Reflection",
    description: "Guides for cheshbon hanefesh and gratitude journaling.",
    serviceId: "personal-reflection",
    order: 10,
    items: [
      { id: "reflection-cheshbon", title: "Daily Accounting", description: "Prompts for end-of-day review.", order: 10 },
      { id: "reflection-gratitude", title: "Gratitude Three", description: "List three things that went well.", order: 20 },
      { id: "reflection-intentions", title: "Intentions for Tomorrow", description: "Setting mindful goals for the next day.", order: 30 }
    ]
  },
  {
    id: "personal-travel-safety",
    title: "Travel & Safety",
    description: "Prayers before journeys and risky moments.",
    serviceId: "personal-travel",
    order: 10,
    items: [
      { id: "travel-tefilat-haderech", title: "Tefilat HaDerech", description: "Prayer for safe travel.", order: 10, applicability: { requiresMinyan: false } },
      { id: "travel-before-flight", title: "Before Flying", description: "Suggested psalms and practices before boarding.", order: 20 },
      {
        id: "travel-returning",
        title: "Returning Home",
        description: "Birkat HaGomel cues when applicable.",
        order: 30,
        applicability: { requiresMinyan: true },
        notes: "Birkat HaGomel traditionally requires a minyan."
      }
    ]
  },
  {
    id: "lifecycle-birth-outline",
    title: "Birth & Naming",
    description: "Welcoming a new baby with brit milah or simchat bat.",
    serviceId: "lifecycle-birth",
    order: 10,
    items: [
      { id: "birth-brit-milah", title: "Brit Milah Outline", description: "Order of blessings and honors.", order: 10, applicability: { requiresMinyan: true } },
      { id: "birth-zeved-habat", title: "Simchat Bat / Zeved HaBat", description: "Naming ceremony for daughters.", order: 20 },
      { id: "birth-pidyon-haben", title: "Pidyon HaBen", description: "Redemption of the firstborn son.", order: 30, applicability: { requiresMinyan: true } }
    ]
  },
  {
    id: "lifecycle-comingofage-outline",
    title: "Coming of Age",
    description: "Preparing for Bar/Bat Mitzvah celebrations.",
    serviceId: "lifecycle-coming-of-age",
    order: 10,
    items: [
      { id: "mitzvah-aliyah", title: "Aliyah Preparation", description: "Rehearsing blessings and reading cues.", order: 10 },
      { id: "mitzvah-speech", title: "Dvar Torah Planning", description: "Outline for crafting a Dvar Torah.", order: 20 },
      { id: "mitzvah-celebration", title: "Celebration Checklist", description: "Ritual items and customs to include.", order: 30 }
    ]
  },
  {
    id: "lifecycle-wedding-outline",
    title: "Wedding",
    description: "Erusin, Ketubah, and Sheva Brachot structure.",
    serviceId: "lifecycle-wedding",
    order: 10,
    items: [
      { id: "wedding-erusin", title: "Erusin", description: "Betrothal blessings over wine and ring.", order: 10 },
      { id: "wedding-ketubah", title: "Ketubah Reading", description: "Public reading and signing customs.", order: 20 },
      { id: "wedding-sheva-brachot", title: "Sheva Brachot", description: "Blessings under the chuppah and at meals.", order: 30, applicability: { requiresMinyan: true } }
    ]
  },
  {
    id: "lifecycle-mourning-outline",
    title: "Mourning",
    description: "Shiva prayers, Kaddish, and comfort practices.",
    serviceId: "lifecycle-mourning",
    order: 10,
    applicability: { mournerOnly: true },
    items: [
      { id: "mourning-aninut", title: "Before Burial", description: "Practices during aninut.", order: 10 },
      { id: "mourning-shiva", title: "Sitting Shiva", description: "Daily prayer schedule and visitors.", order: 20, applicability: { mournerOnly: true } },
      { id: "mourning-kaddish", title: "Saying Kaddish", description: "Timeline and guidance for mourners.", order: 30, applicability: { mournerOnly: true, requiresMinyan: true, kaddishType: "yatom" } }
    ]
  },
  {
    id: "lifecycle-home-milestones",
    title: "Home & Milestones",
    description: "Chanukat Bayit, anniversaries, and other celebrations.",
    serviceId: "lifecycle-home",
    order: 10,
    items: [
      { id: "home-chanukat", title: "Chanukat Bayit", description: "Dedication ceremony for a new home.", order: 10 },
      { id: "home-anniversary", title: "Anniversary Blessings", description: "Ideas for marking anniversaries with prayer.", order: 20 },
      { id: "home-graduate", title: "Milestone Moments", description: "Blessings for graduations or achievements.", order: 30 }
    ]
  },
  {
    id: "seasonal-amidah-inserts",
    title: "Amidah Inserts",
    description: "Seasonal swaps such as Mashiv HaRuach and V'ten Tal U'Matar.",
    serviceId: "seasonal-amidah",
    order: 10,
    items: [
      { id: "seasonal-mashiv-haruach", title: "Mashiv HaRuach", description: "Switching to rain language in Musaf.", order: 10, applicability: { holidays: ["shemini_atzeret"], diasporaOrIsrael: "both" } },
      { id: "seasonal-tal-geshem", title: "Tal & Geshem", description: "Notes on chanting Tal (Pesach) and Geshem (Shemini Atzeret).", order: 20, applicability: { holidays: ["pesach", "shemini_atzeret"] } },
      { id: "seasonal-vten-tal", title: "V'ten Tal U'Matar", description: "Date ranges for requesting rain.", order: 30, applicability: { diasporaOrIsrael: "both" } }
    ]
  },
  {
    id: "seasonal-guides-summary",
    title: "Seasonal Guides",
    description: "Quick reference for Ya'aleh V'yavo, Al HaNisim, and more.",
    serviceId: "seasonal-guides",
    order: 10,
    items: [
      { id: "seasonal-yaaleh-vyavo", title: "Ya'aleh V'Yavo", description: "When to insert in Amidah and Birkat Hamazon.", order: 10, applicability: { roshChodesh: true, holidays: ["pesach", "shavuot", "sukkot", "shemini_atzeret"] } },
      { id: "seasonal-al-hanisim", title: "Al HaNisim", description: "Insert for Chanukah and Purim.", order: 20, applicability: { holidays: ["chanukah", "purim"] } },
      { id: "seasonal-yizkor", title: "Yizkor Reminder", description: "When Yizkor is recited.", order: 30, applicability: { holidays: ["yom_kippur", "shemini_atzeret", "pesach", "shavuot"] } }
    ]
  },
  {
    id: "seasonal-special-day-reminders",
    title: "Special Day Reminders",
    description: "Guide to Omer counting, Tachanun omissions, and daily changes.",
    serviceId: "seasonal-special-days",
    order: 10,
    items: [
      { id: "seasonal-omer-calendar", title: "Omer Calendar", description: "Tracking which day we are counting tonight.", order: 10, applicability: { omer: true } },
      { id: "seasonal-tachanun-map", title: "Tachanun Map", description: "Days when Tachanun is omitted.", order: 20 },
      { id: "seasonal-shir-shel-yom-guide", title: "Shir Shel Yom Guide", description: "Quick lookup for the day's psalm.", order: 30 }
    ]
  }
];

bucketDefinitions.forEach((definition) => {
  const serviceEntry = serviceMap.get(definition.serviceId);
  if (!serviceEntry) return;
  const bucket = bucketEntry({
    id: definition.id,
    title: definition.title,
    description: definition.description,
    categoryId: serviceEntry.categoryId,
    categoryName: serviceEntry.categoryName,
    serviceId: serviceEntry.id,
    serviceName: serviceEntry.title,
    order: definition.order,
    importance: definition.importance,
    nusach: definition.nusach,
    applicability: definition.applicability,
    notes: definition.notes
  });
  buckets.push(bucket);
  definition.items.forEach((itemDef) => {
    items.push(
      itemEntry({
        id: itemDef.id,
        title: itemDef.title,
        description: itemDef.description,
        outline: itemDef.outline,
        categoryId: serviceEntry.categoryId,
        categoryName: serviceEntry.categoryName,
        serviceId: serviceEntry.id,
        serviceName: serviceEntry.title,
        bucketId: bucket.id,
        bucketName: bucket.title,
        order: itemDef.order,
        importance: itemDef.importance,
        nusach: itemDef.nusach,
        applicability: itemDef.applicability,
        notes: itemDef.notes,
        tags: itemDef.tags
      })
    );
  });
});

makeWeekdayAmidahItems("daily-shacharit", "daily-shacharit-weekday-amidah", "Weekday Amidah", 5);
makeWeekdayAmidahItems("daily-mincha", "daily-mincha-amidah", "Mincha Amidah", 5);
makeWeekdayAmidahItems("daily-maariv", "daily-maariv-amidah", "Ma'ariv Amidah", 5);

const SIDDUR_METADATA: SiddurMetadata = {
  categories,
  services,
  buckets,
  items
};

export default SIDDUR_METADATA;
export { SIDDUR_METADATA };
