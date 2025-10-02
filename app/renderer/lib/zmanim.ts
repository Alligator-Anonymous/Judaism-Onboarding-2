import { addMinutes } from "date-fns";

export type TwilightMode = "fixedMinutes" | "degrees";

export interface TwilightPreference {
  type: TwilightMode;
  value: number;
}

export interface ZmanimPrefs {
  dayLengthModel: "gra" | "magenAvraham";
  dawn: TwilightPreference;
  nightfall: TwilightPreference;
  candleLightingOffsetMin: number;
}

export interface LocationInput {
  lat: number;
  lon: number;
  timeZone?: string;
}

export interface ZmanimResult {
  alos: Date | null;
  sunrise: Date | null;
  sofZmanShemaGra: Date | null;
  sofZmanShemaMagenAvraham: Date | null;
  sofZmanTefillahGra: Date | null;
  sofZmanTefillahMagenAvraham: Date | null;
  chatzot: Date | null;
  minchaGedola: Date | null;
  minchaKetana: Date | null;
  plagHamincha: Date | null;
  sunset: Date | null;
  tzes: Date | null;
  candleLighting: Date | null;
}

const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const DEG2RAD = Math.PI / 180;
const ECLIPTIC_OBLIQUITY = 23.4397 * DEG2RAD;
const JULIAN_OFFSET = 0.0009;

