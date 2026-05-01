
import { getHolidayInfo } from './src/utils/lunar_engine';

const testDates = [
  new Date(2026, 4, 1), // May 1, 2026
  new Date(2026, 0, 1), // Jan 1, 2026
  new Date(2026, 11, 25), // Dec 25, 2026
];

testDates.forEach(d => {
  console.log(`Date: ${d.toDateString()} -> Holiday:`, getHolidayInfo(d));
});
