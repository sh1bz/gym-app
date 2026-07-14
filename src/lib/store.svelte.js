// Central state machine for Session, ported from the design prototype's logic class.
// Offline-first: everything lives in-memory + localStorage; Supabase syncs when available.
import { browser } from '$app/environment';
import { SEED_PROGRAM, EXDB, CATS, DAY_MS } from './seed.js';
import {
	fmt,
	fmtElapsed,
	exLast,
	findCat,
	sortDays,
	streakOf,
	seedCount,
	genHistory,
	realSeries,
	trendOf,
	lastOf,
	recommend
} from './logic.js';
import { supabase, supabaseEnabled } from './supabase.js';

const KEY = 'gym-session-dc-v3';
const clone = (x) => JSON.parse(JSON.stringify(x));

export class GymStore {
	// ---- persisted core state ----
	program = $state(clone(SEED_PROGRAM));
	day = $state(0);
	ex = $state(0);
	setIdx = $state(0);
	weight = $state(SEED_PROGRAM[0].workout[0].start);
	screen = $state('home'); // home|active|rest|detail|perf|editDay|library
	sessionOn = $state(false);
	startedAt = $state(Date.now());
	restEnd = $state(0);
	restTotal = $state(180);
	loggedText = $state('');
	loggedName = $state('');
	nextLabel = $state('');
	lastDone = $state(null);
	sessions = $state(null);
	exCount = $state({});
	detDay = $state(0);
	detIdx = $state(0);
	detFrom = $state('home');
	edDay = $state(0);
	libCat = $state(null);
	libSwapIdx = $state(null);
	chartWeeks = $state(8);
	// Real per-exercise session history: { [name]: [{ t, w, reps, top }] }.
	// Powers real charts/counts/trends/recommendations; seeded stubs fill in until it grows.
	history = $state({});
	// Working sets logged during the current live session (summarised on save).
	sessionLog = $state([]);

	// ---- settings (persisted) ----
	accent = $state('#ff4e27');
	microStep = $state('2.5');
	haptics = $state(true);

	// ---- transient UI state ----
	repCount = $state(8);
	sheetOpen = $state(false);
	endSheetOpen = $state(false);
	addSheetOpen = $state(false);
	settingsOpen = $state(false);
	ending = $state(false);
	elapsed = $state('00:00');
	toastMsg = $state('');
	streakDisp = $state(null);

	// ---- animation triggers (increment to replay; components key on these) ----
	wTick = $state(0);
	wDir = $state('up');
	rTick = $state(0);
	rDir = $state('up');
	pulseTick = $state(0);
	sweepTick = $state(0);
	exTick = $state(0);

	// ---- sync/auth ----
	user = $state(null);
	syncState = $state('local'); // local | syncing | synced | offline

	_clk = null;
	_syncTimer = null;
	_tT = null;
	_hT = null;
	_hI = null;
	_streakRaf = null;
	_loadedRemote = false;

	constructor() {
		if (browser) this.load();
	}

	// ---------- derived ----------
	get wkList() {
		return this.program[this.day]?.workout ?? [];
	}
	get curEx() {
		return this.wkList[this.ex] ?? { name: '', sets: 1, reps: 8, start: 0, rest: 60 };
	}
	get order() {
		return sortDays(this.program, this.lastDone || {});
	}
	get totalSets() {
		return this.wkList.reduce((a, x) => a + x.sets, 0);
	}
	get doneSets() {
		if (!this.sessionOn) return 0;
		const w = this.curEx;
		return (
			this.wkList.slice(0, this.ex).reduce((a, x) => a + x.sets, 0) + Math.min(this.setIdx, w.sets)
		);
	}
	get stepVal() {
		return parseFloat(this.microStep ?? '2.5') || 2.5;
	}
	timesDone(name) {
		// Seeded baseline keeps the UI alive from day one; real sessions stack on top.
		return seedCount(name) + (this.history?.[name]?.length || 0);
	}
	recordsOf(name) {
		return this.history?.[name] || null;
	}
	/** Real trend for an exercise, falling back to its seeded trend. */
	trendFor(exercise) {
		return trendOf(exercise, this.recordsOf(exercise.name));
	}
	/** "last time" string: real most-recent performance, else the seeded value. */
	lastTimeFor(exercise) {
		const r = lastOf(this.recordsOf(exercise.name));
		if (!r) return exLast(exercise);
		return (exercise.start === 0 ? 'BW' : fmt(r.w)) + ' × ' + r.reps;
	}
	/** Chart series (numbers) for `weeks`: real when we have enough, else seeded. */
	chartValues(exercise, weeks) {
		return realSeries(exercise, this.recordsOf(exercise.name), weeks) ?? genHistory(exercise, weeks);
	}
	/** Weight recommendation for an exercise (spec §5). */
	recommendFor(exercise) {
		return recommend(exercise, this.recordsOf(exercise.name));
	}
	get currentRec() {
		return this.recommendFor(this.curEx);
	}

