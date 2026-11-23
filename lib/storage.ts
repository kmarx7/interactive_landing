import { parseProject, Project } from './schema';
const DB = 'ils-studio';
const STORE = 'projects';
const writeError = () =>
  new Error('저장에 실패했습니다. 저장 공간을 확인하고 JSON 백업을 내려받으세요.');
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let blocked = false;
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE))
        req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => {
      if (blocked) {
        req.result.close();
        return;
      }
      req.result.onversionchange = () => req.result.close();
      resolve(req.result);
    };
    req.onerror = () =>
      reject(new Error('저장소를 열 수 없습니다. 브라우저 저장소 권한을 확인하세요.'));
    req.onblocked = () => {
      blocked = true;
      reject(new Error('다른 탭이 저장소를 사용 중입니다. 다른 ILS 탭을 닫아 주세요.'));
    };
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(STORE, mode);
    } catch {
      db.close();
      reject(writeError());
      return;
    }
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(writeError());
    };
    try {
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(req.result);
      };
    } catch {
      try {
        tx.abort();
      } catch {
        /* A completed transaction cannot be aborted. */
      }
      db.close();
      reject(writeError());
    }
  });
}
export async function listProjects() {
  const all = await transaction<unknown[]>('readonly', (s) => s.getAll());
  const valid: Project[] = [];
  let invalid = 0;
  for (const p of all) {
    try {
      valid.push(parseProject(p));
    } catch {
      invalid++;
    }
  }
  return { projects: valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), invalid };
}
export async function saveProject(project: Project) {
  const valid = parseProject(project);
  await transaction('readwrite', (s) => s.put(valid));
  return valid;
}
export async function deleteProject(id: string) {
  await transaction('readwrite', (s) => s.delete(id));
}
export function downloadProject(project: Project) {
  const valid = parseProject(project);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(valid, null, 2)], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = valid.name.replace(/[^\w가-힣-]/g, '_') + '.ils.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
