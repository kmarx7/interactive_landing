import { Project } from './schema';
export type History = { past: Project[]; present: Project; future: Project[] };
export type Action = { type: 'change'; project: Project } | { type: 'undo' } | { type: 'redo' };
export function historyReducer(state: History, action: Action): History {
  if (action.type === 'change') {
    if (JSON.stringify(action.project) === JSON.stringify(state.present)) return state;
    return {
      past: [...state.past, state.present].slice(-80),
      present: { ...action.project, updatedAt: new Date().toISOString() },
      future: [],
    };
  }
  if (action.type === 'undo' && state.past.length) {
    return {
      past: state.past.slice(0, -1),
      present: state.past.at(-1)!,
      future: [state.present, ...state.future],
    };
  }
  if (action.type === 'redo' && state.future.length) {
    return {
      past: [...state.past, state.present],
      present: state.future[0],
      future: state.future.slice(1),
    };
  }
  return state;
}
