// Pure, framework-agnostic helpers ported from the prototype's logic class.
import { EXDB, CATS, DAY_MS } from './seed.js';

export const RING_R = 125;
export const RING_C = 2 * Math.PI * RING_R; // circumference of the rest ring

/** Format a weight: 0 -> "BW", integers plain, else one decimal. */
export function fmt(w) {
	return w === 0 ? 'BW' : Number.isInteger(w) ? String(w) : w.toFixed(1);
}

/** Seconds -> "M:SS". */
export function fmtTime(sec) {
	const t = Math.max(0, Math.ceil(sec));
	return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}

/** Elapsed seconds -> "MM:SS". */
export function fmtElapsed(sec) {
	const e = Math.max(0, Math.floor(sec));
	return String(Math.floor(e / 60)).padStart(2, '0') + ':' + String(e % 60).padStart(2, '0');
}

export function fmtMin(sec) {
	if (sec <= 0) return '0 min';
	return '~' + Math.max(1, Math.round(sec / 60)) + ' min';
}

/** Estimated seconds for one set (reps * 3s work + 15s setup). */
export function setSecs(x) {
	return x.reps * 3 + 15;
}

/** Estimated seconds for a whole exercise incl. rest. */
export function exSecs(x) {
	return x.sets * (setSecs(x) + x.rest);
}

export function findCat(name) {
	for (const c of CATS) if (EXDB[c].some((x) => x.name === name)) return c;
	return null;
}

export function ago(ts, now = Date.now()) {
	if (!ts) return 'never';
	const d = Math.floor((now - ts) / DAY_MS);
	return d <= 0 ? 'today' : d + 'd ago';
}

/** Order day indices by longest-since-trained (never-trained first). */
export function sortDays(program, lastDone) {
	return program
		.map((_, i) => i)
		.sort((a, b) => (lastDone[program[a].id] || 0) - (lastDone[program[b].id] || 0));
}

const dayStart = (t) => {
	const d = new Date(t);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
};
export const weekStart = (t) => {
	const d = new Date(dayStart(t));
	const dw = (d.getDay() + 6) % 7; // Monday-based week
	return d.getTime() - dw * DAY_MS;
};
export { dayStart };

/** Consecutive Monday-start weeks with >=1 session, current week grace. */
export function streakOf(sessions, now = Date.now()) {
	const thisWeek = weekStart(now);
	const weeksWith = new Set((sessions || []).map((t) => weekStart(t)));
	let n = 0;
	let cursor = weeksWith.has(thisWeek) ? thisWeek : thisWeek - 7 * DAY_MS;
	while (weeksWith.has(cursor)) {
		n++;
		cursor -= 7 * DAY_MS;
	}
	return n;
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONS2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dateStr(now = Date.now()) {
	const d = new Date(now);
	return DOW[d.getDay()] + ' · ' + d.getDate() + ' ' + MONS[d.getMonth()];
}

export function weekDateLabel(back, now = Date.now()) {
	const d = new Date(now - back * 7 * DAY_MS);
	return d.getDate() + ' ' + MONS2[d.getMonth()];
}

// ---------------------------------------------------------------------------
// Real data pipeline (spec §5). Each exercise's `history` is a chronological
// list of per-session records: { t: timestamp, w: weight, reps: reps hit on
// the top set, top: whether every working set hit the rep target }.
// Everything below derives real trend/charts/counts/recommendations from that.
// ---------------------------------------------------------------------------

/** Value a record contributes to a chart: reps for bodyweight, weight otherwise. */
function recordValue(exercise, r) {
	return exercise.start === 0 ? r.reps : r.w;
}

/**
 * Weekly series of `nWeeks` values ending this week, forward-filled across gaps.
 * Returns an array of numbers, or null if there aren't at least 2 real points
 * in the window (the caller shows an empty state instead of a chart).
 */
export function realSeries(exercise, records, nWeeks, now = Date.now()) {
	if (!records || records.length < 2) return null;
	const thisWeek = weekStart(now);
	const buckets = new Array(nWeeks).fill(null);
	for (const r of records) {
		const idx = nWeeks - 1 - Math.round((thisWeek - weekStart(r.t)) / (7 * DAY_MS));
		if (idx >= 0 && idx < nWeeks) buckets[idx] = r; // chronological → latest in a week wins
	}
	if (buckets.filter(Boolean).length < 2) return null;
	const first = buckets.find(Boolean);
	const out = [];
	let last = first;
	for (let i = 0; i < nWeeks; i++) {
		if (buckets[i]) last = buckets[i];
		out.push(recordValue(exercise, last));
	}
	return out;
}

/** Real trend from history (compares the two most recent sessions), else the seed. */
export function trendOf(exercise, records) {
	if (!records || records.length < 2) return exercise.trend || 'flat';
	const a = records[records.length - 2];
	const b = records[records.length - 1];
	const va = recordValue(exercise, a);
	const vb = recordValue(exercise, b);
	if (vb > va) return 'up';
	if (vb < va) return 'down';
	// same load → look at reps as the tiebreak
	if (b.reps > a.reps) return 'up';
	if (b.reps < a.reps) return 'down';
	return 'flat';
}

/** Most recent real performance, or null. */
export function lastOf(records) {
	return records && records.length ? records[records.length - 1] : null;
}

/**
 * Weight recommendation (spec §5): progress +2.5kg when all sets hit the top of
 * the range; deload ~10% after a ~3-session stall; hold otherwise.
 * Returns { weight, kind: 'progress'|'hold'|'deload'|'base' }.
 */
export function recommend(exercise, records) {
	if (!records || !records.length) return { weight: exercise.start, kind: 'base' };
	const last = records[records.length - 1];
	// Bodyweight: load stays 0, progression is via reps — never nudge weight.
	if (exercise.start === 0) {
		return { weight: 0, kind: last.top ? 'progress' : 'hold' };
	}
	// Stall: last 3 sessions with no added load and no rep improvement → deload.
	if (records.length >= 3) {
		const last3 = records.slice(-3);
		const weights = last3.map((r) => r.w);
		const noLoadAdded = Math.max(...weights) === Math.min(...weights);
		const noRepGain = last3[2].reps <= last3[0].reps;
		if (noLoadAdded && noRepGain && !last.top) {
			return { weight: Math.round(last.w * 0.9 * 2) / 2, kind: 'deload' };
		}
	}
	if (last.top) return { weight: Math.round((last.w + 2.5) * 2) / 2, kind: 'progress' };
	return { weight: last.w, kind: 'hold' };
}
