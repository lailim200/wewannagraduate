/**
 * Conflict Detection Utilities
 * Prevents double-booking and detects scheduling conflicts
 */

/**
 * Check if two time ranges overlap
 * @param {Object} timeSlot1 - First time slot {date, startHour, endHour}
 * @param {Object} timeSlot2 - Second time slot {date, startHour, endHour}
 * @returns {boolean} - True if times overlap
 */
export const hasTimeConflict = (timeSlot1, timeSlot2) => {
  // Must be same date
  if (timeSlot1.date !== timeSlot2.date) {
    return false;
  }

  // Check if time ranges overlap
  // Times overlap if: start1 < end2 AND start2 < end1
  const start1 = timeSlot1.startHour;
  const end1 = timeSlot1.endHour;
  const start2 = timeSlot2.startHour;
  const end2 = timeSlot2.endHour;

  return start1 < end2 && start2 < end1;
};

/**
 * Convert time string (HH:MM) to hour number
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Hour as number
 */
export const timeStringToHour = (timeString) => {
  if (!timeString) return 0;
  const [hour] = timeString.split(':');
  return parseInt(hour, 10);
};

/**
 * Check if a new event conflicts with existing schedule
 * @param {Object} newEvent - New event {date, time or startHour, duration}
 * @param {Array} existingSchedule - Array of existing schedule items
 * @returns {Array} - Array of conflicting items
 */
export const findScheduleConflicts = (newEvent, existingSchedule) => {
  if (!newEvent || !existingSchedule) return [];

  const newEventStartHour = newEvent.startHour ?? timeStringToHour(newEvent.time);
  const newEventEndHour = newEvent.endHour ?? newEventStartHour + (newEvent.duration || 1);

  const conflicts = existingSchedule.filter(item => {
    if (item.date !== newEvent.date) return false;

    const itemStartHour = item.startHour;
    const itemEndHour = item.endHour;

    // Check overlap
    return newEventStartHour < itemEndHour && itemStartHour < newEventEndHour;
  });

  return conflicts;
};

/**
 * Check if any participants have conflicts
 * @param {Object} newEvent - New event data
 * @param {Array} participantsSchedules - Map of {userId: schedule[]}
 * @returns {Object} - Map of {userId: conflicts[]}
 */
export const checkParticipantConflicts = (newEvent, participantsSchedules) => {
  const conflictsByUser = {};

  Object.keys(participantsSchedules).forEach(userId => {
    const schedule = participantsSchedules[userId];
    const conflicts = findScheduleConflicts(newEvent, schedule);
    
    if (conflicts.length > 0) {
      conflictsByUser[userId] = conflicts;
    }
  });

  return conflictsByUser;
};

/**
 * Format conflict information for display
 * @param {Array} conflicts - Array of conflicting schedule items
 * @returns {string} - Human-readable conflict description
 */
export const formatConflictMessage = (conflicts) => {
  if (!conflicts || conflicts.length === 0) {
    return 'No conflicts';
  }

  if (conflicts.length === 1) {
    const conflict = conflicts[0];
    return `${conflict.title || 'Busy'} (${conflict.startHour}:00 - ${conflict.endHour}:00)`;
  }

  return `${conflicts.length} conflicting items`;
};

/**
 * Get conflict severity level
 * @param {Array} conflicts - Array of conflicts
 * @returns {string} - 'none', 'warning', 'error'
 */
export const getConflictSeverity = (conflicts) => {
  if (!conflicts || conflicts.length === 0) return 'none';
  
  // Check if any conflict is an event (more severe than activity/availability)
  const hasEventConflict = conflicts.some(c => c.type === 'event');
  if (hasEventConflict) return 'error';
  
  return 'warning';
};
