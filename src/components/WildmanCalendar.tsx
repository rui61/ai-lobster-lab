import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useWildmanCalendar } from '../hooks/useWildmanCalendar';
import { getHolidayInfo } from '../utils/lunar_engine';

type DisplayMode = 'CN' | 'US' | 'BOTH';

const WildmanCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState<DisplayMode>('BOTH');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const renderDay = (day: Date) => {
    // We create a small inner component or hook call per day
    // To avoid re-creating hooks in a loop, we'll just use the engine directly for the grid
    // but the selected date will use the hook.
    return <DayCell key={day.toISOString()} day={day} selectedDate={selectedDate} setSelectedDate={setSelectedDate} mode={mode} />;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-12 bg-wildman-bg text-white">
      <div className="w-full max-w-4xl bg-wildman-card p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold w-48 text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              →
            </button>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['CN', 'US', 'BOTH'] as DisplayMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-wildman-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'CN' ? '中国节日' : m === 'US' ? '美国节日' : '双向显示'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-slate-500 font-semibold text-sm py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(renderDay)}
        </div>

        <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <CalendarDetails date={selectedDate} />
        </div>
      </div>
    </div>
  );
};

const DayCell: React.FC<{ day: Date, selectedDate: Date, setSelectedDate: (d: Date) => void, mode: DisplayMode }> = ({ day, selectedDate, setSelectedDate, mode }) => {
  // We use the logic engine directly here for performance
  const holiday = getHolidayInfo(day);
  
  const isSelected = isSameDay(day, selectedDate);
  
  let bgColor = 'bg-slate-800/40';
  let textColor = 'text-slate-400';
  let border = 'border-transparent';

  if (holiday) {
    if (mode === 'CN' && holiday.type === 'CN') {
      bgColor = 'bg-red-900/30';
      textColor = 'text-cn-holiday';
      border = 'border-cn-holiday/50';
    } else if (mode === 'US' && holiday.type === 'US') {
      bgColor = 'bg-blue-900/30';
      textColor = 'text-us-holiday';
      border = 'border-us-holiday/50';
    } else if (mode === 'BOTH') {
      if (holiday.type === 'CN') {
        bgColor = 'bg-red-900/30';
        textColor = 'text-cn-holiday';
        border = 'border-cn-holiday/50';
      } else if (holiday.type === 'US') {
        bgColor = 'bg-blue-900/30';
        textColor = 'text-us-holiday';
        border = 'border-us-holiday/50';
      } else if (holiday.type === 'BOTH') {
        bgColor = 'bg-purple-900/30';
        textColor = 'text-purple-400';
        border = 'border-purple-400/50';
      }
    }
  }

  if (isSelected) {
    bgColor = 'bg-wildman-accent';
    textColor = 'text-white';
    border = 'border-white';
  }

  return (
    <div 
      onClick={() => setSelectedDate(day)}
      className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all border ${bgColor} ${textColor} ${border} ${isSelected ? 'scale-110 shadow-xl' : 'hover:scale-105 hover:bg-slate-700'}`}
    >
      <span className="text-lg font-medium">{format(day, 'd')}</span>
      {holiday && (
        <div className={`w-1 h-1 rounded-full mt-1 ${holiday.type === 'CN' ? 'bg-cn-gold' : 'bg-us-white'}`} />
      )}
    </div>
  );
};

const CalendarDetails: React.FC<{ date: Date }> = ({ date }) => {
  const { lunar, holiday, isHoliday } = useWildmanCalendar(date);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Selected Date</div>
        <div className="text-xl font-bold">
          {format(date, 'PPPP')} 
          <span className="ml-3 text-slate-500 font-normal">
            ({lunar.month}月{lunar.day}日 {lunar.year})
          </span>
        </div>
      </div>
      
      {isHoliday && (
        <div className={`px-4 py-2 rounded-full border text-sm font-bold animate-pulse ${
          holiday?.type === 'CN' ? 'bg-red-900/20 border-cn-holiday text-cn-holiday' : 
          holiday?.type === 'US' ? 'bg-blue-900/20 border-us-holiday text-us-holiday' : 
          'bg-purple-900/20 border-purple-400 text-purple-400'
        }`}>
          🎉 {holiday?.name}
        </div>
      )}
    </div>
  );
};

export default WildmanCalendar;
