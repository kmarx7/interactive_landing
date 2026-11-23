// @vitest-environment jsdom
import { beforeAll, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import Studio from '../components/studio';
import Editor from '../components/editor';
import { newProject } from '../lib/templates';
import { listProjects, deleteProject } from '../lib/storage';
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(async () => {
  cleanup();
  const result = await listProjects();
  for (const p of result.projects) await deleteProject(p.id);
});
describe('real studio editing journey', () => {
  it('creates, edits, undoes, redoes, saves and reopens a project', async () => {
    render(<Studio />);
    await screen.findByText('첫 번째 프로젝트를 만들어 보세요.');
    fireEvent.click(screen.getByRole('button', { name: '새 프로젝트' }));
    fireEvent.change(screen.getByLabelText('새 프로젝트 이름'), {
      target: { value: 'Verified project' },
    });
    fireEvent.click(screen.getByRole('button', { name: '프로젝트 만들기' }));
    await screen.findByRole('textbox', { name: '프로젝트 이름' });
    const title = screen.getByLabelText('제목', { exact: true });
    fireEvent.change(title, { target: { value: 'A story worth saving' } });
    fireEvent.blur(title);
    expect(screen.getByRole('heading', { name: 'A story worth saving' })).toBeVisible();
    fireEvent.click(screen.getByLabelText('Undo', { exact: true }));
    expect(
      screen.getByRole('heading', { name: /Less busywork\.\s+More possibility\./ }),
    ).toBeVisible();
    fireEvent.click(screen.getByLabelText('Redo', { exact: true }));
    expect(screen.getByRole('heading', { name: 'A story worth saving' })).toBeVisible();
    fireEvent.click(screen.getByLabelText('프로젝트 저장', { exact: true }));
    await waitFor(() =>
      expect(screen.getByLabelText('프로젝트 저장', { exact: true })).toHaveTextContent(
        '모든 변경사항 저장됨',
      ),
    );
    const saved = await listProjects();
    expect(saved.projects[0].page.sections[0].content.title).toBe('A story worth saving');
    fireEvent.click(screen.getByLabelText('프로젝트 목록으로'));
    await screen.findByLabelText('Verified project 열기');
    fireEvent.click(screen.getByLabelText('Verified project 열기'));
    await screen.findByRole('heading', { name: 'A story worth saving' });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const tab = screen.getByRole('tab', { name: 'Create' });
    fireEvent.click(tab);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('아이디어를 직접 만들고 실험해 보세요.');
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('제목', { exact: true })).toHaveValue('A story worth saving');
  }, 15000);
  it('keeps content while applying style and edits section commands', async () => {
    const initial = newProject();
    const saves = vi.fn().mockResolvedValue(undefined);
    render(<Editor initial={initial} onSave={saves} onExit={() => {}} notify={() => {}} />);
    fireEvent.click(screen.getByLabelText('Styles', { exact: true }));
    fireEvent.click(screen.getByLabelText('Earthy Calm 적용'));
    expect(
      screen.getByRole('heading', { name: /Less busywork\.\s+More possibility\./ }),
    ).toBeVisible();
    expect(document.querySelector('.landing')).toHaveClass('style-earthy-calm');
    fireEvent.click(screen.getByLabelText('선택 섹션 복제'));
    expect(
      screen.getAllByRole('heading', { name: /Less busywork\.\s+More possibility\./ }),
    ).toHaveLength(2);
    fireEvent.click(screen.getByLabelText('선택 섹션 삭제'));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '섹션 삭제' }));
    expect(
      screen.getAllByRole('heading', { name: /Less busywork\.\s+More possibility\./ }),
    ).toHaveLength(1);
    fireEvent.click(screen.getByLabelText('Undo', { exact: true }));
    expect(
      screen.getAllByRole('heading', { name: /Less busywork\.\s+More possibility\./ }),
    ).toHaveLength(2);
  });
  it('does not display saved or leave when persistence fails', async () => {
    const save = vi.fn().mockRejectedValue(new Error('저장 공간 부족'));
    const exit = vi.fn();
    render(<Editor initial={newProject()} onSave={save} onExit={exit} notify={() => {}} />);
    fireEvent.change(screen.getByLabelText('제목', { exact: true }), {
      target: { value: 'Unsaved work' },
    });
    fireEvent.blur(screen.getByLabelText('제목', { exact: true }));
    fireEvent.click(screen.getByLabelText('프로젝트 저장', { exact: true }));
    await screen.findByText('저장 공간 부족');
    expect(screen.getByLabelText('프로젝트 저장', { exact: true })).toHaveTextContent('저장 실패');
    expect(screen.getByRole('heading', { name: 'Unsaved work' })).toBeVisible();
    fireEvent.click(screen.getByLabelText('프로젝트 목록으로'));
    await screen.findByRole('dialog');
    expect(exit).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: '작업을 저장하지 못했습니다' })).toBeVisible();
  });
  it('protects uncommitted typing and commits the focused draft before keyboard save', async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(undefined);
    render(<Editor initial={newProject()} onSave={save} onExit={() => {}} notify={() => {}} />);
    const title = screen.getByLabelText('제목', { exact: true });
    await user.clear(title);
    await user.type(title, 'Protected draft');
    expect(screen.getByLabelText('프로젝트 저장', { exact: true })).toHaveTextContent(
      '저장 대기 중',
    );
    const closing = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(closing);
    expect(closing.defaultPrevented).toBe(true);
    await user.keyboard('{Control>}s{/Control}');
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls.at(-1)?.[0].page.sections[0].content.title).toBe('Protected draft');
    await waitFor(() =>
      expect(screen.getByLabelText('프로젝트 저장', { exact: true })).toHaveTextContent(
        '모든 변경사항 저장됨',
      ),
    );
  });
});