function toJulian(date: Date): number {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

function fromJulian(julian: number): Date {
  return new Date((julian + 0.5 - J1970) * DAY_MS);
}

function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

function solarMeanAnomaly(days: number): number {
  return DEG2RAD * (357.5291 + 0.98560028 * days);
}

function eclipticLongitude(meanAnomaly: number): number {
  const equationOfCenter = DEG2RAD * (
    1.9148 * Math.sin(meanAnomaly) +
    0.02 * Math.sin(2 * meanAnomaly) +
    0.0003 * Math.sin(3 * meanAnomaly)
  );
  const perihelion = DEG2RAD * 102.9372;
  return meanAnomaly + equationOfCenter + perihelion + Math.PI;
}

function declination(eclipticLon: number): number {
  return Math.asin(Math.sin(ECLIPTIC_OBLIQUITY) * Math.sin(eclipticLon));
}

function solarTransitJulian(days: number, meanAnomaly: number, eclipticLon: number): number {
  return J2000 + days + 0.0053 * Math.sin(meanAnomaly) - 0.0069 * Math.sin(2 * eclipticLon);
}

function hourAngle(altitude: number, latitude: number, decl: number): number {
  const sinAltitude = Math.sin(altitude);
  const sinLat = Math.sin(latitude);
  const cosLat = Math.cos(latitude);
  const sinDecl = Math.sin(decl);
  const cosDecl = Math.cos(decl);
  const cosH = (sinAltitude - sinLat * sinDecl) / (cosLat * cosDecl);

  if (cosH <= -1) {
    return Math.PI;
  }
  if (cosH >= 1) {
    return 0;
  }
  return Math.acos(cosH);
}

function resolveTimeZone(preferred?: string): string {
  if (preferred) {
    try {
      // Validate the IANA zone; will throw if invalid.
      new Intl.DateTimeFormat("en-US", { timeZone: preferred });
      return preferred;
    } catch (error) {
      console.warn("Invalid time zone supplied for zmanim; falling back to system zone", error);
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
}

function computeSolarTimes(baseDate: Date, latitude: number, longitude: number, altitude: number) {
  const lw = DEG2RAD * -longitude;
  const phi = DEG2RAD * latitude;
  const days = toDays(baseDate);
  const n = Math.round(days - JULIAN_OFFSET - lw / (2 * Math.PI));
  const ds = n + JULIAN_OFFSET + lw / (2 * Math.PI);
  const meanAnom = solarMeanAnomaly(ds);
  const eclipticLon = eclipticLongitude(meanAnom);
  const dec = declination(eclipticLon);
  const transit = solarTransitJulian(ds, meanAnom, eclipticLon);
  const h = DEG2RAD * altitude;
  const w = hourAngle(h, phi, dec);

  if (Number.isNaN(w)) {
    return { rise: null as Date | null, set: null as Date | null, transit: fromJulian(transit) };
  }

  const riseJulian = transit - w / (2 * Math.PI);
  const setJulian = transit + w / (2 * Math.PI);

  return {
    rise: fromJulian(riseJulian),
    set: fromJulian(setJulian),
    transit: fromJulian(transit)
  };
}

function applyTwilightPreference(
  sunrise: Date | null,
  sunset: Date | null,
  preference: TwilightPreference,
  latitude: number,
  longitude: number,
  calcDate: Date,
  isMorning: boolean
): Date | null {
  if (preference.type === "fixedMinutes") {
    if (isMorning) {
      return sunrise ? addMinutes(sunrise, -Math.abs(preference.value)) : null;
    }
    return sunset ? addMinutes(sunset, Math.abs(preference.value)) : null;
  }

  const altitude = -Math.abs(preference.value);
  const solar = computeSolarTimes(calcDate, latitude, longitude, altitude);
  return isMorning ? solar.rise : solar.set;
}

function differenceMs(a: Date | null, b: Date | null): number | null {
  if (!a || !b) return null;
  return a.getTime() - b.getTime();
}

function addMs(base: Date | null, ms: number | null): Date | null {
  if (!base || ms == null) return null;
  return new Date(base.getTime() + ms);
}

export function computeZmanim(
  date: Date,
  loc: LocationInput,
  prefs: ZmanimPrefs
): ZmanimResult {
  if (!Number.isFinite(loc.lat) || !Number.isFinite(loc.lon)) {
    throw new Error("Invalid coordinates for zmanim calculation");
  }
  const timeZone = resolveTimeZone(loc.timeZone);
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);
  const partValue = (type: string) => Number(dateParts.find((part) => part.type === type)?.value);
  const year = partValue("year") || date.getUTCFullYear();
  const month = partValue("month") || date.getUTCMonth() + 1;
  const day = partValue("day") || date.getUTCDate();
  const calcDate = new Date(Date.UTC(year, month - 1, day, 12));

  const solar = computeSolarTimes(calcDate, loc.lat, loc.lon, -0.833);
  const sunrise = solar.rise;
  const sunset = solar.set;
  const chatzot = solar.transit;

  const alos = applyTwilightPreference(sunrise, sunset, prefs.dawn, loc.lat, loc.lon, calcDate, true);
  const tzes = applyTwilightPreference(sunrise, sunset, prefs.nightfall, loc.lat, loc.lon, calcDate, false);

  const graHour = differenceMs(sunset, sunrise);
  const maHour = differenceMs(tzes, alos);
  const shaahGra = graHour != null ? graHour / 12 : null;
  const shaahMa = maHour != null ? maHour / 12 : null;

  const sofZmanShemaGra = addMs(sunrise, shaahGra != null ? shaahGra * 3 : null);
  const sofZmanShemaMagenAvraham = addMs(alos, shaahMa != null ? shaahMa * 3 : null);

  const sofZmanTefillahGra = addMs(sunrise, shaahGra != null ? shaahGra * 4 : null);
  const sofZmanTefillahMagenAvraham = addMs(alos, shaahMa != null ? shaahMa * 4 : null);

  const dayModelStart = prefs.dayLengthModel === "gra" ? sunrise : alos;
  const dayModelHour = prefs.dayLengthModel === "gra" ? shaahGra : shaahMa;

  const minchaGedola = addMs(dayModelStart, dayModelHour != null ? dayModelHour * 6.5 : null);
  const minchaKetana = addMs(dayModelStart, dayModelHour != null ? dayModelHour * 9.5 : null);
  const plagHamincha = addMs(dayModelStart, dayModelHour != null ? dayModelHour * 10.75 : null);

  const candleLighting = sunset ? addMinutes(sunset, -Math.abs(prefs.candleLightingOffsetMin)) : null;

  return {
    alos,
    sunrise,
    sofZmanShemaGra,
    sofZmanShemaMagenAvraham,
    sofZmanTefillahGra,
    sofZmanTefillahMagenAvraham,
    chatzot,
    minchaGedola,
    minchaKetana,
    plagHamincha,
    sunset,
    tzes,
    candleLighting
  };
}

export type TimeFormat = "12h" | "24h";
export type RoundingMode = "none" | "nearestMinute";

export interface FormatOptions {
  timeZone: string;
  timeFormat: TimeFormat;
  rounding: RoundingMode;
  fallback?: string;
}

export function roundTime(date: Date | null, mode: RoundingMode): Date | null {
  if (!date) return null;
  if (mode !== "nearestMinute") {
    return date;
  }
  const minute = 60_000;
  return new Date(Math.round(date.getTime() / minute) * minute);
}

export function formatZman(date: Date | null, options: FormatOptions): string {
  const { timeZone, timeFormat, rounding, fallback = "—" } = options;
  if (!date) {
    return fallback;
  }
  const rounded = roundTime(date, rounding) ?? date;
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: timeFormat === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: rounding === "none" ? "2-digit" : undefined,
    hour12: timeFormat !== "24h",
    timeZone
  });
  return formatter.format(rounded);
}

export function getActiveTimeZone(input?: string | null): string {
  return resolveTimeZone(input ?? undefined);
}
