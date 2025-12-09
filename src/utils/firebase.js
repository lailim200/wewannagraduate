import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAHGBJgsn7b38cUFZqb9rA-SEHkNOrTjsw",
  authDomain: "grad-e1010.firebaseapp.com",
  projectId: "grad-e1010",
  storageBucket: "grad-e1010.firebasestorage.app",
  messagingSenderId: "1018276421077",
  appId: "1:1018276421077:web:a50b2777c8f673f0c3715c",
  measurementId: "G-GFS2CT3N2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Schedule functions (replaces availability functions)
export const getSchedule = async (userId) => {
  try {
    const scheduleQuery = query(
      collection(db, 'schedules'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(scheduleQuery);
    const schedule = [];
    
    querySnapshot.forEach((doc) => {
      schedule.push({ id: doc.id, ...doc.data() });
    });
    
    return schedule;
  } catch (error) {
    console.error('Error getting schedule:', error);
    throw error;
  }
};

export const saveScheduleItem = async (userId, scheduleItem) => {
  try {
    const itemWithUser = {
      ...scheduleItem,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    if (scheduleItem.id && scheduleItem.id.includes('-')) {
      // New item, add to collection
      const docRef = await addDoc(collection(db, 'schedules'), itemWithUser);
      return docRef.id;
    } else {
      // Update existing item
      const docRef = doc(db, 'schedules', scheduleItem.id);
      await updateDoc(docRef, itemWithUser);
      return scheduleItem.id;
    }
  } catch (error) {
    console.error('Error saving schedule item:', error);
    throw error;
  }
};

export const deleteScheduleItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'schedules', itemId));
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    throw error;
  }
};

export const updateFullSchedule = async (userId, schedule) => {
  try {
    // First, get existing schedule to know what to delete
    const existingSchedule = await getSchedule(userId);
    const existingIds = existingSchedule.map(item => item.id);
    const newIds = schedule
      .filter(item => item.id && !item.id.includes('-'))
      .map(item => item.id);
    
    // Delete removed items
    const itemsToDelete = existingIds.filter(id => !newIds.includes(id));
    for (const id of itemsToDelete) {
      await deleteScheduleItem(id);
    }
    
    // Save all items (new and updated)
    const savePromises = schedule.map(item => saveScheduleItem(userId, item));
    await Promise.all(savePromises);
    
  } catch (error) {
    console.error('Error updating full schedule:', error);
    throw error;
  }
};

// User profile helpers
export const ensureUserProfile = async (user) => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('Failed to ensure user profile:', e);
  }
};

const getUserByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  let user = null;
  snap.forEach(docSnap => { user = { id: docSnap.id, ...docSnap.data() }; });
  return user;
};

// Export for conflict checking
export { getUserByEmail };

/**
 * Get schedules for multiple participants by their emails
 * @param {Array} participantEmails - Array of email addresses
 * @returns {Object} - Map of {userId: schedule[]}
 */
export const getParticipantSchedules = async (participantEmails) => {
  try {
    const schedules = {};
    
    // Get user IDs from emails
    const userPromises = participantEmails.map(email => getUserByEmail(email));
    const users = await Promise.all(userPromises);
    
    // Get schedules for all users
    const schedulePromises = users
      .filter(user => user) // Remove null users
      .map(async (user) => {
        const schedule = await getSchedule(user.id);
        return { userId: user.id, email: user.email, schedule };
      });
    
    const schedulesData = await Promise.all(schedulePromises);
    
    // Build result map
    schedulesData.forEach(({ userId, email, schedule }) => {
      schedules[userId] = { schedule, email };
    });
    
    return schedules;
  } catch (error) {
    console.error('Error getting participant schedules:', error);
    return {};
  }
};

