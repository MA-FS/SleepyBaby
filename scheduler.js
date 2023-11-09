document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 60000);
    document.getElementById('calculateSchedule').addEventListener('click', function() {
      const ageSelection = document.getElementById('ageSelection').value;
      const wakeTime = document.getElementById('wakeTimePicker').value;
      const napTimes = getNapTimes(ageSelection, wakeTime);
      displayTimeline(napTimes, wakeTime);
    });
  });
  
  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('currentTime').textContent = `Current Time: ${hours}:${minutes}`;
  }
  
  function getNapTimes(age, wakeTime) {
    // Define awake times based on the guidance provided
    const awakeTimes = {
      '0-3': [1, 1.25, 1.25, 1.5, 1.5],
      '4': [1.25, 1.25, 1.5, 1.75, 2],
      '5': [1.25, 1.5, 1.75, 2],
      '6': [1.5, 1.75, 2, 2.25],
      '7': [1.5, 1.75, 2.25],
      '8': [1.75, 2, 2.75],
      '9': [2.75, 3, 3.5],
      '10': [3, 3.5],
      '11': [3, 3.75],
      '12-18': [3.75, 4.5],
    };
  
    let napTimes = [];
    let currentWakeTime = wakeTime.split(":").map(t => parseInt(t));
    let minutesSinceStartOfDay = currentWakeTime[0] * 60 + currentWakeTime[1];
  
    // Get the awake times for the selected age group
    const ageAwakeTimes = awakeTimes[age] || [];
    for (let i = 0; i < ageAwakeTimes.length; i++) {
      let awakeDuration = ageAwakeTimes[i] * 60;
      let napStart = minutesSinceStartOfDay + awakeDuration;
      let napEnd = napStart + 60; // Assume 1 hour nap for simplicity
      // For the last nap of the day, we assume the awake period until bedtime (19:00 for this example)
      if (i === ageAwakeTimes.length - 1) {
        let bedtime = 19 * 60; // Convert 7 PM to minutes
        napEnd = bedtime;
      }
      napTimes.push({
        start: formatTime(napStart),
        end: formatTime(napEnd),
        isNap: i < ageAwakeTimes.length - 1 // Mark as nap time unless it's the last awake period
      });
      minutesSinceStartOfDay = napEnd;
    }
  
    return napTimes;
  }
  
  function formatTime(minutes) {
    let hours = Math.floor(minutes / 60) % 24; // Modulo 24 to convert hours beyond 24 back to a day's range
    let mins = minutes % 60;
    let suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${suffix}`;
  }
  
  function displayTimeline(napTimes, wakeTime) {
    const timelineElement = document.getElementById('dailyTimeline');
    timelineElement.innerHTML = '';
  
    let wakePeriodStart = formatTime(wakeTime.split(":").map(t => parseInt(t))[0] * 60 + wakeTime.split(":").map(t => parseInt(t))[1]);
  
    napTimes.forEach(nap => {
      if (nap.isNap) {
        // Create wake slot
        const wakeSlot = document.createElement('div');
        wakeSlot.classList.add('timeline-slot', 'wake-time');
        wakeSlot.textContent = `Awake: ${wakePeriodStart} - ${nap.start}`;
        timelineElement.appendChild(wakeSlot);
      }
  
      // Create nap slot
      const napSlot = document.createElement('div');
      napSlot.classList.add('timeline-slot', nap.isNap ? 'nap-time' : 'wake-time');
      napSlot.textContent = nap.isNap ? `Nap: ${nap.start} - ${nap.end}` : `Awake: ${nap.start} - ${nap.end}`;
      timelineElement.appendChild(napSlot);
  
      wakePeriodStart = nap.end; // Next period starts when the last one ends
    });
  }
  