	// ---------- lifecycle ----------
	load() {
		try {
			const p = JSON.parse(localStorage.getItem(KEY) || 'null');
			if (p && Array.isArray(p.program) && p.program.length && typeof p.day === 'number') {
				this.applyBlob(p);
			}
		} catch (e) {
			/* ignore corrupt cache */
		}
		this.normalize();
		this.startClock();
		this.animateStreak();
		this.applyAccent();
		if (supabaseEnabled) this.initAuth();
	}

	applyBlob(p) {
		const fields = [
			'program', 'day', 'ex', 'setIdx', 'weight', 'screen', 'sessionOn', 'lastDone',
			'sessions', 'exCount', 'history', 'startedAt', 'restEnd', 'restTotal', 'loggedText',
			'loggedName', 'nextLabel', 'detDay', 'detIdx', 'edDay', 'accent', 'microStep', 'haptics'
		];
		for (const f of fields) if (p[f] !== undefined) this[f] = p[f];
	}

	normalize() {
		const now = Date.now();
		if (!this.lastDone) {
			this.lastDone = { A: now - 6 * DAY_MS, B: now - 2 * DAY_MS, C: now - 4 * DAY_MS };
		}
		if (!Array.isArray(this.sessions)) {
			const s = [];
			for (let wb = 8; wb >= 1; wb--) [1, 3, 5].forEach((d) => s.push(now - wb * 7 * DAY_MS + d * DAY_MS));
			s.push(now - 2 * DAY_MS, now - 4 * DAY_MS, now - 6 * DAY_MS);
			this.sessions = s.filter((t) => t < now);
		}
		if (!this.program[this.day]) this.day = 0;
		const wk = this.program[this.day].workout;
		if (!wk[this.ex]) {
			this.ex = 0;
			this.setIdx = 0;
			this.weight = wk[0] ? wk[0].start : 0;
		}
		if (this.screen === 'rest' && this.restEnd <= now) {
			const w = wk[this.ex];
			if (w && this.setIdx >= w.sets && this.ex < wk.length - 1) {
				this.ex += 1;
				this.setIdx = 0;
				this.weight = wk[this.ex].start;
			}
			this.screen = 'active';
		}
		if (!this.sessionOn && (this.screen === 'active' || this.screen === 'rest')) this.screen = 'home';
		if (!this.program[this.edDay]) this.edDay = 0;
		if (!this.program[this.detDay] || !this.program[this.detDay].workout[this.detIdx]) {
			this.detDay = 0;
			this.detIdx = 0;
		}
		this.repCount = this.curEx.reps ?? 8;
	}

	startClock() {
		clearInterval(this._clk);
		this._clk = setInterval(() => {
			if (!this.sessionOn) return;
			this.elapsed = fmtElapsed((Date.now() - this.startedAt) / 1000);
		}, 1000);
		if (this.sessionOn) this.elapsed = fmtElapsed((Date.now() - this.startedAt) / 1000);
	}

	destroy() {
		clearInterval(this._clk);
		clearInterval(this._hI);
		clearTimeout(this._hT);
		clearTimeout(this._tT);
		clearTimeout(this._syncTimer);
		cancelAnimationFrame(this._streakRaf);
	}

	// ---------- persistence + sync ----------
	blob() {
		return {
			program: this.program, day: this.day, ex: this.ex, setIdx: this.setIdx, weight: this.weight,
			screen: ['active', 'rest', 'home'].includes(this.screen) ? this.screen : 'home',
			sessionOn: this.sessionOn, lastDone: this.lastDone, sessions: this.sessions,
			exCount: this.exCount, history: this.history, startedAt: this.startedAt, restEnd: this.restEnd,
			restTotal: this.restTotal, loggedText: this.loggedText, loggedName: this.loggedName,
			nextLabel: this.nextLabel, detDay: this.detDay, detIdx: this.detIdx, edDay: this.edDay,
			accent: this.accent, microStep: this.microStep, haptics: this.haptics
		};
	}

