import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  projectSchema,
  createSection,
  componentTypes,
  importProject,
  parseProject,
} from '../lib/schema';
import { newProject, templates } from '../lib/templates';
import { historyReducer } from '../lib/history';
import { contrast, styles, resolveColors } from '../lib/catalog';
import { saveProject, listProjects, deleteProject } from '../lib/storage';
import { adapters, initialSimulation } from '../lib/simulation';
describe('project trust boundary', () => {
  it.each(templates.map((t) => t.id))('validates %s template and preserves roundtrip', (id) => {
    const p = newProject(id);
    expect(projectSchema.safeParse(p).success).toBe(true);
    expect(importProject(JSON.stringify(p))).toEqual(p);
  });
  it.each(componentTypes)('validates %s default section', (type) => {
    const p = newProject();
    p.page.sections = [createSection(type)];
    expect(parseProject(p)).toEqual(p);
  });
  it('rejects future schema, corrupt JSON and oversized imports', () => {
    const p = newProject();
    expect(() => parseProject({ ...p, schemaVersion: 2 })).toThrow();
    expect(() => importProject('not JSON')).toThrow();
    expect(() => importProject(' '.repeat(5000001))).toThrow();
  });
  it('rejects executable URLs, unknown components and duplicate IDs', () => {
    const p = newProject();
    p.page.sections[0].content.url = 'javascript:alert(1)';
    expect(() => parseProject(p)).toThrow();
    p.page.sections[0].content.url = '#safe';
    expect(() =>
      parseProject({
        ...p,
        page: { ...p.page, sections: [{ ...p.page.sections[0], type: 'run-code' }] },
      }),
    ).toThrow();
    p.page.sections.push(p.page.sections[0]);
    expect(() => parseProject(p)).toThrow();
  });
  it('rejects malformed colors and out of range design', () => {
    const p = newProject();
    expect(() =>
      parseProject({ ...p, theme: { ...p.theme, overrides: { primary: 'red;url(x)' } } }),
    ).toThrow();
    p.page.sections[0].design.padding = -20;
    expect(() => parseProject(p)).toThrow();
  });
});
describe('edit command history', () => {
  it('undo/redo restores content and new commands discard redo', () => {
    const p = newProject();
    let h = { past: [] as (typeof p)[], present: p, future: [] as (typeof p)[] };
    h = historyReducer(h, { type: 'change', project: { ...p, name: 'Changed' } });
    h = historyReducer(h, { type: 'undo' });
    expect(h.present.name).toBe(p.name);
    h = historyReducer(h, { type: 'redo' });
    expect(h.present.name).toBe('Changed');
    h = historyReducer(h, { type: 'undo' });
    h = historyReducer(h, { type: 'change', project: { ...p, name: 'New direction' } });
    expect(h.future).toEqual([]);
  });
  it('retains a bounded history', () => {
    const p = newProject();
    let h = { past: [] as (typeof p)[], present: p, future: [] as (typeof p)[] };
    for (let i = 0; i < 100; i++)
      h = historyReducer(h, { type: 'change', project: { ...h.present, name: String(i) } });
    expect(h.past).toHaveLength(80);
  });
});
describe('IndexedDB integrity', () => {
  it('persists, updates and deletes without mutating sibling projects', async () => {
    const a = newProject('physical'),
      b = newProject('somssi');
    await saveProject(a);
    await saveProject(b);
    await saveProject({ ...a, name: 'Renamed' });
    const loaded = await listProjects();
    expect(loaded.projects.find((p) => p.id === a.id)?.name).toBe('Renamed');
    expect(loaded.projects.find((p) => p.id === b.id)).toEqual(b);
    await deleteProject(a.id);
    expect((await listProjects()).projects.some((p) => p.id === a.id)).toBe(false);
    await deleteProject(b.id);
  });
  it('rejects invalid writes before touching the DB', async () => {
    const p = newProject();
    await expect(saveProject({ ...p, schemaVersion: 9 } as never)).rejects.toThrow();
    expect((await listProjects()).projects.some((x) => x.id === p.id)).toBe(false);
  });
});
describe('design separation', () => {
  it('catalog exposes 30 styles and 3 applicable styles', () => {
    expect(styles).toHaveLength(30);
    expect(styles.filter((s) => s.ready)).toHaveLength(3);
  });
  it('palette overrides do not change content or behavior', () => {
    const p = newProject('physical'),
      before = JSON.stringify(p.page);
    const theme = { ...p.theme, paletteId: 'sunset', overrides: { primary: '#123456' } };
    expect(resolveColors(theme).primary).toBe('#123456');
    expect(JSON.stringify(p.page)).toBe(before);
  });
  it('uses WCAG relative luminance', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBe(1);
  });
});
describe('simulation adapters', () => {
  it.each(['drag', 'robot'] as const)('%s approaches target with bounded dt', (id) => {
    let s = { ...initialSimulation(), targetX: 85, targetY: 20 };
    for (let i = 0; i < 120; i++) s = adapters[id].update(s, 1 / 60);
    expect(s.x).toBeCloseTo(85, 1);
    expect(s.y).toBeCloseTo(20, 1);
    expect(s.time).toBeCloseTo(2);
  });
  it('music energy decays', () => {
    const s = { ...initialSimulation(), energy: 40 };
    expect(adapters.string.update(s, 0.5).energy).toBeLessThan(s.energy);
  });
});
