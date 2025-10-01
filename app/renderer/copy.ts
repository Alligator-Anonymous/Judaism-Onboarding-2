export const copy = {
  appName: "Derech",
  footerDisclaimer:
    "This app is for learning, not for halachic rulings. Practices vary by community; consult your rabbi.",
  tabs: {
    today: "Today",
    texts: "Texts",
    practice: "Practice"
  },
  today: {
    welcome: "Shalom! Here is today’s snapshot.",
    shabbatBanner: "Shabbat mode: Slow down and welcome the gift of rest.",
    candleLighting: (time: string) => `Candle-lighting tonight at ${time}.`,
    learningBiteTitle: "Learning Bite",
    journalPromptTitle: "Gentle Journal Prompt",
    zmanimHelp: "Times are approximate. For practice, please confirm with a local rabbi."
  },
  texts: {
    tanakhTitle: "Tanakh Navigator",
    siddurTitle: "Daily Siddur"
  },
  practice: {
    alefBetTitle: "Alef-Bet Lab",
    niqqudTitle: "Niqqud Builder",
    faqTitle: "Questions Beginners Ask",
    spacedRepTitle: "Word Garden"
  }
};
