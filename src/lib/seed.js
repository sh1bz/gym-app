// Seed program + exercise library, ported from the design prototype.
// SEED_PROGRAM is the starting Push/Pull/Legs split; EXDB is the pickable catalog.

export const SEED_PROGRAM = [
	{
		id: 'A',
		split: 'Push',
		workout: [
			{ trend: 'up', name: 'Bench Press', sets: 4, reps: 6, start: 100, last: '100 × 6', rest: 180, icon: 'bar', cat: 'Chest' },
			{ trend: 'down', name: 'Squat', sets: 3, reps: 5, start: 130, last: '127.5 × 5', rest: 180, icon: 'bar', cat: 'Legs' },
			{ trend: 'up', name: 'Chest-Supported Row', sets: 4, reps: 10, start: 70, last: '70 × 10', rest: 90, icon: 'bar', cat: 'Back' },
			{ trend: 'flat', name: 'Incline DB Press', sets: 3, reps: 10, start: 30, last: '30 × 10', rest: 90, icon: 'db', cat: 'Chest' },
			{ trend: 'up', name: 'Hanging Leg Raise', sets: 3, reps: 12, start: 0, last: 'BW × 12', rest: 60, icon: 'bw', cat: 'Core' }
		]
	},
	{
		id: 'B',
		split: 'Pull',
		workout: [
			{ trend: 'up', name: 'Deadlift', sets: 3, reps: 5, start: 160, last: '160 × 5', rest: 180, icon: 'bar', cat: 'Back' },
			{ trend: 'flat', name: 'Weighted Pull-Up', sets: 4, reps: 6, start: 10, last: '10 × 6', rest: 120, icon: 'bw', cat: 'Back' },
			{ trend: 'down', name: 'Barbell Row', sets: 4, reps: 8, start: 80, last: '77.5 × 8', rest: 90, icon: 'bar', cat: 'Back' },
			{ trend: 'flat', name: 'Face Pull', sets: 3, reps: 15, start: 25, last: '25 × 15', rest: 60, icon: 'db', cat: 'Shoulders' },
			{ trend: 'down', name: 'Barbell Curl', sets: 3, reps: 10, start: 35, last: '35 × 9', rest: 60, icon: 'bar', cat: 'Arms' }
		]
	},
	{
		id: 'C',
		split: 'Legs',
		workout: [
			{ trend: 'up', name: 'Front Squat', sets: 3, reps: 6, start: 90, last: '90 × 6', rest: 180, icon: 'bar', cat: 'Legs' },
			{ trend: 'up', name: 'Romanian Deadlift', sets: 3, reps: 8, start: 100, last: '100 × 8', rest: 120, icon: 'bar', cat: 'Legs' },
			{ trend: 'down', name: 'Leg Press', sets: 3, reps: 10, start: 180, last: '175 × 10', rest: 90, icon: 'bar', cat: 'Legs' },
			{ trend: 'flat', name: 'Standing Calf Raise', sets: 4, reps: 12, start: 60, last: '60 × 12', rest: 60, icon: 'db', cat: 'Legs' },
			{ trend: 'up', name: 'Ab Wheel Rollout', sets: 3, reps: 10, start: 0, last: 'BW × 10', rest: 60, icon: 'bw', cat: 'Core' }
		]
	}
];

