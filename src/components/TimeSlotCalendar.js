import React, { useState } from 'react';
import WeekView from './WeekView';
import AddTimeBlockModal from './AddTimeBlockModal';

function TimeSlotCalendar({ schedule = [], onScheduleChange, editable = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const handleTimeSlotClick = (date, hour) => {
    if (!editable) return;
    
    setSelectedDate(date);
    setSelectedHour(hour);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event) => {
    if (!editable) return;
    
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setSelectedHour(parseInt(event.startTime.split(':')[0]));
    setModalOpen(true);
  };

  const handleSaveTimeBlock = (timeBlock) => {
    if (!onScheduleChange) return;

    let updatedSchedule;
    
    if (editingEvent) {
      // Update existing event
      updatedSchedule = schedule.map(event => 
        event.id === editingEvent.id ? timeBlock : event
      );
    } else {
      // Add new event
      updatedSchedule = [...schedule, timeBlock];
    }

    onScheduleChange(updatedSchedule);
  };

  const handleDeleteEvent = (eventId) => {
    if (!onScheduleChange) return;
    
    const updatedSchedule = schedule.filter(event => event.id !== eventId);
    onScheduleChange(updatedSchedule);
  };

  return (
    <div className="time-slot-calendar">
      <div style={{padding: '10px', backgroundColor: '#e3f2fd', marginBottom: '10px', borderRadius: '4px'}}>
        ✅ Google Calendar Style Time Slot Calendar Loaded!
      </div>
      <div className="calendar-toolbar">
        <div className="view-options">
          <span className="view-title">Week View</span>
        </div>
        
        {editable && (
          <div className="calendar-actions">
            <button 
              className="add-event-button"
              onClick={() => {
                setSelectedDate(new Date());
                setSelectedHour(9);
                setEditingEvent(null);
                setModalOpen(true);
              }}
            >
              + Add Time Block
            </button>
          </div>
        )}
      </div>

      <WeekView
        schedule={schedule}
        onTimeSlotClick={handleTimeSlotClick}
        onEventClick={handleEventClick}
        editable={editable}
      />

      <AddTimeBlockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTimeBlock}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        editingEvent={editingEvent}
      />

      {editable && editingEvent && (
        <div className="event-actions">
          <button 
            className="delete-event-button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this time block?')) {
                handleDeleteEvent(editingEvent.id);
                setModalOpen(false);
              }
            }}
          >
            Delete Event
          </button>
        </div>
      )}
    </div>
  );
}

export default TimeSlotCalendar;