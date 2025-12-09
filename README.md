

# **ScheduleSync 📅**

A web-based scheduling platform that helps students coordinate plans, share availability, and find common free time.
This README provides all instructions required to **re-generate the system from scratch** after cloning.

---

# **1. Project Overview**

ScheduleSync is a realtime planning tool that allows users to:

* Add personal time blocks
* Share free/busy availability with friends
* Suggest events
* Accept or decline invitations
* View overlapping free time instantly

The system uses **React** for the frontend and **Firebase** for authentication, database, and realtime synchronization.

---

# **2. Repository Setup**

## **Clone the Repository**

```bash
git clone https://github.com/lailim200/wewannagraduate.git
cd wewannagraduate
```

---

# **3. How to Install**

Install all required dependencies:

```bash
npm install
```

---

# **4. Environment Setup**

Create a file named **`.env.local`** in the project root.

Copy from `.env.example` or use your own Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=xxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxx
REACT_APP_FIREBASE_PROJECT_ID=xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxx
REACT_APP_FIREBASE_APP_ID=xxxx
```

This environment file is required for authentication, database access, and hosting.

---

# **5. How to Run (Development Server)**

Start the development server:

```bash
npm start
```

Then open:

```
http://localhost:3000
```

You may test with:

* Google login (Firebase)
* Sample user accounts (provided in project report)
* Creating time blocks and events to verify realtime sync

---

# **6. How to Build (Production Build)**

To generate an optimized production build:

```bash
npm run build
```

This outputs a compiled `build/` directory ready for deployment.

To preview the production build locally (optional):

```bash
npm install -g serve
serve -s build
```

Then visit:

```
http://localhost:3000
```

---

# **7. How to Test**

### **Functionality Testing**

1. Log in using Google or a test user
2. Create time blocks in the calendar
3. Open a second browser or account
4. Observe realtime synchronization
5. Create an event → invite friend → accept/reject
6. Confirm that the result updates instantly for all participants

### **Realtime Behavior Check**

* Measure sync latency using browser console timestamps
* Confirm that updates propagate through Firestore listeners

---

# **8. Project Structure**

```
public/
  index.html
src/
  components/        # UI modules (calendar grid, event cards)
  pages/             # Calendar, Home, FriendList, EventPage
  utils/             # Firebase config + helper functions
  styles/            # CSS files
  App.js             # Routing + layout
  index.js           # React entry point
.env.example         # Firebase config template
package.json         # Dependencies and scripts
```

---

# **9. Data Description (Sample / Proto Data)**

ScheduleSync uses Firebase Firestore.

### **Collections Used**

| Collection  | Description                                |
| ----------- | ------------------------------------------ |
| `users`     | Stores email, UID, display name            |
| `schedules` | All personal time blocks                   |
| `events`    | Event metadata + participants + responses  |
| `shares`    | Friend connections and sharing permissions |

### **Sample Data Behavior**

* Creating a time block writes to `schedules/{uid}`
* Proposing an event writes to `events/{eventId}`
* Accept/decline updates the event’s participant state

This structure allows realtime updates across accounts.

---

# **10. Open Source Components**

ScheduleSync uses the following open-source libraries:

### **Frontend**

* **React** – UI framework
* **React Router DOM** – Routing
* **date-fns** – Time calculations

### **Backend**

* **Firebase Auth** – Login & identity
* **Firebase Firestore** – Realtime DB
* **Firebase Hosting** – Deployment (optional)

### **Dev Tools**

* ESLint, Prettier (formatting & linting)

All dependencies are listed in `package.json`.

---

# **11. NPM Scripts**

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

Common commands:

```bash
npm start     # run development server
npm run build # create production build
npm test      # run tests (if implemented)
```

---

# **12. Troubleshooting**

### **Common Issues**

| Issue                             | Solution                                         |
| --------------------------------- | ------------------------------------------------ |
| Environment variables not loading | Ensure `.env.local` exists in project root       |
| Firebase errors                   | Re-check API keys & Firestore rules              |
| Realtime sync not updating        | Refresh listeners or check Firestore permissions |
| “npm start” fails                 | Delete `node_modules` → `npm install` again      |

---

# **13. Authors**

Team 23 • 졸업하고싶죠
Makhmud Lailim · Oskonbai kyzy Asema