// The pickable exercise catalog — the most common movements per muscle group.
// Reference data bundled with the app (works offline). Weights are sensible
// starting suggestions the user tweaks per exercise.
export const EXDB = {
	Chest: [
		{ name: 'Bench Press', icon: 'bar', sets: 4, reps: 6, start: 100, rest: 180 },
		{ name: 'Incline Bench Press', icon: 'bar', sets: 4, reps: 8, start: 80, rest: 150 },
		{ name: 'Decline Bench Press', icon: 'bar', sets: 3, reps: 8, start: 90, rest: 150 },
		{ name: 'Dumbbell Bench Press', icon: 'db', sets: 4, reps: 10, start: 32.5, rest: 120 },
		{ name: 'Incline DB Press', icon: 'db', sets: 3, reps: 10, start: 30, rest: 90 },
		{ name: 'Weighted Dip', icon: 'bw', sets: 3, reps: 8, start: 10, rest: 120 },
		{ name: 'Cable Fly', icon: 'db', sets: 3, reps: 12, start: 20, rest: 60 },
		{ name: 'Pec Deck', icon: 'db', sets: 3, reps: 12, start: 45, rest: 60 },
		{ name: 'Dumbbell Pullover', icon: 'db', sets: 3, reps: 12, start: 25, rest: 60 },
		{ name: 'Push-Up', icon: 'bw', sets: 3, reps: 15, start: 0, rest: 60 }
	],
	Back: [
		{ name: 'Deadlift', icon: 'bar', sets: 3, reps: 5, start: 160, rest: 180 },
		{ name: 'Rack Pull', icon: 'bar', sets: 3, reps: 5, start: 180, rest: 180 },
		{ name: 'Barbell Row', icon: 'bar', sets: 4, reps: 8, start: 80, rest: 90 },
		{ name: 'Pendlay Row', icon: 'bar', sets: 4, reps: 6, start: 85, rest: 120 },
		{ name: 'T-Bar Row', icon: 'bar', sets: 4, reps: 10, start: 60, rest: 90 },
		{ name: 'Chest-Supported Row', icon: 'bar', sets: 4, reps: 10, start: 70, rest: 90 },
		{ name: 'Single-Arm DB Row', icon: 'db', sets: 3, reps: 10, start: 34, rest: 90 },
		{ name: 'Seated Cable Row', icon: 'db', sets: 3, reps: 10, start: 65, rest: 90 },
		{ name: 'Lat Pulldown', icon: 'db', sets: 3, reps: 10, start: 60, rest: 90 },
		{ name: 'Weighted Pull-Up', icon: 'bw', sets: 4, reps: 6, start: 10, rest: 120 },
		{ name: 'Chin-Up', icon: 'bw', sets: 3, reps: 8, start: 0, rest: 120 }
	],
	Shoulders: [
		{ name: 'Overhead Press', icon: 'bar', sets: 4, reps: 6, start: 60, rest: 180 },
		{ name: 'Seated DB Press', icon: 'db', sets: 4, reps: 8, start: 24, rest: 120 },
		{ name: 'Arnold Press', icon: 'db', sets: 3, reps: 10, start: 22.5, rest: 90 },
		{ name: 'Lateral Raise', icon: 'db', sets: 3, reps: 15, start: 10, rest: 60 },
		{ name: 'Cable Lateral Raise', icon: 'db', sets: 3, reps: 15, start: 7.5, rest: 60 },
		{ name: 'Rear Delt Fly', icon: 'db', sets: 3, reps: 15, start: 12.5, rest: 60 },
		{ name: 'Face Pull', icon: 'db', sets: 3, reps: 15, start: 25, rest: 60 },
		{ name: 'Upright Row', icon: 'bar', sets: 3, reps: 12, start: 30, rest: 60 },
		{ name: 'Barbell Shrug', icon: 'bar', sets: 4, reps: 12, start: 100, rest: 90 }
	],
	Legs: [
		{ name: 'Squat', icon: 'bar', sets: 3, reps: 5, start: 130, rest: 180 },
		{ name: 'Front Squat', icon: 'bar', sets: 3, reps: 6, start: 90, rest: 180 },
		{ name: 'Hack Squat', icon: 'bar', sets: 3, reps: 10, start: 120, rest: 120 },
		{ name: 'Leg Press', icon: 'bar', sets: 3, reps: 10, start: 180, rest: 90 },
		{ name: 'Romanian Deadlift', icon: 'bar', sets: 3, reps: 8, start: 100, rest: 120 },
		{ name: 'Hip Thrust', icon: 'bar', sets: 3, reps: 10, start: 100, rest: 90 },
		{ name: 'Bulgarian Split Squat', icon: 'db', sets: 3, reps: 10, start: 20, rest: 90 },
		{ name: 'Walking Lunge', icon: 'db', sets: 3, reps: 12, start: 20, rest: 90 },
		{ name: 'Goblet Squat', icon: 'db', sets: 3, reps: 12, start: 24, rest: 90 },
		{ name: 'Leg Extension', icon: 'db', sets: 3, reps: 12, start: 55, rest: 60 },
		{ name: 'Leg Curl', icon: 'db', sets: 3, reps: 12, start: 45, rest: 60 },
		{ name: 'Standing Calf Raise', icon: 'db', sets: 4, reps: 12, start: 60, rest: 60 },
		{ name: 'Seated Calf Raise', icon: 'db', sets: 4, reps: 15, start: 40, rest: 60 }
	],
	Arms: [
		{ name: 'Barbell Curl', icon: 'bar', sets: 3, reps: 10, start: 35, rest: 60 },
		{ name: 'Dumbbell Curl', icon: 'db', sets: 3, reps: 12, start: 14, rest: 60 },
		{ name: 'Hammer Curl', icon: 'db', sets: 3, reps: 10, start: 16, rest: 60 },
		{ name: 'Preacher Curl', icon: 'bar', sets: 3, reps: 10, start: 25, rest: 60 },
		{ name: 'Cable Curl', icon: 'db', sets: 3, reps: 12, start: 25, rest: 60 },
		{ name: 'Concentration Curl', icon: 'db', sets: 3, reps: 12, start: 12, rest: 60 },
		{ name: 'Close-Grip Bench', icon: 'bar', sets: 3, reps: 8, start: 70, rest: 120 },
		{ name: 'Skullcrusher', icon: 'bar', sets: 3, reps: 10, start: 30, rest: 90 },
		{ name: 'Overhead Triceps Extension', icon: 'db', sets: 3, reps: 12, start: 25, rest: 60 },
		{ name: 'Triceps Pushdown', icon: 'db', sets: 3, reps: 12, start: 30, rest: 60 },
		{ name: 'Triceps Dip', icon: 'bw', sets: 3, reps: 12, start: 0, rest: 90 }
	],
	Core: [
		{ name: 'Hanging Leg Raise', icon: 'bw', sets: 3, reps: 12, start: 0, rest: 60 },
		{ name: 'Hanging Knee Raise', icon: 'bw', sets: 3, reps: 15, start: 0, rest: 60 },
		{ name: 'Ab Wheel Rollout', icon: 'bw', sets: 3, reps: 10, start: 0, rest: 60 },
		{ name: 'Plank', icon: 'bw', sets: 3, reps: 60, start: 0, rest: 60 },
		{ name: 'Cable Crunch', icon: 'db', sets: 3, reps: 15, start: 40, rest: 60 },
		{ name: 'Russian Twist', icon: 'db', sets: 3, reps: 20, start: 10, rest: 60 },
		{ name: 'Bicycle Crunch', icon: 'bw', sets: 3, reps: 20, start: 0, rest: 45 },
		{ name: 'Crunch', icon: 'bw', sets: 3, reps: 20, start: 0, rest: 45 },
		{ name: 'Sit-Up', icon: 'bw', sets: 3, reps: 20, start: 0, rest: 45 },
		{ name: 'Dead Bug', icon: 'bw', sets: 3, reps: 12, start: 0, rest: 45 }
	]
};

export const CATS = Object.keys(EXDB);
export const DAY_MS = 86400000;
