## 📁 Code Structure (ScheduleSync)

This project is a collaborative scheduling app that allows users to share their calendar with friends, suggest group events, and respond to scheduling requests in real time. Below is an overview of the file structure and what each part does:

ScheduleSync/
├── index.html # Main HTML file that builds the page layout
├── style.css # CSS file that styles the calendar and layout
├── app.js # Main JavaScript logic for adding and viewing events
├── firebase-config.js # Sets up the Firebase connection to Firestore
├── auth.js (planned) # Will manage login and authentication using Firebase
├── suggestions.js (planned)# Will handle sending/responding to event suggestions

### File Explanations

- **index.html**  
  Lays out the basic structure of the webpage, including the form, calendar area, and buttons.

- **style.css**  
  Adds styling to the calendar grid and makes the interface visually clear and usable.

- **app.js**  
  Handles user interaction: collects form input, displays events on screen, and stores data in Firestore.

- **firebase-config.js**  
  Connects the app to Firebase. Used to initialize and access Firestore services.

- **auth.js** *(planned)*  
  Will handle user sign-up, login, and session management with Firebase Authentication.

- **suggestions.js** *(planned)*  
  Will be used for group event suggestions, accepting/declining events, and updating the UI in real-time.

---

### 🔗 Repository Contents Summary

This repository contains the full frontend codebase for ScheduleSync, including:
- All HTML/CSS/JS files needed to run the app in the browser
- Firebase integration scripts
- Planned expansion files for authentication and suggestion handling
