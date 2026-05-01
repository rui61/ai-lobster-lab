import { Solar, Lunar } from 'lunar-javascript';
import usHolidays from '../data/us_holidays.json';
import { getDay, getMonth, getDate, format } from 'date-fns';

export type HolidayType = 'CN' | 'US' | 'BOTH';

export interface HolidayInfo {
  name: string;
  type: HolidayType;
  isLunar: boolean;
}

export const getHolidayInfo = (date: Date): HolidayInfo | null => {
  // 1. Work in UTC to prevent timezone jumping
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));

  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  let cnHoliday: string | null = null;
  let usHoliday: string | null = null;

  // --- Chinese Holidays ---
  // Fixed Solar Holidays
  const cnFixedSolar: Record<string, string> = {
    '01-01': '元旦 (New Year\'s Day)',
    '05-01': '劳动节 (Labor Day)',
    '10-01': '国庆节 (National Day)',
  };
  cnHoliday = cnFixedSolar[dateStr] || null;

  // Lunar Holidays (Dynamic)
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  
  // Use lunar-javascript to check for major festivals
  // Note: lunar.getFestival() returns the festival name if it's a festival day
  const festival = lunar.getFestival();
  if (festival) {
    cnHoliday = festival;
  }

  // --- US Holidays ---
  // Fixed Solar
  usHoliday = usHolidays.fixed[dateStr] || null;

  // Variable US Holidays (Simplified calculation for this component)
  if (!usHoliday) {
    const dayOfWeek = utcDate.getUTCDay(); // 0: Sun, 1: Mon...
    const monthIdx = utcDate.getUTCMonth();
    
    // MLK: 3rd Monday of Jan
    if (monthIdx === 0 && dayOfWeek === 1 && day > 14 && day <= 21) usHoliday = usHolidays.variable.MLK;
    // Presidents: 3rd Monday of Feb
    if (monthIdx === 1 && dayOfWeek === 1 && day > 14 && day <= 21) usHoliday = usHolidays.variable.Presidents;
    // Memorial: Last Monday of May
    if (monthIdx === 4 && dayOfWeek === 1 && day > 24) usHoliday = usHolidays.variable.Memorial;
    // Labor: 1st Monday of Sept
    if (monthIdx === 8 && dayOfWeek === 1 && day <= 7) usHoliday = usHolidays.variable.Labor;
    // Columbus: 2nd Monday of Oct
    if (monthIdx === 9 && dayOfWeek === 1 && day > 7 && day <= 14) usHoliday = usHolidays.variable.Columbus;
    // Thanksgiving: 4th Thursday of Nov
    if (monthIdx === 10 && dayOfWeek === 4 && day > 21 && day <= 28) usHoliday = usHolidays.variable.Thanksgiving;
  }

  if (cnHoliday && usHoliday) return { name: `${cnHoliday} / ${usHoliday}`, type: 'BOTH', isLunar: lunar.isFestival() };
  if (cnHoliday) return { name: cnHoliday, type: 'CN', isLunar: lunar.isFestival() };
  if (usHoliday) return { name: usHoliday, type: 'US', isLunar: false };

  return null;
};
