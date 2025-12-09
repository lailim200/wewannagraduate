import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { useAuth } from '../hooks/useAuth,js';

function CalendarPageNew() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState([
    // Sample data for testing
    {
      id: 'sample-1',
      title: 'Available for meetings',
      startTime: '09:00',
      endTime: '11:00',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'available'
    }
  ]);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
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

  const getEventsForDateAndHour = (date, hour) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.filter(event => {
      const eventHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      
      return event.date === dateStr && hour >= eventHour && hour < eventEndHour;
    });
  };

  if (!user) {
    return (
      <div className="calendar-page">
        <h2>Google Calendar Style Schedule</h2>
        <p>Please sign in to view and manage your schedule.</p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h2>Google Calendar Style Schedule</h2>
        <p>This is the new Google Calendar-style weekly view!</p>
      </div>
      
      <div className="week-view" style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: '0 1px 3px rgba(60, 64, 67, 0.3)'
      }}>
        
        {/* Week Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <button 
            onClick={goToPreviousWeek}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              color: '#5f6368'
            }}
          >
            ←
          </button>
          <h3 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 400,
            color: '#3c4043'
          }}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          <button 
            onClick={goToNextWeek}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '4px',
              color: '#5f6368'
            }}
          >
            →
          </button>
        </div>

        {/* Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '1px solid #e0e0e0',
          background: '#ffffff'
        }}>
          <div style={{
            borderRight: '1px solid #e0e0e0',
            background: '#fafafa'
          }}></div>
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} style={{
                padding: '12px 8px',
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: '#ffffff'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: isToday ? '#1a73e8' : '#70757a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px'
                }}>
                  {format(day, 'EEE')}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 400,
                  color: isToday ? 'white' : '#3c4043',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  background: isToday ? '#1a73e8' : 'transparent'
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div style={{
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {timeSlots.map(hour => (
            <div key={hour} style={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, 1fr)',
              borderBottom: '1px solid #f0f0f0',
              minHeight: '48px'
            }}>
              <div style={{
                padding: '2px 8px',
                fontSize: '10px',
                color: '#70757a',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                background: '#fafafa',
                fontWeight: 500
              }}>
                {format(new Date().setHours(hour, 0), 'h:mm a').toLowerCase()}
              </div>
              {weekDays.map(day => {
                const events = getEventsForDateAndHour(day, hour);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    style={{
                      borderRight: '1px solid #f0f0f0',
                      minHeight: '48px',
                      position: 'relative',
                      cursor: 'pointer',
                      background: isToday ? '#fff3e0' : 'white'
                    }}
                  >
                    {events.map(event => (
                      <div
                        key={event.id}
                        style={{
                          position: 'absolute',
                          left: '1px',
                          right: '1px',
                          top: '1px',
                          bottom: '1px',
                          borderRadius: '3px',
                          padding: '2px 6px',
                          color: 'white',
                          fontSize: '11px',
                          overflow: 'hidden',
                          borderLeft: '3px solid transparent',
                          fontWeight: 500,
                          background: event.type === 'available' ? '#137333' : 
                                   event.type === 'busy' ? '#d93025' : '#1a73e8',
                          borderLeftColor: event.type === 'available' ? '#0d5025' : 
                                         event.type === 'busy' ? '#a50e0e' : '#1557b0'
                        }}
                      >
                        <div style={{
                          fontWeight: 500,
                          marginBottom: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {event.title}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          opacity: 0.9
                        }}>
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
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#5f6368' }}>
        <p>🎉 This is the new Google Calendar-style weekly view!</p>
        <p>You can see a sample "Available for meetings" block for today.</p>
      </div>
    </div>
  );
}

export default CalendarPageNew;