import { useMemo } from 'react';
import { getHolidayInfo } from '../utils/lunar_engine';
import { Solar } from 'lunar-javascript';

export const useWildmanCalendar = (selectedDate: Date) => {
  const holiday = useMemo(() => getHolidayInfo(selectedDate), [selectedDate]);

  // Get solar and lunar details for display
  const dateDetails = useMemo(() => {
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth() + 1;
    const day = selectedDate.getUTCDate();
    
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    return {
      solar: { year, month, day },
      lunar: {
        month: lunar.getMonth(),
        day: lunar.getDay(),
        year: lunar.getYearInGanZhi(),
        festival: lunar.getFestivals()[0] || '',
      },
    };
  }, [selectedDate]);

  return {
    ...dateDetails,
    holiday,
    isHoliday: !!holiday,
  };
};
