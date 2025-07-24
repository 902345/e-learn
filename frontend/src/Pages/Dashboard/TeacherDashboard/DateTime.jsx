import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setHours, setMinutes, format, addDays } from 'date-fns';

const DateTime = ({ setDate, allowedDays }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  
  const isAllowedDate = (date) => {
    // Check if the date's day is in the allowedDays array
    return allowedDays.some((allowedDay) => allowedDay.day === date.getDay());
  };

  const isAllowedTime = (date) => {
    const allowedDay = allowedDays.find((day) => day.day === date.getDay());
    if (!allowedDay) return false;

    const minutes = date.getHours() * 60 + date.getMinutes();
    return minutes >= allowedDay.starttime && minutes <= allowedDay.endtime - 60;
  };

  const filterTime = (time) => {
    return isAllowedTime(time);
  };

  // Get dynamic min and max times based on selected date
  const getTimeRange = (date) => {
    if (!date) return { minTime: setHours(setMinutes(new Date(), 0), 0), maxTime: setHours(setMinutes(new Date(), 0), 23) };
    
    const allowedDay = allowedDays.find((day) => day.day === date.getDay());
    if (!allowedDay) return { minTime: setHours(setMinutes(new Date(), 0), 0), maxTime: setHours(setMinutes(new Date(), 0), 23) };

    const startHour = Math.floor(allowedDay.starttime / 60);
    const startMinute = allowedDay.starttime % 60;
    const endHour = Math.floor(allowedDay.endtime / 60);
    const endMinute = allowedDay.endtime % 60;

    return {
      minTime: setHours(setMinutes(new Date(), startMinute), startHour),
      maxTime: setHours(setMinutes(new Date(), endMinute), endHour)
    };
  };

  const timeRange = getTimeRange(selectedDate);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
      console.log('Selected Date and Time:', formattedDate.slice(0, 19) + 'Z');
      setDate(formattedDate.slice(0, 19) + 'Z');
    }
  }, [selectedDate, setDate]);

  return (
    <div className="datetime-picker">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        filterDate={isAllowedDate}
        showTimeSelect
        timeIntervals={15}
        timeFormat="HH:mm"
        minTime={timeRange.minTime}
        maxTime={timeRange.maxTime}
        filterTime={filterTime}
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText="Select a date and time"
        minDate={new Date()} // Prevent selecting past dates
        maxDate={addDays(new Date(), 90)} // Limit to 90 days in future
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        wrapperClassName="w-full"
      />
      
      {/* Helper text showing available days */}
      {allowedDays && allowedDays.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Available days:</p>
          <ul className="list-disc list-inside">
            {allowedDays.map((day, index) => {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const startHour = Math.floor(day.starttime / 60);
              const startMinute = day.starttime % 60;
              const endHour = Math.floor(day.endtime / 60);
              const endMinute = day.endtime % 60;
              
              return (
                <li key={index}>
                  {dayNames[day.day]}: {startHour.toString().padStart(2, '0')}:{startMinute.toString().padStart(2, '0')} - {endHour.toString().padStart(2, '0')}:{endMinute.toString().padStart(2, '0')}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DateTime;