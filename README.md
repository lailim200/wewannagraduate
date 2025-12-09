
# ScheduleSync 📅

A web-based planner that helps students coordinate schedules and find common free time to meet.  
This README provides **all steps to re-generate the project** after cloning, per evaluation criteria.

---

## 1. Rebuild Instructions

```bash
git clone https://github.com/lailim200/wewannagraduate.git
cd wewannagraduate
npm install
````

---

## 2. Run Instructions (with Proto-system setup)

### ① Environment Setup

Create a file named `.env.local` at the root.

Paste this inside (example):

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyDg...
REACT_APP_FIREBASE_AUTH_DOMAIN=schedulesync.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=schedulesync
REACT_APP_FIREBASE_STORAGE_BUCKET=schedulesync.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

You can use our demo credentials (in `.env.example`) or insert your own Firebase project settings.

### ② Start the Web App

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)
You can now test the app with:

* Google login (via Firebase)
* Dummy test account (in report or shared via email)
* Creating time blocks or events to test sync

---

## 3. System Summary

ScheduleSync allows users to:

* Add personal time blocks to a calendar
* Share availability with friends
* Suggest group events
* Accept or reject invitations
* View overlapping free time

All updates sync in **real time** through Firebase.

---

## 4. Data and Sample

### Proto-data structure:

| Collection  | Contents                         |
| ----------- | -------------------------------- |
| `users`     | Each user’s name, UID, and email |
| `schedules` | Personal time blocks             |
| `events`    | Group events                     |
| `shares`    | Friend connections               |

To test the app, use the pre-created user and events or make your own.

---

## 5. Research / Experimental Result

If graded as part of a research track:

* Experimental data: Firebase read/write speed, real-time sync latency
* Simulation: Friend A invites Friend B → accept/reject scenario tested
* Result files (screenshots/logs): Included in final report

---

## 6. Open Source Usage

All open source libraries are listed in `package.json`.

Key libraries:

* React
* Firebase SDK
* React Router DOM
* date-fns
* ESLint, Prettier
* Vite or CRA (based on template used)

These are all free to use and install with `npm install`.

---

## 7. Project Structure

```
public/
  index.html            # Main HTML file
src/
  components/           # Reusable calendar/event modules
  pages/                # Home, Calendar, FriendList, etc.
  utils/                # Firebase config, conflict checker
  styles/               # CSS and theme settings
  App.js                # Root app with routing
  index.js              # React entry point
```

---

## 8. Script or Automation (Optional)

Although we don’t use `makefile`, the following npm scripts are defined:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

To build:

```bash
npm run build
```

---

## 9. License & Author Info

* License: ISC
* Authors: Team 23, "졸업하고싶죠"
* Contact: via report or GitHub contributors section

---


