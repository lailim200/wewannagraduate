import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { addFriendByEmail, listFriends, getSchedule } from '../utils/firebase.js';
import WeekView from '../components/WeekView.js';
import { FRIEND_CATEGORIES, getCategoryById } from '../utils/categories.js';

function FriendsPage() {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendCategory, setFriendCategory] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendSchedule, setFriendSchedule] = useState([]);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const data = await listFriends(user.uid);
        setFriends(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const loadFriendSchedule = async (friend) => {
    setSelectedFriend(friend);
    try {
      const items = await getSchedule(friend.friendId);
      const mapped = (items || []).map(item => ({
        id: item.id,
        date: item.date,
        startTime: `${String(item.startHour).padStart(2,'0')}:00`,
        endTime: `${String(item.endHour).padStart(2,'0')}:00`,
        title: item.title || (item.type === 'available' ? 'Available' : item.type === 'event' ? 'Event' : 'Activity'),
        type: item.type || 'available'
      }));
      setFriendSchedule(mapped);
    } catch (e) {
      console.error('Failed to load friend schedule', e);
      setFriendSchedule([]);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;
    setSaving(true);
    try {
      await addFriendByEmail(user.uid, friendEmail.trim(), friendCategory);
      const data = await listFriends(user.uid);
      setFriends(data);
      setFriendEmail('');
      setFriendCategory('friends');
      alert('Friend added. If you do not see their calendar, ask them to sign in at least once.');
    } catch (e) {
      alert(e.message || 'Failed to add friend');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Friends' Calendars</h2>
        <p>Please sign in to manage and view shared calendars.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        background: 'linear-gradient(135deg, #43cea2, #185a9d)',
        color: 'white',
        padding: 24,
        borderRadius: 12
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Friends' Calendars</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Add friends by email and view their shared calendars</p>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Add New Friend</h3>
        <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
            <input
              type="email"
              placeholder="friend@example.com"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: '16px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Category</label>
            <select
              value={friendCategory}
              onChange={(e) => setFriendCategory(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '2px solid #e0e0e0', fontSize: '16px', background: 'white' }}
            >
              {FRIEND_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: '#185a9d',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {saving ? 'Adding...' : '➕ Add'}
          </button>
        </form>
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
        <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>Filter Friends:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: categoryFilter === 'all' ? '#185a9d' : '#e0e0e0',
              background: categoryFilter === 'all' ? '#185a9d' : 'white',
              color: categoryFilter === 'all' ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            📊 All Friends
          </button>
          {FRIEND_CATEGORIES.map(cat => (
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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Friends list */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>My Friends</h3>
          {loading ? (
            <p>Loading friends...</p>
          ) : friends.length === 0 ? (
            <p>No friends yet. Add by email above.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {friends
                .filter(f => categoryFilter === 'all' || f.category === categoryFilter)
                .map(f => {
                const category = getCategoryById(f.category || 'friends', FRIEND_CATEGORIES);
                return (
                <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: category.color,
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {category.icon} {category.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{f.friendEmail}</div>
                  </div>
                  <button
                    onClick={() => loadFriendSchedule(f)}
                    style={{ padding: '8px 12px', background: '#43cea2', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    View
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Friend calendar */}
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16 }}>
          {selectedFriend ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Calendar: {selectedFriend.friendEmail}</h3>
                <button onClick={() => setSelectedFriend(null)} style={{ background: 'transparent', border: '1px solid #e0e0e0', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>Close</button>
              </div>
              <WeekView schedule={friendSchedule} editable={false} />
            </>
          ) : (
            <p>Select a friend to view their calendar.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;