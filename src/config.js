export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
].join(' ');

export const GOOGLE_API = 'https://www.googleapis.com/calendar/v3';
export const GOOGLE_TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

export const TOKEN_KEY = 'stilltime-google-token';
export const USER_KEY = 'stilltime-google-user';

export const VIEWS = ['Day', 'Week', 'Month', 'Semester', 'Quarter', 'Year'];

export const COLORS = {
  sage: '#91a889',
  blue: '#a6bed1',
  lavender: '#c2b3d5',
  peach: '#e8b49b',
  yellow: '#e7ce88',
};