	persist() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.blob()));
		} catch (e) {
			/* storage full / unavailable */
		}
		this.scheduleSync();
	}

	scheduleSync() {
		if (!supabaseEnabled || !this.user) return;
		clearTimeout(this._syncTimer);
		this._syncTimer = setTimeout(() => this.pushState(), 800);
	}

	async initAuth() {
		const { data } = await supabase.auth.getSession();
		this.user = data.session?.user ?? null;
		if (this.user) await this.pullState();
		supabase.auth.onAuthStateChange(async (_event, session) => {
			const wasNull = !this.user;
			this.user = session?.user ?? null;
			if (this.user && wasNull) await this.pullState();
		});
	}

	async pullState() {
		if (!supabaseEnabled || !this.user) return;
		this.syncState = 'syncing';
		try {
			const { data, error } = await supabase
				.from('app_state')
				.select('blob')
				.eq('user_id', this.user.id)
				.maybeSingle();
			if (error) throw error;
			if (data?.blob && Array.isArray(data.blob.program) && data.blob.program.length) {
				this.applyBlob(data.blob);
				this.normalize();
				this.animateStreak();
			} else {
				await this.pushState(); // first login: seed remote from local
			}
			this._loadedRemote = true;
			this.syncState = 'synced';
		} catch (e) {
			this.syncState = 'offline';
		}
	}

	async pushState() {
		if (!supabaseEnabled || !this.user) return;
		this.syncState = 'syncing';
		try {
			const { error } = await supabase
				.from('app_state')
				.upsert({ user_id: this.user.id, blob: this.blob(), updated_at: new Date().toISOString() });
			if (error) throw error;
			this.syncState = 'synced';
		} catch (e) {
			this.syncState = 'offline';
		}
	}

	async logSetRow(entry) {
		if (!supabaseEnabled || !this.user) return;
		try {
			await supabase.from('set_logs').insert({
				user_id: this.user.id,
				day_id: this.program[this.day]?.id ?? null,
				exercise_name: entry.exerciseName,
				set_index: entry.setIndex,
				weight: entry.weight,
				reps_target: entry.repsTarget,
				reps_actual: entry.repsActual,
				type: entry.type
			});
		} catch (e) {
			/* best-effort; app_state blob is the source of truth for sync */
		}
	}

	async signIn(email) {
		if (!supabaseEnabled) return { error: 'Cloud sync is not configured.' };
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: browser ? window.location.origin : undefined }
		});
		return { error: error?.message ?? null };
	}

	async signOut() {
		if (supabaseEnabled) await supabase.auth.signOut();
		this.user = null;
		this.syncState = 'local';
	}

	// ---------- helpers ----------
	applyAccent() {
		if (browser) document.documentElement.style.setProperty('--accent', this.accent ?? '#ff4e27');
	}
	buzz(p) {
		if (this.haptics && browser && navigator.vibrate) {
			try {
				navigator.vibrate(p);
			} catch (e) {}
		}
	}
	showToast(m) {
		this.toastMsg = m;
		clearTimeout(this._tT);
		this._tT = setTimeout(() => (this.toastMsg = ''), 1600);
	}
	animateStreak() {
		if (!browser) return;
		const target = streakOf(this.sessions);
		const t0 = performance.now();
		const dur = 900;
		cancelAnimationFrame(this._streakRaf);
		const step = (t) => {
			const p = Math.min(1, (t - t0) / dur);
			this.streakDisp = Math.round(target * (1 - Math.pow(1 - p, 3)));
			if (p < 1) this._streakRaf = requestAnimationFrame(step);
		};
		this._streakRaf = requestAnimationFrame(step);
	}

	// ---------- session flow ----------
	changeWeight(d) {
		const w = this.curEx;
		if (!w || w.start === 0) return;
		const nw = Math.max(0, Math.round((this.weight + d) * 2) / 2);
		if (nw === this.weight) return;
		this.buzz(8);
		this.weight = nw;
		this.wDir = d > 0 ? 'up' : 'down';
		this.wTick++;
		this.pulseTick++;
		this.persist();
	}
	holdStart(d) {
		this.changeWeight(d);
		clearTimeout(this._hT);
		clearInterval(this._hI);
		this._hT = setTimeout(() => {
			this._hI = setInterval(() => this.changeWeight(d), 90);
		}, 380);
	}
	holdEnd() {
		clearTimeout(this._hT);
		clearInterval(this._hI);
	}

	logSet() {
		this.buzz(10);
		this.repCount = this.curEx.reps;
		this.sweepTick++;
		setTimeout(() => (this.sheetOpen = true), 120);
	}
	closeSheet() {
		this.sheetOpen = false;
	}
	repMinus() {
		if (this.repCount <= 0) return;
		this.buzz(8);
		this.repCount--;
		this.rDir = 'down';
		this.rTick++;
	}
	repPlus() {
		this.buzz(8);
		this.repCount++;
		this.rDir = 'up';
		this.rTick++;
	}
	confirmReps() {
		this.buzz([10, 40, 10]);
		const w = this.curEx;
		const logged = fmt(this.weight) + ' × ' + this.repCount;
		const entry = {
			exerciseName: w.name,
			setIndex: this.setIdx,
			weight: this.weight,
			repsTarget: w.reps,
			repsActual: this.repCount,
			type: 'working'
		};
		this.sessionLog = [...this.sessionLog, entry];
		this.logSetRow(entry);
		this.sheetOpen = false;
		setTimeout(() => this.startRest(logged), 160);
	}
	skipSet() {
		const w = this.curEx;
		const entry = {
			exerciseName: w.name,
			setIndex: this.setIdx,
			weight: this.weight,
			repsTarget: w.reps,
			repsActual: 0,
			type: 'skipped'
		};
		this.sessionLog = [...this.sessionLog, entry];
		this.logSetRow(entry);
		this.showToast('Set skipped');
		setTimeout(() => this.startRest('skipped'), 300);
	}
	warmup() {
		const w = this.curEx;
		this.buzz(8);
		const entry = {
			exerciseName: w.name,
			setIndex: this.setIdx,
			weight: this.weight,
			repsTarget: w.reps,
			repsActual: this.repCount,
			type: 'warmup'
		};
		this.sessionLog = [...this.sessionLog, entry];
		this.logSetRow(entry);
		this.showToast('Logged as warm-up');
	}

	startRest(loggedText) {
		const wk = this.wkList;
		const w = wk[this.ex];
		const nsi = this.setIdx + 1;
		let nextLabel;
		if (nsi >= w.sets) {
			nextLabel = this.ex < wk.length - 1 ? wk[this.ex + 1].name + ' · Set 1' : 'Session done';
		} else {
			nextLabel = 'Set ' + (nsi + 1) + ' of ' + w.sets;
		}
		this.setIdx = nsi;
		this.screen = 'rest';
		this.restEnd = Date.now() + w.rest * 1000;
		this.restTotal = w.rest;
		this.loggedText = loggedText;
		this.loggedName = w.name;
		this.nextLabel = nextLabel;
		this.ending = false;
		this.persist();
	}

	restRemaining() {
		return Math.max(0, (this.restEnd - Date.now()) / 1000);
	}

	finishSession(save) {
		const wk = this.wkList;
		this.sessionOn = false;
		this.screen = 'home';
		this.ex = 0;
		this.setIdx = 0;
		this.weight = wk[0] ? wk[0].start : 0;
		this.sheetOpen = false;
		this.endSheetOpen = false;
		this.ending = false;
		if (save) {
			const now = Date.now();
			this.lastDone = { ...this.lastDone, [this.program[this.day].id]: now };
			this.sessions = [...(this.sessions || []), now];
			// Summarise this session's working sets into one history record per exercise:
			// heaviest working set's weight/reps, and whether every working set hit target.
			const byEx = {};
			for (const l of this.sessionLog) {
				if (l.type !== 'working') continue;
				(byEx[l.exerciseName] ??= []).push(l);
			}
			const history = { ...(this.history || {}) };
			for (const [name, sets] of Object.entries(byEx)) {
				const top = sets.every((s) => s.repsActual >= s.repsTarget);
				const heaviest = sets.reduce((a, b) => (b.weight > a.weight ? b : a));
				history[name] = [...(history[name] || []), {
					t: now,
					w: heaviest.weight,
					reps: heaviest.repsActual,
					top
				}];
			}
			this.history = history;
			this.animateStreak();
		}
		this.sessionLog = [];
		this.persist();
		this.showToast(save ? 'Session saved' : 'Session discarded');
	}

	advance() {
		const wk = this.wkList;
		const w = wk[this.ex];
		if (this.setIdx >= w.sets) {
			if (this.ex === wk.length - 1) {
				this.finishSession(true);
				this.showToast('Session complete');
				return;
			}
			this.ex += 1;
			this.setIdx = 0;
			this.weight = this.recommendFor(wk[this.ex]).weight;
			this.exTick++;
		}
		this.screen = 'active';
		this.repCount = wk[this.ex].reps;
		this.ending = false;
		this.persist();
	}

	onRestComplete() {
		this.buzz([20, 60, 20, 60, 20]);
		this.advance();
	}

	startDay(i) {
		this.buzz(10);
		const wk = this.program[i].workout;
		if (!wk.length) return;
		this.sessionOn = true;
		this.day = i;
		this.startedAt = Date.now();
		this.elapsed = '00:00';
		this.ex = 0;
		this.setIdx = 0;
		this.sessionLog = [];
		this.weight = this.recommendFor(wk[0]).weight;
		this.repCount = wk[0].reps;
		this.screen = 'active';
		this.exTick++;
		this.ending = false;
		this.persist();
	}

	startOrResume() {
		this.buzz(10);
		if (!this.sessionOn) {
			this.startDay(this.order[0]);
		} else if (this.restEnd > Date.now()) {
			this.screen = 'rest';
			this.persist();
		} else {
			this.screen = 'active';
			this.persist();
		}
	}

	endSession() {
		this.buzz(8);
		this.endSheetOpen = true;
	}
	closeEndSheet() {
		this.endSheetOpen = false;
	}
	discardSession() {
		this.buzz(8);
		this.finishSession(false);
	}
	saveSession() {
		this.buzz([10, 40, 10]);
		this.finishSession(true);
	}
	goHome() {
		this.screen = 'home';
		this.persist();
	}
	plus15() {
		this.restEnd += 15000;
		this.restTotal += 15;
		this.persist();
	}
	minus15() {
		this.restEnd = Math.max(Date.now(), this.restEnd - 15000);
		this.persist();
	}
	skipRest() {
		this.buzz(8);
		this.advance();
	}

	// ---------- navigation ----------
	goPerf() {
		this.buzz(6);
		this.screen = 'perf';
	}
	openDetail(di, i, from) {
		this.buzz(6);
		this.detDay = di;
		this.detIdx = i;
		this.detFrom = from;
		this.screen = 'detail';
		this.persist();
	}
	detBack() {
		this.screen = this.detFrom === 'perf' ? 'perf' : this.detFrom === 'editDay' ? 'editDay' : 'home';
	}

	// ---------- program editing ----------
	mutateProgram(fn) {
		const program = clone(this.program);
		fn(program);
		this.program = program;
		this.persist();
	}
	openEditDay(di) {
		this.buzz(6);
		this.edDay = di;
		this.screen = 'editDay';
		this.persist();
	}
	editField(field, delta, min, max) {
		const cur = this.program[this.detDay].workout[this.detIdx];
		if (!cur) return;
		const nv = Math.min(max, Math.max(min, Math.round((cur[field] + delta) * 2) / 2));
		if (nv === cur[field]) return;
		this.buzz(8);
		this.mutateProgram((p) => (p[this.detDay].workout[this.detIdx][field] = nv));
		if (field === 'start' && this.sessionOn && this.day === this.detDay && this.ex === this.detIdx) {
			this.weight = nv;
			this.persist();
		}
	}
	removeEx(i) {
		if (this.program[this.edDay].workout.length <= 1) {
			this.showToast('A day needs at least one exercise');
			return;
		}
		this.buzz(8);
		this.mutateProgram((p) => p[this.edDay].workout.splice(i, 1));
	}
	renameDay(v) {
		this.mutateProgram((p) => (p[this.edDay].split = v));
	}

	// ---------- library ----------
	openAddEx() {
		this.buzz(6);
		this.libCat = null;
		this.libSwapIdx = null;
		this.screen = 'library';
	}
	openSwapEx(i) {
		this.buzz(6);
		this.libCat = null;
		this.libSwapIdx = i;
		this.screen = 'library';
	}
	pickCategory(cat) {
		this.buzz(6);
		this.libCat = cat;
	}
	libBack() {
		if (this.libCat) this.libCat = null;
		else this.screen = 'editDay';
	}
	pickExercise(item) {
		const names = this.program[this.edDay].workout.map((x) => x.name);
		if (
			names.includes(item.name) &&
			(this.libSwapIdx == null || this.program[this.edDay].workout[this.libSwapIdx].name !== item.name)
		) {
			this.showToast('Already in this day');
			return;
		}
		this.buzz(10);
		// Whitelist fields — callers may hand us view-model objects with extra props.
		const e = {
			name: item.name,
			icon: item.icon,
			sets: item.sets,
			reps: item.reps,
			start: item.start,
			rest: item.rest,
			trend: 'flat',
			cat: this.libCat,
			last: item.start === 0 ? 'BW × ' + item.reps : fmt(item.start) + ' × ' + item.reps
		};
		const swapIdx = this.libSwapIdx;
		this.mutateProgram((p) => {
			if (swapIdx != null) p[this.edDay].workout[swapIdx] = e;
			else p[this.edDay].workout.push(e);
		});
		this.screen = 'editDay';
		this.libCat = null;
		this.libSwapIdx = null;
		this.showToast(swapIdx != null ? 'Swapped to ' + item.name : item.name + ' added');
	}

	// ---------- add day ----------
	openAddDay() {
		this.buzz(6);
		this.addSheetOpen = true;
	}
	closeAddSheet() {
		this.addSheetOpen = false;
	}
	nextDayId() {
		const used = this.program.map((d) => d.id);
		for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') if (!used.includes(ch)) return ch;
		return 'X';
	}
	newDay() {
		this.buzz(10);
		const id = this.nextDayId();
		this.mutateProgram((p) => p.push({ id, split: 'Custom', workout: [] }));
		this.addSheetOpen = false;
		this.edDay = this.program.length - 1;
		this.screen = 'editDay';
	}
	duplicateDay(di) {
		this.buzz(10);
		const id = this.nextDayId();
		const src = this.program[di];
		this.mutateProgram((p) =>
			p.push({ id, split: src.split + ' copy', workout: clone(src.workout) })
		);
		this.addSheetOpen = false;
		this.showToast(src.split + ' duplicated');
	}
	generateVariation(di) {
		this.buzz(10);
		const src = this.program[di];
		if (!src.workout.length) {
			this.showToast('That day is empty');
			return;
		}
		const used = new Set();
		this.program.forEach((d) => d.workout.forEach((x) => used.add(x.name)));
		const workout = src.workout.map((x) => {
			const cat = x.cat || findCat(x.name) || 'Chest';
			let pool = EXDB[cat].filter((c) => !used.has(c.name));
			if (!pool.length) pool = EXDB[cat].filter((c) => c.name !== x.name);
			if (!pool.length) pool = [x];
			const pick = pool.reduce((a, b) => (this.timesDone(a.name) <= this.timesDone(b.name) ? a : b));
			used.add(pick.name);
			return {
				...pick,
				cat,
				trend: 'flat',
				last: pick.start === 0 ? 'BW × ' + pick.reps : fmt(pick.start) + ' × ' + pick.reps
			};
		});
		const baseName = src.split.replace(/\s+\d+$/, '');
		const n = this.program.filter((d) => d.split.replace(/\s+\d+$/, '') === baseName).length + 1;
		const split = baseName + ' ' + n;
		const id = this.nextDayId();
		this.mutateProgram((p) => p.push({ id, split, workout }));
		this.addSheetOpen = false;
		this.showToast(split + ' generated');
	}
	deleteDay() {
		if (this.program.length <= 1) {
			this.showToast('You need at least one day');
			return;
		}
		if (this.sessionOn && this.day === this.edDay) {
			this.showToast("Can't delete the live day");
			return;
		}
		this.buzz(8);
		const program = clone(this.program);
		program.splice(this.edDay, 1);
		this.day = this.day > this.edDay ? this.day - 1 : Math.min(this.day, program.length - 1);
		this.program = program;
		this.screen = 'home';
		this.edDay = 0;
		this.persist();
		this.showToast('Day deleted');
	}

	// ---------- settings ----------
	openSettings() {
		this.buzz(6);
		this.settingsOpen = true;
	}
	closeSettings() {
		this.settingsOpen = false;
	}
	setAccent(hex) {
		this.accent = hex;
		this.applyAccent();
		this.persist();
	}
	setMicroStep(v) {
		this.microStep = v;
		this.persist();
	}
	toggleHaptics() {
		this.haptics = !this.haptics;
		this.buzz(10);
		this.persist();
	}
}

export const store = new GymStore();
