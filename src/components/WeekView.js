import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from 'date-fns';

function WeekView({ schedule = [], onTimeSlotClick, onEventClick, editable = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start on Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Generate time slots (6 AM to 11 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }
  
  const goToPreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };
  
  const handleTimeSlotClick = (date, hour) => {
    if (!editable || !onTimeSlotClick) return;
    onTimeSlotClick(date, hour);
  };
  
  const getEventsForDateAndHour = (date, hour) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.filter(event => {
      const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');
      const eventHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      
      return eventDate === dateStr && hour >= eventHour && hour < eventEndHour;
    });
  };
  
  const renderWeekHeader = () => {
    return (
      <div className="week-header">
        <button onClick={goToPreviousWeek} className="nav-button">&larr;</button>
        <h3>{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</h3>
        <button onClick={goToNextWeek} className="nav-button">&rarr;</button>
      </div>
    );
  };
  
  const renderDayHeaders = () => {
    return (
      <div className="day-headers">
        <div className="time-column-header"></div>
        {weekDays.map(day => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`day-header ${isToday ? 'today' : ''}`}>
              <div className="day-name">{format(day, 'EEE')}</div>
              <div className="day-number">{format(day, 'd')}</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderTimeGrid = () => {
    return (
      <div className="time-grid">
        {timeSlots.map(hour => (
          <div key={hour} className="time-row">
            <div className="time-label">
              {format(new Date().setHours(hour, 0), 'h:mm a').toLowerCase()}
            </div>
            {weekDays.map(day => {
              const events = getEventsForDateAndHour(day, hour);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={`time-slot ${isToday ? 'today' : ''} ${editable ? 'editable' : ''}`}
                  onClick={() => handleTimeSlotClick(day, hour)}
                >
                  {events.map(event => (
                    <div
                      key={event.id}
                      className={`time-block ${event.type}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventClick) onEventClick(event);
                      }}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="week-view">
      {renderWeekHeader()}
      {renderDayHeaders()}
      {renderTimeGrid()}
    </div>
  );
}

export default WeekView;