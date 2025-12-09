import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getEvents, createEvent, respondToEvent, getParticipantSchedules } from '../utils/firebase.js';
import { checkParticipantConflicts, getConflictSeverity } from '../utils/conflictDetection.js';
import ConflictNotification from '../components/ConflictNotification.js';
import { EVENT_CATEGORIES, getCategoryById, getCategoryGradient } from '../utils/categories.js';

function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    participants: '',
    category: 'friends'
  });
  const [conflicts, setConflicts] = useState(null);
  const [participantEmails, setParticipantEmails] = useState({});
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const handleRespond = async (eventId, response) => {
    try {
      await respondToEvent(eventId, user.uid, response);
      await loadEvents();
      if (response === 'yes') {
        alert('You accepted. The event has been added to your calendar.');
      } else {
        alert('You declined the event.');
      }
    } catch (e) {
      console.error('Error responding to event:', e);
      alert('Failed to submit response. Please try again.');
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(user.uid, user.email);
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear conflicts when inputs change
    if (conflicts) {
      setConflicts(null);
    }
  };

  const handleCheckConflicts = async () => {
    if (!newEvent.date || !newEvent.time || !newEvent.participants) {
      alert('Please fill in date, time, and participants to check for conflicts.');
      return;
    }

    setCheckingConflicts(true);
    try {
      const participantsList = newEvent.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (participantsList.length === 0) {
        alert('Please add at least one participant email.');
        return;
      }

      // Get all participant schedules
      const schedulesData = await getParticipantSchedules(participantsList);

      // Build schedules map and email map for display
      const schedules = {};
      const emails = {};
      Object.entries(schedulesData).forEach(([userId, data]) => {
        schedules[userId] = data.schedule;
        emails[userId] = data.email;
      });

      // Check for conflicts
      const eventData = {
        date: newEvent.date,
        time: newEvent.time,
        duration: 1 // default 1 hour
      };

      const detectedConflicts = checkParticipantConflicts(eventData, schedules);
      setConflicts(detectedConflicts);
      setParticipantEmails(emails);

      if (Object.keys(detectedConflicts).length === 0) {
        alert('✅ No conflicts detected! All participants are available.');
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      alert('Error checking conflicts. Please try again.');
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Please fill in the title, date, and time.');
      return;
    }
    
    try {
      const participantsList = newEvent.participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        category: newEvent.category || 'friends',
        createdBy: user.uid,
        createdByEmail: user.email,
        participants: participantsList,
        responses: {},
        createdAt: new Date().toISOString()
      };
      
      await createEvent(eventData);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        participants: '',
        category: 'friends'
      });
      setConflicts(null);
      
      setShowCreateForm(false);
      await loadEvents();
      alert('Event created successfully!');
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="events-page">
        <h2>Events</h2>
        <p>Please sign in to view and manage events.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="events-page">
        <h2>Events</h2>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🎉 My Events</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Events you've created or been invited to participate in.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Create Event'}
        </button>
      </div>

      {/* Category Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>Filter by Category:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: categoryFilter === 'all' ? '#667eea' : '#e0e0e0',
              background: categoryFilter === 'all' ? '#667eea' : 'white',
              color: categoryFilter === 'all' ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            📋 All Events
          </button>
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: categoryFilter === cat.id ? cat.color : '#e0e0e0',
                background: categoryFilter === cat.id ? cat.color : 'white',
                color: categoryFilter === cat.id ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>📝 Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Team Meeting, Coffee Chat"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Time *</label>
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Category *</label>
              <select
                name="category"
                value={newEvent.category}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Add any additional details about the event..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Invite Participants (Email addresses)</label>
              <input
                type="text"
                name="participants"
                value={newEvent.participants}
                onChange={handleInputChange}
                placeholder="friend1@email.com, friend2@email.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>Separate multiple email addresses with commas</small>
            </div>
            
            {/* Check Conflicts Button */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleCheckConflicts}
                disabled={checkingConflicts}
                style={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  cursor: checkingConflicts ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                  opacity: checkingConflicts ? 0.6 : 1
                }}
              >
                {checkingConflicts ? '⏳ Checking...' : '🔍 Check for Conflicts'}
              </button>
            </div>

            {/* Conflict Notification */}
            {conflicts && Object.keys(conflicts).length > 0 && (
              <ConflictNotification
                conflicts={conflicts}
                participantEmails={participantEmails}
                severity={getConflictSeverity(Object.values(conflicts).flat())}
              />
            )}
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                🚀 Create Event
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: '#f5f5f5',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '60px 40px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
        }}>
          <h3 style={{ fontSize: '32px', marginBottom: '15px' }}>🎈 No events yet</h3>
          <p style={{ fontSize: '18px', margin: 0, opacity: 0.9 }}>
            Create your first event or wait for invitations from friends!
          </p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              ➕ Create Your First Event
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {events
            .filter(event => categoryFilter === 'all' || event.category === categoryFilter)
            .map(event => {
            const myResponse = event.responses ? event.responses[user.uid] : undefined;
            const isCreator = event.createdBy === user.uid;
            const isInvitee = !isCreator;
            const category = getCategoryById(event.category || 'friends');

            return (
              <div key={event.id} style={{
                background: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
              >
                {/* Category Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: category.color,
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}>
                  {category.icon} {category.label}
                </div>
                
                <h3 style={{ 
                  margin: '0 0 10px 0',
                  fontSize: '22px',
                  color: '#333',
                  borderBottom: `2px solid ${category.color}`,
                  paddingBottom: '10px'
                }}>
                  🎯 {event.title}
                </h3>
                {event.description && (
                  <p style={{ 
                    margin: '15px 0',
                    color: '#666',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}>
                    {event.description}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: '#f8f9ff',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <strong>Date:</strong> {event.date}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: '#f8f9ff',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>⏰</span>
                    <strong>Time:</strong> {event.time}
                  </div>
                  {event.participants && event.participants.length > 0 && (
                    <div style={{
                      padding: '10px',
                      background: '#f0f8f0',
                      borderRadius: '8px'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px' }}>👥</span> <strong>Participants:</strong>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {event.participants.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* RSVP Section */}
                  {isInvitee && (
                    <div style={{ marginTop: '10px' }}>
                      {myResponse === undefined ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleRespond(event.id, 'yes')}
                            style={{
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >✅ Yes</button>
                          <button
                            onClick={() => handleRespond(event.id, 'no')}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >❌ No</button>
                        </div>
                      ) : myResponse === 'yes' ? (
                        <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ You accepted</div>
                      ) : (
                        <div style={{ color: '#c62828', fontWeight: 'bold' }}>❌ You declined</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventsPage;