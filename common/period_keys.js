// ============================================================
// Shared local-date period key helpers, used by table_of_the_day.js,
// table_of_the_week.js, and the daily/weekly streak achievements.
// ============================================================

export function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getPreviousDayKey(dayKey) {
    const [year, month, day] = dayKey.split("-").map(Number);
    const previous = new Date(year, month - 1, day - 1);
    return formatDateKey(previous);
}

// Re-implemented directly to accept an arbitrary Date rather than "now":
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getWeekKey() {
    const now = new Date();
    return getWeekKeyForDate(now);
}

export function getWeekKeyForDate(date) {
    const dayOfWeek = date.getDay();
    const diffToMonday = (dayOfWeek === 0) ? -6 : (1 - dayOfWeek);
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday);
    return formatDateKey(monday);
}

export function getPreviousWeekKey(weekKey) {
    const [year, month, day] = weekKey.split("-").map(Number);
    const mondayDate = new Date(year, month - 1, day);
    const previousMonday = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() - 7);
    return formatDateKey(previousMonday);
}