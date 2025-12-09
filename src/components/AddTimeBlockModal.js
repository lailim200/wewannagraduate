import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function AddTimeBlockModal({ isOpen, onClose, onSave, selectedDate, selectedHour, editingEvent = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'available' // 'available', 'busy', 'custom'
  });

  useEffect(() => {
    if (isOpen) {
      const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      if (editingEvent) {
        // Editing existing event
        setFormData({
          title: editingEvent.title || '',
          description: editingEvent.description || '',
          date: editingEvent.date || dateStr,
          startTime: editingEvent.startTime || '',
          endTime: editingEvent.endTime || '',
          type: editingEvent.type || 'available'
        });
      } else {
        // Creating new event
        const startTime = selectedHour ? `${selectedHour.toString().padStart(2, '0')}:00` : '09:00';
        const endTime = selectedHour ? `${(selectedHour + 1).toString().padStart(2, '0')}:00` : '10:00';
        
        setFormData({
          title: '',
          description: '',
          date: dateStr,
          startTime,
          endTime,
          type: 'available'
        });
      }
    }
  }, [isOpen, selectedHour, editingEvent, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title for your time block');
      return;
    }

    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      alert('End time must be after start time');
      return;
    }

    const timeBlock = {
      ...formData,
      date: formData.date,
      id: editingEvent ? editingEvent.id : `${Date.now()}-${Math.random()}`,
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
    };

    onSave(timeBlock);
    onClose();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'available': return '#4CAF50';
      case 'busy': return '#F44336';
      case 'custom': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingEvent ? 'Edit Time Block' : 'Add Time Block'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Available for meetings, Gym time, etc."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description or notes"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-preview">
            <div className="preview-label">Preview:</div>
            <div 
              className="time-block-preview"
              style={{ backgroundColor: getTypeColor(formData.type) }}
            >
              <div className="event-title">{formData.title || 'Time Block Title'}</div>
              <div className="event-time">
                {formData.startTime} - {formData.endTime}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {editingEvent ? 'Update' : 'Save'} Time Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTimeBlockModal;