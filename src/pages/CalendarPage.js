import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';

function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // THIS IS THE NEW GOOGLE CALENDAR IMPLEMENTATION!
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }
  
  const goToPreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🚫 REPLACED WITH NEW GOOGLE CALENDAR! 🚫</h2>
        <p>Please sign in to view your schedule.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center', background: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
        <h1>🎉 SUCCESS! GOOGLE CALENDAR STYLE LOADED! 🎉</h1>
        <p>This is the new weekly view - completely different from the old monthly grid!</p>
      </div>
      
      <div style={{
        background: 'white',
        border: '2px solid #1a73e8',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        
        {/* Week Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          background: '#1a73e8',
          color: 'white'
        }}>
          <button 
            onClick={goToPreviousWeek}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              padding: '10px 15px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >← Previous Week</button>
          
          <h2 style={{ margin: 0, fontSize: '24px' }}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          
          <button 
            onClick={goToNextWeek}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              padding: '10px 15px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >Next Week →</button>
        </div>

        {/* Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(7, 1fr)',
          background: '#f8f9fa',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div style={{ padding: '15px 10px', fontWeight: 'bold', background: '#e3f2fd' }}>TIME</div>
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} style={{
                padding: '15px 10px',
                textAlign: 'center',
                borderLeft: '1px solid #e0e0e0',
                background: isToday ? '#e8f5e8' : '#f8f9fa',
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? '#1a73e8' : '#333'
              }}>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                  {format(day, 'EEE').toUpperCase()}
                </div>
                <div style={{
                  fontSize: '20px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  background: isToday ? '#1a73e8' : 'transparent',
                  color: isToday ? 'white' : '#333'
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {timeSlots.map(hour => (
            <div key={hour} style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, 1fr)',
              minHeight: '60px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{
                padding: '5px 10px',
                fontSize: '11px',
                color: '#666',
                borderRight: '1px solid #e0e0e0',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                fontWeight: 'bold'
              }}>
                {format(new Date().setHours(hour, 0), 'h:mm a').toUpperCase()}
              </div>
              {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                const showSample = isToday && hour === 9; // Show sample event at 9 AM today
                
                return (
                  <div key={`${day.toISOString()}-${hour}`} style={{
                    borderLeft: '1px solid #f0f0f0',
                    minHeight: '60px',
                    position: 'relative',
                    background: isToday ? '#fff3e0' : 'white',
                    cursor: 'pointer'
                  }}>
                    {showSample && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        right: '2px',
                        bottom: '2px',
                        background: '#137333',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderLeft: '4px solid #0d5025',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                          📅 Available for Meetings
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>
                          9:00 AM - 10:00 AM
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', background: '#f0f8ff', padding: '15px', borderRadius: '8px' }}>
        <h3>🎯 This is the REAL Google Calendar Style!</h3>
        <p>✅ Weekly grid layout with time slots</p>
        <p>✅ Today highlighted in blue</p>
        <p>✅ Sample green "Available for Meetings" block at 9 AM today</p>
        <p>✅ Professional Google Calendar colors and styling</p>
      </div>
    </div>
  );
}

export default CalendarPage;