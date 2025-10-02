import React, { useEffect, useMemo, useState } from "react";
import { copy } from "@/copy";
import { Card } from "./UI/Card";
import { useCalendar } from "@stores/useCalendar";
import { formatFriendlyGregorian, getHebrewDateParts, type ParshaSummary } from "@lib/calendar";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";

export const Today: React.FC = () => {
  const hebrewDate = useCalendar((state) => state.hebrewDate);
  const parashah = useCalendar((state) => state.parashah);
  const zmanim = useCalendar((state) => state.zmanim);
  const upcomingHoliday = useCalendar((state) => state.upcomingHoliday);
  const isShabbatEve = useCalendar((state) => state.isShabbatEve);
  const refresh = useCalendar((state) => state.refresh);
  const settings = useSettings();
  const registry = useContent((state) => state.registry);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (registry) {
      refresh(Object.values(registry.holidays));
    }
  }, [refresh, registry]);

  const tz = settings.location.timezone;
  const now = useMemo(() => new Date(), []);
  const isShabbatDay = now.getDay() === 5 || now.getDay() === 6;

  const genesisChapter = registry?.tanakh["genesis-1"];
  const featuredVerse = genesisChapter?.verses[0];
  const featuredCommentary = featuredVerse
    ? registry?.commentary["rashi-gen-1"]?.find((entry) => entry.refs.includes(featuredVerse.ref))
    : undefined;

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-slate-600 dark:text-slate-300">{copy.today.welcome}</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{formatFriendlyGregorian(now)}</h1>
        <p className="text-lg text-pomegranate">{hebrewDate}</p>
      </header>
      {(isShabbatEve || isShabbatDay) && (
        <Card tone="accent" className="border-2 border-pomegranate">
          <p className="font-semibold">{copy.today.shabbatBanner}</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {copy.today.candleLighting(zmanim.sunset)}
          </p>
        </Card>
      )}
      <section className="grid gap-4 md:grid-cols-2">
        <Card title="This Week’s Parashah" className="space-y-3" aria-live="polite">
          <ParshaHighlight parsha={parashah} />
          {upcomingHoliday ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Next holiday: <strong>{upcomingHoliday.name}</strong> in {upcomingHoliday.daysAway} day(s)
            </p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">Keep an eye out for upcoming celebrations!</p>
          )}
        </Card>
        <Card title="Zmanim" className="space-y-2">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div title="Alot HaShachar – dawn">
              <dt className="text-slate-500">Dawn</dt>
              <dd className="font-semibold">{zmanim.dawn}</dd>
            </div>
            <div title="Hanetz HaChamah – sunrise">
              <dt className="text-slate-500">Sunrise</dt>
              <dd className="font-semibold">{zmanim.sunrise}</dd>
            </div>
            <div title="Shkiah – sunset">
              <dt className="text-slate-500">Sunset</dt>
              <dd className="font-semibold">{zmanim.sunset}</dd>
            </div>
            <div title="Tzeit HaKochavim – nightfall">
              <dt className="text-slate-500">Nightfall</dt>
              <dd className="font-semibold">{zmanim.nightfall}</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-400">{copy.today.zmanimHelp}</p>
        </Card>
      </section>
      <MonthCalendar referenceDate={now} />
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3" title={copy.today.learningBiteTitle}>
          <header>
            <p className="text-sm uppercase tracking-wide text-slate-500">{copy.today.learningBiteTitle}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {featuredVerse?.ref ?? "Genesis 1"}
            </h2>
          </header>
          <blockquote className="rounded-lg bg-slate-50 p-3 text-right font-hebrew text-lg leading-relaxed dark:bg-slate-900 dark:text-slate-100">
            {featuredVerse?.hebrew ?? ""}
          </blockquote>
          <p className="text-sm text-slate-600 dark:text-slate-300">{featuredVerse?.translation}</p>
          {featuredCommentary ? (
            <p className="text-sm text-slate-600 dark:text-slate-200">
              Rashi: {featuredCommentary.text}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 2500);
            }}
            className="rounded-full bg-pomegranate px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-pomegranate"
          >
            I explored this verse
          </button>
          {showConfetti && <Confetti />}
        </Card>
        <Card className="space-y-3" title={copy.today.journalPromptTitle}>
          <header>
            <p className="text-sm uppercase tracking-wide text-slate-500">{copy.today.journalPromptTitle}</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {featuredVerse ? "Creation sparks gratitude" : "Reflect on today"}
            </h2>
          </header>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {featuredVerse
              ? "Where do you notice new beginnings or light in your life this week?"
              : "Take a breath and note one thing you learned today."}
          </p>
          <textarea
            className="w-full rounded-lg border border-slate-300 p-3 text-sm shadow-inner focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
            rows={4}
            placeholder="Jot a line or two..."
          />
        </Card>
      </section>
      <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {copy.footerDisclaimer}
        <div className="mt-2">Local time zone: {tz}</div>
      </footer>
    </div>
  );
};

interface ParshaHighlightProps {
  parsha: ParshaSummary | null;
}

const ParshaHighlight: React.FC<ParshaHighlightProps> = ({ parsha }) => {
  if (!parsha) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">Checking this week’s reading…</p>;
  }

  const destination = parsha.slug ? `#/texts/tanakh/torah/parsha/${parsha.slug}` : null;
  const content = (
    <div className="space-y-1">
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        Parsha: <span className="text-pomegranate">{parsha.shortName}</span>
      </p>
      {parsha.reading ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">{parsha.reading}</p>
      ) : null}
    </div>
  );

  if (!destination) {
    return (
      <div className="rounded-lg border border-transparent bg-pomegranate/5 px-4 py-3">{content}</div>
    );
  }

  return (
    <a
      href={destination}
      className="block rounded-lg border border-transparent bg-pomegranate/5 px-4 py-3 transition hover:border-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/40"
    >
      <span className="sr-only">Open the full parsha reading</span>
      {content}
    </a>
  );
};

const Confetti: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 flex animate-ping flex-wrap items-start justify-center gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <span key={index} aria-hidden className="text-4xl">
        🍇
      </span>
    ))}
  </div>
);

interface MonthCalendarProps {
  referenceDate: Date;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ referenceDate }) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < start.getDay(); i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <section className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">This Month at a Glance</h2>
      <table className="mt-3 w-full table-fixed text-center text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-slate-500">
            {"SMTWTFS".split("").map((day) => (
              <th key={day} className="py-1">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((date, idx) => {
                if (!date) {
                  return <td key={idx} className="h-16" />;
                }
                const hebrew = getHebrewDateParts(date);
                const isToday = date.toDateString() === referenceDate.toDateString();
                return (
                  <td
                    key={idx}
                    className={`h-16 align-top border border-slate-100 p-1 text-xs dark:border-slate-800 ${
                      isToday ? "bg-pomegranate/10 font-semibold text-pomegranate" : ""
                    }`}
                  >
                    <div>{date.getDate()}</div>
                    <div className="text-[0.6rem]" dir="rtl">
                      {hebrew.day} {hebrew.monthName}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
