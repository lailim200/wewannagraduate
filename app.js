// app.js
const form = document.getElementById('event-form');
const calendar = document.getElementById('calendar');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const title = document.getElementById('event-title').value;
  const time = document.getElementById('event-time').value;

  const eventDiv = document.createElement('div');
  eventDiv.textContent = time + ' - ' + title;
  calendar.appendChild(eventDiv);

  try {
    await db.collection('events').add({
      title: title,
      time: time,
      createdBy: "user123",
      shared: false
    });
    console.log("Event saved.");
  } catch (error) {
    console.error("Error:", error);
  }

  form.reset();
});
