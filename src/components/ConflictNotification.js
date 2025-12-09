import React from 'react';

const ConflictNotification = ({ conflicts, participantEmails = {}, severity = 'warning' }) => {
  if (!conflicts || Object.keys(conflicts).length === 0) {
    return null;
  }

  const getColor = () => {
    switch (severity) {
      case 'error':
        return { bg: '#ffebee', border: '#f44336', text: '#c62828' };
      case 'warning':
        return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' };
      default:
        return { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' };
    }
  };

  const colors = getColor();

  return (
    <div
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '24px', marginRight: '10px' }}>
          {severity === 'error' ? '⚠️' : '⏰'}
        </span>
        <h3 style={{ margin: 0, color: colors.text, fontSize: '18px', fontWeight: 'bold' }}>
          {severity === 'error' ? 'Scheduling Conflicts Detected!' : 'Potential Scheduling Conflicts'}
        </h3>
      </div>

      <div style={{ color: colors.text, fontSize: '14px', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '10px', fontWeight: '600' }}>
          The following participants have conflicting plans at this time:
        </p>

        {Object.entries(conflicts).map(([userId, userConflicts]) => {
          const email = participantEmails[userId] || userId;
          return (
            <div
              key={userId}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                borderLeft: `4px solid ${colors.border}`,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>
                👤 {email}
              </div>
              {userConflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '13px',
                    marginLeft: '20px',
                    color: '#666',
                    marginTop: '4px',
                  }}
                >
                  • {conflict.title || 'Busy'} ({conflict.startHour}:00 - {conflict.endHour}:00)
                  {conflict.type && (
                    <span
                      style={{
                        marginLeft: '8px',
                        padding: '2px 8px',
                        background: conflict.type === 'event' ? '#f3e5f5' : '#e0f7fa',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {conflict.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {severity === 'error' ? (
          <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>
            ❌ Cannot create event - participants have existing event commitments at this time.
          </p>
        ) : (
          <p style={{ marginTop: '15px', fontSize: '13px', fontStyle: 'italic' }}>
            💡 You can still create the event, but participants may need to reschedule their plans.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConflictNotification;