export const addFriendByEmail = async (ownerId, friendEmail, category = 'friends') => {
  try {
    const friend = await getUserByEmail(friendEmail);
    if (!friend) {
      throw new Error('No user found with that email. Ask them to sign in first.');
    }
    await addDoc(collection(db, 'shares'), {
      ownerId,
      friendId: friend.id,
      friendEmail: friend.email,
      category: category || 'friends',
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to add friend:', e);
    throw e;
  }
};

export const listFriends = async (ownerId) => {
  try {
    const q = query(collection(db, 'shares'), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    const friends = [];
    snap.forEach(docSnap => friends.push({ id: docSnap.id, ...docSnap.data() }));
    return friends;
  } catch (e) {
    console.error('Failed to list friends:', e);
    throw e;
  }
};

// Legacy availability functions (for backward compatibility)
export const getAvailability = async (userId) => {
  try {
    const docRef = doc(db, 'availability', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().dates;
    }
    return {};
  } catch (error) {
    console.error('Error getting availability:', error);
    throw error;
  }
};

export const updateAvailability = async (userId, availability) => {
  try {
    const docRef = doc(db, 'availability', userId);
    await setDoc(docRef, { 
      dates: availability,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};

// Event functions (existing)
export const createEvent = async (eventData) => {
  try {
    // Normalize participants into emails and ids arrays
    const participantsEmails = Array.isArray(eventData.participants)
      ? eventData.participants
      : [];
    const participantsIds = Array.isArray(eventData.participantsIds)
      ? eventData.participantsIds
      : [];

    const eventDoc = {
      ...eventData,
      participants: participantsEmails, // keep for backward compatibility
      participantsEmails,
      participantsIds,
      responses: eventData.responses || {},
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'events'), eventDoc);

    // Also add this event to creator's schedule immediately
    if (eventDoc.createdBy && eventDoc.date && eventDoc.time && eventDoc.title) {
      try {
        const hour = parseInt(String(eventDoc.time).split(':')[0], 10);
        await addDoc(collection(db, 'schedules'), {
          userId: eventDoc.createdBy,
          date: eventDoc.date,
          startHour: hour,
          endHour: hour + 1,
          title: eventDoc.title,
          type: 'event',
          eventId: docRef.id,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Event created but failed to add to creator schedule:', e);
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const getEvents = async (userId, userEmail) => {
  try {
    const createdQuery = query(
      collection(db, 'events'),
      where('createdBy', '==', userId)
    );

    // Events where I'm invited by uid
    const invitedByIdQuery = query(
      collection(db, 'events'),
      where('participantsIds', 'array-contains', userId)
    );

    // Events where I'm invited by email
    const invitedByEmailQuery = query(
      collection(db, 'events'),
      where('participantsEmails', 'array-contains', userEmail)
    );
    
    const [createdSnap, invitedByIdSnap, invitedByEmailSnap] = await Promise.all([
      getDocs(createdQuery),
      getDocs(invitedByIdQuery),
      getDocs(invitedByEmailQuery)
    ]);
    
    const events = new Map();
    
    createdSnap.forEach((doc) => {
      events.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    invitedByIdSnap.forEach((doc) => {
      events.set(doc.id, { id: doc.id, ...doc.data() });
    });

    invitedByEmailSnap.forEach((doc) => {
      events.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    return Array.from(events.values());
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

export const respondToEvent = async (eventId, userId, response) => {
  try {
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const eventData = docSnap.data();
      const responses = { ...(eventData.responses || {}) };
      responses[userId] = response;

      // Maintain acceptedIds list
      let acceptedIds = Array.isArray(eventData.acceptedIds) ? [...eventData.acceptedIds] : [];
      if (response === 'yes') {
        if (!acceptedIds.includes(userId)) acceptedIds.push(userId);
      } else {
        acceptedIds = acceptedIds.filter(id => id !== userId);
      }
      
      await updateDoc(docRef, { responses, acceptedIds });

      // If accepted, add to the responder's schedule
      if (response === 'yes' && eventData.date && eventData.time && eventData.title) {
        try {
          const hour = parseInt(String(eventData.time).split(':')[0], 10);
          await addDoc(collection(db, 'schedules'), {
            userId,
            date: eventData.date,
            startHour: hour,
            endHour: hour + 1,
            title: eventData.title,
            type: 'event',
            eventId,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Accepted RSVP but failed to add to schedule:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error responding to event:', error);
    throw error;
  }
};
