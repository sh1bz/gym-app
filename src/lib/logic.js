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
	return '~' + Math.max(1, Math.round(sec / 60)) + ' min';
}

/** "last time" string for an exercise. */
export function exLast(x) {
	return x.last || (x.start === 0 ? 'BW × ' + x.reps : fmt(x.start) + ' × ' + x.reps);
}

/** Estimated seconds for one set (reps * 3s work + 15s setup). */
export function setSecs(x) {
	return x.reps * 3 + 15;
}

/** Estimated seconds for a whole exercise incl. rest. */
export function exSecs(x) {
	return x.sets * (setSecs(x) + x.rest);
}

/** Deterministic seeded "times performed" count (stubbed until real logs exist). */
export function seedCount(name) {
	return 12 + (name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 40);
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

/** Synthetic per-lift history for the progress chart (stubbed until real logs). */
export function genHistory(x, n) {
	const isBW = x.start === 0;
	const b = isBW ? x.reps : x.start;
	const stepW = isBW ? 1 : Math.max(2.5, Math.round(b * 0.02 * 2) / 2);
	const floor = isBW ? Math.max(1, b * 0.4) : Math.max(stepW, b * 0.5);
	const out = [];
	for (let k = 0; k < n; k++) {
		const back = n - 1 - k;
		let v;
		if (x.trend === 'up')
			v = b - back * stepW * 0.8 + (k % 3 === 1 ? stepW * 0.5 : 0) + (k % 5 === 2 ? -stepW * 0.5 : 0);
		else if (x.trend === 'down')
			v = b + Math.min(back, 6) * stepW * 0.6 - back * stepW * 0.15 - (k % 3 === 2 ? stepW * 0.4 : 0);
		else v = b + (k % 3 === 0 ? 0 : k % 3 === 1 ? stepW * 0.5 : -stepW * 0.5) + (k % 7 === 3 ? stepW * 0.5 : 0);
		out.push(Math.max(floor, Math.round(v * 2) / 2));
	}
	out[n - 1] = b;
	return out;
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

/** Progression rule (spec §5): returns a suggested next weight given logged sets. */
export function suggestNextWeight(exercise, loggedSets) {
	// loggedSets: [{ repsActual, repsTarget, weight }...] for the working sets of one session.
	if (exercise.start === 0 || !loggedSets || !loggedSets.length) return exercise.start;
	const working = loggedSets.filter((l) => l.type !== 'warmup' && l.type !== 'skipped');
	if (!working.length) return exercise.start;
	const allHitTop = working.every((l) => l.repsActual >= l.repsTarget);
	if (allHitTop) return Math.round((exercise.start + 2.5) * 2) / 2; // progress +2.5kg
	return exercise.start; // hold
}
