import { addMinutes, format } from "date-fns";
import { SettingsState } from "@stores/useSettings";

const DEG_PER_RAD = 180 / Math.PI;
const RAD_PER_DEG = Math.PI / 180;

function julianDay(date: Date): number {
  const time = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
  return time / 86400000 + 2440587.5;
}

function solarNoon(date: Date, longitude: number): number {
  const Jday = julianDay(date) - longitude / 360;
  const M = (357.5291 + 0.98560028 * (Jday - 2451545)) % 360;
  const C = 1.9148 * Math.sin(RAD_PER_DEG * M) +
    0.02 * Math.sin(RAD_PER_DEG * 2 * M) +
    0.0003 * Math.sin(RAD_PER_DEG * 3 * M);
  const L = (M + 102.9372 + C + 180) % 360;
  const Jtransit = 2451545 + Jday + 0.0053 * Math.sin(RAD_PER_DEG * M) - 0.0069 * Math.sin(RAD_PER_DEG * 2 * L);
  return Jtransit;
}

function hourAngle(lat: number, declination: number, altitude: number): number {
  const latRad = lat * RAD_PER_DEG;
  const decRad = declination * RAD_PER_DEG;
  const altRad = altitude * RAD_PER_DEG;
  const cosH = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  if (cosH <= -1) return Math.PI; // always above
  if (cosH >= 1) return 0; // always below
  return Math.acos(cosH);
}

function sunDeclination(date: Date): number {
  const Jday = julianDay(date) - 2451545;
  const M = RAD_PER_DEG * ((357.5291 + 0.98560028 * Jday) % 360);
  const C = 1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M);
  const lambda = RAD_PER_DEG * ((Math.atan2(Math.sin(M + C), Math.cos(M + C) + 0.91764 * Math.tan(RAD_PER_DEG * 23.44)) * DEG_PER_RAD + 280.1470 + C) % 360);
  return Math.asin(Math.sin(lambda) * Math.sin(RAD_PER_DEG * 23.44)) * DEG_PER_RAD;
}

function julianToDate(julian: number, timezone: string): Date {
  const unix = (julian - 2440587.5) * 86400000;
  const date = new Date(unix);
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return tzDate;
}

export interface ZmanimResult {
  sunrise: Date;
  sunset: Date;
  dawn: Date;
  nightfall: Date;
}

export function calculateZmanim(date: Date, settings: SettingsState): ZmanimResult {
  const { latitude, longitude, timezone } = settings.location;
  const decl = sunDeclination(date);
  const noon = solarNoon(date, longitude);
  const ha = hourAngle(latitude, decl, -0.833);
  const dayLength = (ha * 2) / (2 * Math.PI);
  const sunriseJulian = noon - dayLength;
  const sunsetJulian = noon + dayLength;

  const sunrise = julianToDate(sunriseJulian, timezone);
  const sunset = julianToDate(sunsetJulian, timezone);

  const dawn = addMinutes(sunrise, settings.zmanimOffsets.dawnOffsetMinutes);
  const nightfall = addMinutes(sunset, settings.zmanimOffsets.nightfallOffsetMinutes);

  return { sunrise, sunset, dawn, nightfall };
}

export function formatTime(date: Date, timezone: string): string {
  return format(new Date(date.toLocaleString("en-US", { timeZone: timezone })), "p");
}
