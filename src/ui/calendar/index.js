import { state } from '../../state.js';
import { renderMonth } from './month.js';
import { renderWeek } from './week.js';
import { renderDay } from './day.js';
import {
  renderSemester,
  renderQuarter,
  renderThreeMonth,
  renderYear,
} from './longRange.js';

export function renderCalendar() {
  if (state.view === 'Month') return renderMonth();
  if (state.view === 'Week') return renderWeek();
  if (state.view === 'Day') return renderDay();
  if (state.view === 'Semester') return renderSemester();
  if (state.view === 'Quarter') return renderQuarter();
  if (state.view === 'ThreeMonth') return renderThreeMonth();
  return renderYear();
}