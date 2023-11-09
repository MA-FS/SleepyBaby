document.addEventListener('DOMContentLoaded', function() {
    updateTime();
    setInterval(updateTime, 60000);
    document.getElementById('calculateSchedule').addEventListener('click', function() {
        const ageSelection = parseInt(document.getElementById('ageSelection').value, 10);
        const wakeTime = document.getElementById('wakeTimePicker').value;
        const napTimes = getNapTimes(ageSelection, wakeTime);
        displayRecommendation(ageSelection);
        displayTimeline(napTimes);
    });
});

function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('currentTime').textContent = `Current Time: ${hours}:${minutes}`;
}

function getNapTimes(age, wakeTime) {
    const awakeTimes = {
        '0-3': [1, 1.25, 1.25, 1.5, 1.5, 1.25],
        '4': [1.25, 1.25, 1.5, 1.75, 1.5],
        '5': [1.25, 1.5, 1.75, 1.5],
        '6': [1.5, 1.75, 2, 1.67],
        '7': [1.5, 1.75, 2.25, 1.75],
        '8': [1.75, 2, 2.5, 2],
        '9': [2.75, 3, 2.75],
        '10': [3, 3.5, 2.75],
        '11': [3, 3.75, 3.5],
        '12-18': [4, 4.5, 4.5],
    };

    let napTimes = [];
    let currentWakeTime = convertTimeToMinutes(wakeTime);

    const ageKey = Object.keys(awakeTimes).find(key => {
        const range = key.split('-').map(Number);
        return range.length === 1 ? age == range[0] : age >= range[0] && age <= range[1];
    });

    const numNaps = ageKey === '12-18' ? 1 : age >= 4 ? 2 : 4;

    for (let i = 0; i < numNaps; i++) {
        const awakeTime = awakeTimes[ageKey][i] || 1.5;
        let napStart = currentWakeTime + awakeTime * 60;
        let napEnd = napStart + 60;

        napTimes.push({ start: formatTime(currentWakeTime), end: formatTime(napStart), isAwake: true });
        napTimes.push({ start: formatTime(napStart), end: formatTime(napEnd), isAwake: false });

        currentWakeTime = napEnd;
    }

    napTimes.push({ start: formatTime(currentWakeTime), end: '07:00 PM', isAwake: true });

    return napTimes;
}

function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    let suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${suffix}`;
}

function displayTimeline(napTimes) {
    const timelineElement = document.getElementById('dailyTimeline');
    timelineElement.innerHTML = '';

    napTimes.forEach(period => {
        const slot = document.createElement('div');
        slot.classList.add('timeline-slot', period.isAwake ? 'wake-time' : 'nap-time');
        slot.textContent = `${period.isAwake ? 'Awake' : 'Nap'}: ${period.start} - ${period.end}`;
        timelineElement.appendChild(slot);
    });
}

function displayRecommendation(age) {
    const recommendations = {
        '0-3': 'Babies typically require 4-5 naps a day with awake times ranging from 1 to 1½ hours between naps. The awake time before bedtime should be around 1 to 1¼ hours.',
        '4': 'Expect around four naps, potentially five if the baby is not sleeping well. Awake times range from 1¼ to 1¾ hours before naps, increasing as the day progresses, with approximately 1½ hours before bedtime.',
        '5': 'Babies usually have 3-4 naps with awake times extending to 1¾ to 2 hours before the last nap and 1½ hours before bedtime.',
        '6': 'Three naps are common but four may still be needed. Awake times are about 1½ to 2¼ hours before naps and 1½ to 1h 40m before bedtime.',
        '7': 'Two to three naps with awake times of 1½ to 2½ hours before naps and 1¾ hours before bedtime.',
        '8': 'Transitioning towards two naps, but a third is acceptable. Awake times are 1¾ to 2¾ hours before naps and 2 hours before bedtime.',
        '9': 'Two naps are standard, but a third can be added if needed. Awake times before naps should be around 2¾ to 3 hours, and bedtime should be after 2¾ hours.',
        '10': 'Two naps are likely with awake times of about 3 to 3½ hours before naps and 2¾ to 3 hours before bedtime.',
        '11': 'Two naps are aimed for, with awake times of 3 to 3¾ hours before naps and approximately 3½ hours before bedtime.',
        '12-18': 'Usually one or two naps, with awake times of 3 to 4 hours. When transitioning to one nap, the awake time before the nap can be up to 4 hours and around 4.5 hours before bedtime.',
    };

    const recommendationText = recommendations[Object.keys(recommendations).find(key => {
        const range = key.split('-').map(Number);
        return range.length === 1 ? age == range[0] : age >= range[0] && age <= range[1];
    })];

    let recommendationElement = document.getElementById('recommendationNote');
    if (!recommendationElement) {
        recommendationElement = document.createElement('div');
        recommendationElement.id = 'recommendationNote';
        document.getElementById('napSchedule').appendChild(recommendationElement);
    }
    recommendationElement.textContent = recommendationText;
}
