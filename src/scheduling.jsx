import React, { useState, useEffect } from "react";

// Define working hours
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

const participants = [
  { name: "Alice", timezone: "America/New_York" },
  { name: "Bob", timezone: "Europe/London" },
  { name: "Chitra", timezone: "Asia/Kolkata" },

];

// Format date and time in a given timezone
function formatLocalTime(dateUTC, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(dateUTC);
}

// Get the hour in a given timezone
function getHourInTimezone(dateUTC, timezone) {
  const localTime = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).formatToParts(dateUTC);

  const hourPart = localTime.find((part) => part.type === "hour");
  return hourPart ? parseInt(hourPart.value, 10) : null;
}

// Check if time is outside working hours
function isOutsideWorkingHours(dateUTC, timezone) {
  const hour = getHourInTimezone(dateUTC, timezone);
  return hour < WORK_START_HOUR || hour >= WORK_END_HOUR;
}

// Suggest the earliest meeting time that works for all
function findEarliestCommonSlot(participants) {
  const baseDate = new Date(); // start from today
  baseDate.setUTCHours(6, 0, 0, 0); // start from 6 AM UTC
  const maxDaysToCheck = 7;

  for (let dayOffset = 0; dayOffset < maxDaysToCheck; dayOffset++) {
    for (let hour = 6; hour <= 20; hour++) {
      const testDate = new Date(baseDate);
      testDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
      testDate.setUTCHours(hour);

      const allWithinHours = participants.every(
        (p) => !isOutsideWorkingHours(testDate, p.timezone)
      );

      if (allWithinHours) {
        return testDate;
      }
    }
  }
  return null; // No common slot found
}

export default function TimezoneScheduler() {
  const [meetingTimeUTC, setMeetingTimeUTC] = useState(
    new Date()
  );
  const [suggestedTime, setSuggestedTime] = useState(null);

  useEffect(() => {
    const suggestion = findEarliestCommonSlot(participants);
    setSuggestedTime(suggestion);
  }, []);

  const handleTimeChange = (e) => {
    const localTime = new Date(e.target.value);
    const utcTime = new Date(localTime.toISOString());
    setMeetingTimeUTC(utcTime);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h2>Cross-Timezone Meeting Scheduler</h2>

      <label>
        Change Meeting Time (Local to You):{" "}
        <input
          type="datetime-local"
          onChange={handleTimeChange}
          value={meetingTimeUTC.toISOString().slice(0, 16)}
        />
      </label>

      <table border="1" cellPadding="10" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Participant</th>
            <th>Timezone</th>
            <th>Local Time</th>
            <th>Working Hours?</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const localTime = formatLocalTime(meetingTimeUTC, p.timezone);
            const outside = isOutsideWorkingHours(meetingTimeUTC, p.timezone);
            return (
              <tr key={p.name} style={{ backgroundColor: outside ? "#ffd6d6" : "#d6ffd6" }}>
                <td>{p.name}</td>
                <td>{p.timezone}</td>
                <td>{localTime}</td>
                <td>{outside ? "Outside working hours ❌" : "Within working hours ✅"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {suggestedTime ? (
        <div style={{ marginTop: "1rem", backgroundColor: "#f0f8ff", padding: "1rem", borderRadius: "8px" }}>
          <strong>Suggested Common Time:</strong>{" "}
          {formatLocalTime(suggestedTime, Intl.DateTimeFormat().resolvedOptions().timeZone)} (Your Local Time)
          <br />
          <em>UTC: {suggestedTime.toISOString().replace("T", " ").slice(0, 16)}Z</em>
        </div>
      ) : ( 
      <div style={{ marginTop: "1rem", backgroundColor: "#f0f8ff", padding: "1rem", borderRadius: "8px" }}>
          <strong>Suggested Common Time:</strong>{" "}
          <div>"There is no common time for the above participants"</div>
          <br />
          
        </div>)}
    </div>
  );
}