import { it, expect, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { saveProject, listProjects, deleteProject } from '../lib/storage';
import { newProject } from '../lib/templates';
import { SimulationCore, adapters } from '../lib/simulation';
it('does not resolve a failed IndexedDB write as saved', async () => {
  const project = newProject();
  const put = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementationOnce(() => {
    throw new DOMException('quota', 'QuotaExceededError');
  });
  try {
    await expect(saveProject(project)).rejects.toThrow('저장에 실패');
  } finally {
    put.mockRestore();
  }
  expect((await listProjects()).projects.some((p) => p.id === project.id)).toBe(false);
  await saveProject(project);
  expect((await listProjects()).projects.some((p) => p.id === project.id)).toBe(true);
  await deleteProject(project.id);
});
it('skips corrupt records without deleting them', async () => {
  const request = indexedDB.open('ils-studio', 1);
  const db = await new Promise<IDBDatabase>((resolve) => {
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
  });
  const invalid = { id: 'corrupt-record', schemaVersion: 999 };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('projects', 'readwrite');
    tx.objectStore('projects').put(invalid);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  expect((await listProjects()).invalid).toBe(1);
  const record = await new Promise((resolve) => {
    const r = db.transaction('projects').objectStore('projects').get('corrupt-record');
    r.onsuccess = () => resolve(r.result);
  });
  expect(record).toEqual(invalid);
  db.close();
  await deleteProject('corrupt-record');
});
it('runs one simulation loop and cancels it on cleanup', () => {
  let callback: FrameRequestCallback = () => {};
  const frame = vi.fn((cb: FrameRequestCallback) => {
    callback = cb;
    return 7;
  });
  const cancel = vi.fn();
  vi.stubGlobal('requestAnimationFrame', frame);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const output = vi.fn();
  try {
    const core = new SimulationCore(adapters.robot, output);
    core.input(90, 20);
    core.start();
    core.start();
    expect(frame).toHaveBeenCalledTimes(1);
    callback(100);
    callback(116);
    expect(core.state.x).toBeGreaterThan(50);
    core.pause();
    expect(core.state.running).toBe(false);
    expect(cancel).toHaveBeenCalledWith(7);
    core.reset();
    expect(core.state.time).toBe(0);
    core.dispose();
    const calls = output.mock.calls.length;
    core.input(20, 30);
    core.start();
    expect(output).toHaveBeenCalledTimes(calls);
  } finally {
    vi.unstubAllGlobals();
  }
});
