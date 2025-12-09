import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';
import { getSchedule, saveScheduleItem, deleteScheduleItem } from '../utils/firebase.js';
import AddTimeBlockModal from '../components/AddTimeBlockModal.js';

function CalendarPageFinal() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // UI for adding Activities via + button
  const [showActions, setShowActions] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityDefaults, setActivityDefaults] = useState({ date: new Date(), hour: 9 });
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const timeSlots = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(hour);
  }

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await getSchedule(user.uid);
      setSchedule(data || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotId = (day, hour) => `${format(day, 'yyyy-MM-dd')}-${hour}`;
  
  const getSlotType = (day, hour) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const items = schedule.filter(item =>
      item.date === dateStr && item.startHour <= hour && item.endHour > hour
    );
    if (items.some(i => i.type === 'event')) return 'event';
    if (items.some(i => i.type === 'activity')) return 'activity';
    if (items.some(i => i.type === 'available')) return 'available';
    return null;
  };

  const handleSlotClick = (day, hour) => {
    const slotId = getSlotId(day, hour);
    const slotType = getSlotType(day, hour);
    const dateString = format(day, 'EEEE, MMMM d');
    const timeString = format(new Date().setHours(hour, 0), 'h:mm a');

    // Do not allow selecting over existing events
    if (slotType === 'event') {
      setAnnouncement(`Cannot select ${dateString} at ${timeString}. You have an existing event scheduled here.`);
      alert('⚠️ Cannot select this time slot - you have an existing event scheduled here.');
      return;
    }

    // Warn if selecting over activities
    if (slotType === 'activity') {
      const confirmed = window.confirm('⚠️ You have an activity scheduled at this time. Do you want to select it anyway?');
      if (!confirmed) return;
    }

    const newSelected = new Set(selectedSlots);
    if (selectedSlots.has(slotId)) {
      newSelected.delete(slotId);
      setAnnouncement(`Unselected ${dateString} at ${timeString}`);
    } else {
      newSelected.add(slotId);
      setAnnouncement(`Selected ${dateString} at ${timeString}`);
    }
    setSelectedSlots(newSelected);
  };

  const saveSelectedSlots = async () => {
    if (selectedSlots.size === 0) return;
    
    try {
      const slotsToSave = Array.from(selectedSlots).map(slotId => {
        const [date, hour] = slotId.split('-');
        return {
          date,
          startHour: parseInt(hour),
          endHour: parseInt(hour) + 1,
          title: 'Available',
          type: 'available'
        };
      });
      
      for (const slot of slotsToSave) {
        await saveScheduleItem(user.uid, {
          id: `${slot.date}-${slot.startHour}-${Date.now()}`,
          ...slot
        });
      }
      
      await loadSchedule();
      setSelectedSlots(new Set());
      setAnnouncement(`Successfully saved ${slotsToSave.length} time slots as available`);
      alert('Availability saved!');
    } catch (error) {
      console.error('Error saving slots:', error);
      setAnnouncement('Error saving availability. Please try again.');
      alert('Error saving availability. Please try again.');
    }
  };

  const clearSelectedSlots = () => {
    setSelectedSlots(new Set());
  };

  // Save activity from modal
  const handleSaveActivity = async (timeBlock) => {
    try {
      const [startH] = timeBlock.startTime.split(':');
      const [endH] = timeBlock.endTime.split(':');
      const payload = {
        date: timeBlock.date,
        startHour: parseInt(startH, 10),
        endHour: parseInt(endH, 10),
        title: timeBlock.title,
        description: timeBlock.description || '',
        type: 'activity'
      };
      await saveScheduleItem(user.uid, { id: `${payload.date}-${payload.startHour}-${Date.now()}`, ...payload });
      await loadSchedule();
    } catch (e) {
      console.error('Error saving activity:', e);
      alert('Failed to save activity');
    }
  };
  
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#ffebee' }}>
        <h2>🔐 Please Sign In</h2>
        <p>You need to sign in to view your calendar.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading your schedule...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {announcement}
      </div>
      
      {/* CONTROL BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          📅 Click Time Slots to Mark Your Availability!
        </h1>
        <p style={{ margin: '0 0 15px 0', fontSize: '16px', opacity: 0.9 }}>
          Select time slots when you're available, then click Save to store your schedule.
        </p>
        
        {selectedSlots.size > 0 && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={saveSelectedSlots}
              aria-label={`Save ${selectedSlots.size} selected time slots as available`}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              💾 Save {selectedSlots.size} Selected Slots
            </button>
            <button
              onClick={() => {
                clearSelectedSlots();
                setAnnouncement(`Cleared ${selectedSlots.size} selected time slots`);
              }}
              aria-label="Clear all selected time slots"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🗑️ Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* MAIN CALENDAR */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e1e1e1',
        position: 'relative'
      }}>
        
        {/* Floating + button (edge) */}
        <div style={{ position: 'absolute', right: 20, bottom: 20, zIndex: 5 }}>
          <button
            onClick={() => setShowActions(v => !v)}
            aria-label="Add"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976D2, #0D47A1)',
              color: 'white',
              border: 'none',
              boxShadow: '0 6px 18px rgba(13, 71, 161, 0.35)',
              fontSize: 28,
              cursor: 'pointer'
            }}
          >
            +
          </button>

          {showActions && (
            <div style={{
              position: 'absolute',
              right: 0,
              bottom: 70,
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              minWidth: 180
            }}>
              <button
                onClick={() => {
                  setShowActions(false);
                  setActivityDefaults({ date: currentDate, hour: 9 });
                  setShowActivityModal(true);
                }}
                style={{
                  display: 'flex',
                  width: '100%',
                  gap: 10,
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 18 }}>📝</span>
                <span style={{ fontWeight: 600 }}>Activities</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Week Navigation Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2196F3, #1976D2)',
          color: 'white',
          padding: '20px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button 
            onClick={() => {
              setCurrentDate(addDays(currentDate, -7));
              setAnnouncement(`Navigated to week of ${format(addDays(currentDate, -7), 'MMMM d, yyyy')}`);
            }}
            aria-label="Go to previous week"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ⬅️ Previous Week
          </button>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600',
            textAlign: 'center',
            flex: 1
          }}>
            📅 {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          
          <button 
            onClick={() => {
              setCurrentDate(addDays(currentDate, 7));
              setAnnouncement(`Navigated to week of ${format(addDays(currentDate, 7), 'MMMM d, yyyy')}`);
            }}
            aria-label="Go to next week"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Next Week ➡️
          </button>
        </div>

        {/* Days of Week Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px repeat(7, 1fr)',
          background: '#fafafa',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div style={{
            padding: '20px 15px',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#666',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ⏰ TIME
          </div>
          
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} style={{
                padding: '20px 15px',
                textAlign: 'center',
                borderLeft: '1px solid #e0e0e0',
                background: isToday ? '#e3f2fd' : '#fafafa'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isToday ? '#1976d2' : '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  {format(day, 'EEE')}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: isToday ? 'white' : '#333',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  background: isToday ? '#2196F3' : 'transparent',
                  border: isToday ? '2px solid #1976d2' : '2px solid transparent'
                }}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots Grid */}
        <div style={{
          maxHeight: '500px',
          overflowY: 'auto',
          background: 'white'
        }}>
          {timeSlots.map(hour => (
            <div key={hour} style={{
              display: 'grid',
              gridTemplateColumns: '100px repeat(7, 1fr)',
              minHeight: '60px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              {/* Time Label */}
              <div style={{
                padding: '8px 15px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#666',
                background: '#fafafa',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                textAlign: 'right'
              }}>
                {format(new Date().setHours(hour, 0), 'h:mm a').toUpperCase()}
              </div>
              
              {/* Time Slots for Each Day */}
              {weekDays.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const slotId = getSlotId(day, hour);
                const isSelected = selectedSlots.has(slotId);
                const slotType = getSlotType(day, hour);
                const isAvailable = slotType === 'available';
                const isEvent = slotType === 'event';
                const isActivity = slotType === 'activity';
                
                let backgroundColor = 'white';
                if (isToday) backgroundColor = '#fff8e1';
                if (isSelected) backgroundColor = '#e3f2fd';
                if (isAvailable) backgroundColor = '#e8f5e8';
                if (isEvent) backgroundColor = '#f3e5f5';
                if (isActivity) backgroundColor = '#e0f7fa';
                
                const dateString = format(day, 'EEEE, MMMM d');
                const timeString = format(new Date().setHours(hour, 0), 'h:mm a');
                const statusLabel = isEvent ? 'Event scheduled - cannot select' : isActivity ? 'Activity scheduled' : isAvailable ? 'Available' : isSelected ? 'Selected' : 'Empty';
                const ariaLabel = `${dateString} at ${timeString} - ${statusLabel}`;
                
                return (
                  <div 
                    key={`${day.toISOString()}-${hour}`} 
                    onClick={() => handleSlotClick(day, hour)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSlotClick(day, hour);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    aria-pressed={isSelected}
                    aria-disabled={isEvent}
                    style={{
                      borderLeft: '1px solid #f0f0f0',
                      minHeight: '60px',
                      position: 'relative',
                      background: backgroundColor,
                      cursor: slotType === 'event' ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                      border: isSelected ? '2px solid #2196F3' : isAvailable ? '2px solid #4CAF50' : isEvent ? '2px solid #8e24aa' : isActivity ? '2px solid #00838f' : '1px solid transparent'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected && !isAvailable) {
                        e.target.style.background = isToday ? '#ffecb3' : '#f5f5f5';
                      }
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = backgroundColor;
                    }}
                  >
                    {/* Available Time Block */}
                    {isAvailable && (
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderLeft: '4px solid #2e7d32',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          marginBottom: '2px',
                          fontSize: '13px'
                        }}>
                          ✅ Available
                        </div>
                        <div style={{
                          fontSize: '11px',
                          opacity: 0.9
                        }}>
                          {format(new Date().setHours(hour, 0), 'h:mm a')}
                        </div>
                      </div>
                    )}

                    {/* Event Time Block */}
                    {isEvent && (
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        background: 'linear-gradient(135deg, #8e24aa, #6a1b9a)',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderLeft: '4px solid #4a148c',
                        boxShadow: '0 2px 8px rgba(142, 36, 170, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          📅 Event
                        </div>
                        <div style={{
                          fontSize: '10px',
                          marginTop: '2px',
                          opacity: 0.8
                        }}>
                          🔒 Locked
                        </div>
                      </div>
                    )}
                    {/* Activity Time Block */}
                    {isActivity && (
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        background: 'linear-gradient(135deg, #26c6da, #0097a7)',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderLeft: '4px solid #006064',
                        boxShadow: '0 2px 8px rgba(0, 151, 167, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          📝 Activity
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Time Block */}
                    {isSelected && !isAvailable && !isEvent && !isActivity && (
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: 'white',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderLeft: '4px solid #1565C0',
                        boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}>
                          📌 Selected
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

      {/* Instructions */}
      <div style={{
        marginTop: '30px',
        padding: '25px',
        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
        borderRadius: '12px',
        border: '1px solid #2196F3'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#1565c0',
          fontSize: '20px',
          textAlign: 'center'
        }}>
          🎯 How to Use Your Interactive Calendar
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>🔵 <strong>Click time slots</strong> to select when you're available</div>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>🟢 <strong>Green blocks</strong> show your saved availability</div>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>🟦 <strong>Blue blocks</strong> show currently selected slots</div>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>💾 <strong>Save button</strong> appears when you select slots</div>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>⬅️➡️ <strong>Navigate weeks</strong> with Previous/Next buttons</div>
          <div style={{ color: '#1565c0', fontSize: '14px' }}>📅 <strong>Today</strong> is highlighted in yellow background</div>
        </div>
      </div>

      {/* Activity Modal */}
      <AddTimeBlockModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={handleSaveActivity}
        selectedDate={activityDefaults.date}
        selectedHour={activityDefaults.hour}
      />
    </div>
  );
}

export default CalendarPageFinal;
