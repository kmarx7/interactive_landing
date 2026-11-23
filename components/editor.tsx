'use client';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  GripVertical,
  Layers,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Palette,
  Plus,
  Redo2,
  Search,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  X,
  Save,
  AlertCircle,
  Keyboard,
} from 'lucide-react';
import { Project, Section, createSection, ComponentType, uid, projectSchema } from '@/lib/schema';
import { historyReducer } from '@/lib/history';
import { registry, styles, Style } from '@/lib/catalog';
import { downloadProject } from '@/lib/storage';
import { templates, newProject } from '@/lib/templates';
import { PageRenderer } from './page-renderer';
import { PreviewScrollContext } from './motion-section';
import Inspector from './inspector';
import { ColorStudio } from './color-studio';
import { StyleGallery, StylePreview } from './style-gallery';
import { DraftContext, DraftInput, Field, Modal, Range } from './ui';
type Panel = 'layers' | 'components' | 'templates' | 'styles' | 'colors';
export default function Editor({
  initial,
  onSave,
  onExit,
  notify,
}: {
  initial: Project;
  onSave: (p: Project) => Promise<void>;
  onExit: () => void;
  notify: (s: string) => void;
}) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial,
    future: [],
  });
  const p = history.present;
  const [selected, setSelected] = useState<string | null>(p.page.sections[0]?.id || null),
    [panel, setPanel] = useState<Panel>('layers'),
    [preview, setPreview] = useState(false),
    [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop'),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('All'),
    [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved'),
    [error, setError] = useState(''),
    [settings, setSettings] = useState(false),
    [gallery, setGallery] = useState(false),
    [exportOpen, setExportOpen] = useState(false),
    [deleting, setDeleting] = useState<string | null>(null),
    [templateConfirm, setTemplateConfirm] = useState<string | null>(null),
    [exitError, setExitError] = useState(false),
    [toast, setToast] = useState('');
  const canvasScroll = useRef<HTMLDivElement>(null);
  const pendingDrafts = useRef(new Set<string>());
  const [pendingCount, setPendingCount] = useState(0);
  const reportDraft = useCallback((id: string, dirty: boolean) => {
    if (dirty) pendingDrafts.current.add(id);
    else pendingDrafts.current.delete(id);
    setPendingCount(pendingDrafts.current.size);
  }, []);
  const visibleSaveState = pendingCount && saveState !== 'error' ? 'dirty' : saveState;
  const dragged = useRef<string | null>(null),
    queue = useRef<Promise<void>>(Promise.resolve()),
    current = useRef(p),
    mounted = useRef(true),
    lastSaved = useRef(JSON.stringify(initial));
  current.current = p;
  const change = useCallback((next: Project) => {
    const result = projectSchema.safeParse(next);
    if (result.success) {
      dispatch({ type: 'change', project: result.data });
      setError('');
    } else setError(result.error.issues[0]?.message || '유효하지 않은 값입니다.');
  }, []);
  const persist = useCallback(
    async (project: Project) => {
      const snapshot = JSON.stringify(project);
      setSaveState('saving');
      const task = queue.current.catch(() => {}).then(() => onSave(project));
      queue.current = task;
      try {
        await task;
        lastSaved.current = snapshot;
        if (mounted.current)
          setSaveState(JSON.stringify(current.current) === snapshot ? 'saved' : 'dirty');
      } catch (e) {
        if (mounted.current) {
          setSaveState('error');
          setError((e as Error).message);
        }
        throw e;
      }
    },
    [onSave],
  );
  const saveRef = useRef(persist);
  saveRef.current = persist;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (JSON.stringify(p) === lastSaved.current) return;
    setSaveState('dirty');
    const t = setTimeout(() => {
      void saveRef.current(p).catch(() => {});
    }, 650);
    return () => clearTimeout(t);
  }, [p]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (pendingDrafts.current.size || JSON.stringify(current.current) !== lastSaved.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement;
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setTimeout(() => {
          void saveRef.current(current.current).catch(() => {});
        }, 0);
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
        return;
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
      }
      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        dispatch({ type: 'redo' });
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const section = p.page.sections.find((s) => s.id === selected) || null;
  function update(s: Section) {
    change({
      ...p,
      page: { ...p.page, sections: p.page.sections.map((x) => (x.id === s.id ? s : x)) },
    });
  }
  function add(type: ComponentType) {
    const s = createSection(type);
    s.label = registry[type].name;
    change({ ...p, page: { ...p.page, sections: [...p.page.sections, s] } });
    setSelected(s.id);
    setPanel('layers');
    setToast('섹션을 추가했습니다. 레이어에서 순서를 변경할 수 있습니다.');
  }
  function move(id: string, delta: number) {
    const arr = [...p.page.sections],
      i = arr.findIndex((s) => s.id === id),
      next = i + delta;
    if (i < 0 || next < 0 || next >= arr.length) return;
    [arr[i], arr[next]] = [arr[next], arr[i]];
    change({ ...p, page: { ...p.page, sections: arr } });
  }
  function duplicate(id: string) {
    const s = p.page.sections.find((x) => x.id === id);
    if (!s) return;
    const clone = structuredClone(s);
    clone.id = uid();
    clone.label += ' (복사)';
    clone.content.items = clone.content.items.map((i) => ({ ...i, id: uid() }));
    const arr = [...p.page.sections];
    arr.splice(arr.findIndex((x) => x.id === id) + 1, 0, clone);
    change({ ...p, page: { ...p.page, sections: arr } });
    setSelected(clone.id);
  }
  function applyStyle(s: Style) {
    if (!s.ready) return;
    change({
      ...p,
      theme: { ...p.theme, styleId: s.id },
    });
    setToast(s.name + ' 스타일을 적용했습니다. 팔레트는 유지됩니다.');
  }
  async function exit() {
    try {
      await saveRef.current(current.current);
      onExit();
    } catch {
      setExitError(true);
    }
  }
  return (
    <DraftContext.Provider value={reportDraft}>
      <div className={'editor-shell ' + (preview ? 'preview-mode' : '')}>
        <header className="editor-toolbar">
          <div className="editor-project">
            <button
              className="icon-button"
              aria-label="프로젝트 목록으로"
              onClick={() => void exit()}
            >
              <ArrowLeft size={19} />
            </button>
            <span className="editor-logo">✳</span>
            <div className="editor-name">
              <DraftInput
                label="프로젝트 이름"
                value={p.name}
                onCommit={(name) => name.trim() && change({ ...p, name })}
              />
              <button
                className={'save-status ' + visibleSaveState}
                onClick={() => void persist(p).catch(() => {})}
                aria-label="프로젝트 저장"
              >
                {visibleSaveState === 'saved' ? (
                  <Check size={12} />
                ) : visibleSaveState === 'error' ? (
                  <AlertCircle size={12} />
                ) : (
                  <span className="save-dot" />
                )}
                {visibleSaveState === 'saved'
                  ? '모든 변경사항 저장됨'
                  : visibleSaveState === 'saving'
                    ? '저장 중…'
                    : visibleSaveState === 'error'
                      ? '저장 실패 · 재시도'
                      : '저장 대기 중'}
              </button>
            </div>
          </div>
          <div className="toolbar-history">
            <button
              className="icon-button"
              aria-label="Undo"
              title="실행 취소 (⌘Z)"
              disabled={!history.past.length}
              onClick={() => dispatch({ type: 'undo' })}
            >
              <Undo2 size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Redo"
              title="다시 실행 (⌘⇧Z)"
              disabled={!history.future.length}
              onClick={() => dispatch({ type: 'redo' })}
            >
              <Redo2 size={17} />
            </button>
          </div>
          <div className="viewport-switch" role="group" aria-label="화면 크기">
            {(
              [
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                title={v.label}
                aria-label={v.label}
                aria-pressed={viewport === v.id}
                className={viewport === v.id ? 'active' : ''}
                onClick={() => setViewport(v.id)}
              >
                <v.icon size={17} />
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <div className="mode-switch">
              <button className={!preview ? 'active' : ''} onClick={() => setPreview(false)}>
                <MousePointer2 size={14} />
                Edit
              </button>
              <button className={preview ? 'active' : ''} onClick={() => setPreview(true)}>
                <Eye size={14} />
                Preview
              </button>
            </div>
            <button
              className="icon-button"
              title="프로젝트 설정"
              aria-label="프로젝트 설정"
              onClick={() => setSettings(true)}
            >
              <Settings2 size={18} />
            </button>
            <button
              className="button button-primary export-button"
              onClick={() => setExportOpen(true)}
            >
              <Download size={15} />
              <span>내보내기</span>
            </button>
          </div>
        </header>
        {error && (
          <div className="editor-error" role="alert">
            <AlertCircle size={15} />
            {error}
            <button onClick={() => setError('')}>닫기</button>
          </div>
        )}
        <div className="editor-body">
          {!preview && (
            <>
              <nav className="editor-rail" aria-label="편집 도구">
                {(
                  [
                    { id: 'layers', icon: Layers, label: 'Layers' },
                    { id: 'components', icon: Plus, label: 'Blocks' },
                    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
                    { id: 'styles', icon: Palette, label: 'Styles' },
                    { id: 'colors', icon: Settings2, label: 'Colors' },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    className={panel === v.id ? 'active' : ''}
                    onClick={() => {
                      setPanel(v.id);
                      setQuery('');
                    }}
                    aria-label={v.label}
                    title={v.label}
                  >
                    <v.icon size={19} />
                    <small>{v.label}</small>
                  </button>
                ))}
                <button
                  className="rail-bottom"
                  title="저장 (⌘S)"
                  aria-label="지금 저장"
                  onClick={() => void persist(p).catch(() => {})}
                >
                  <Save size={19} />
                  <small>Save</small>
                </button>
              </nav>
              <aside className="library-panel">
                <div className="library-heading">
                  <h2>
                    {panel === 'layers'
                      ? '페이지 구조'
                      : panel === 'components'
                        ? '컴포넌트'
                        : panel === 'templates'
                          ? '템플릿'
                          : panel === 'styles'
                            ? '디자인 스타일'
                            : '컬러 스튜디오'}
                  </h2>
                  <span>
                    {panel === 'layers'
                      ? p.page.sections.length + ' SECTIONS'
                      : panel === 'components'
                        ? '32 BLOCKS'
                        : panel === 'styles'
                          ? '30 STYLES'
                          : 'ILS LIBRARY'}
                  </span>
                </div>
                {panel === 'layers' ? (
                  <>
                    <div className="page-label">
                      <span className="page-label-icon">
                        <LayoutTemplate size={15} />
                      </span>
                      <span>
                        {p.page.title}
                        <small>Landing page</small>
                      </span>
                    </div>
                    <div className="layers-list">
                      {p.page.sections.map((s, i) => (
                        <div
                          key={s.id}
                          className={'layer-item ' + (selected === s.id ? 'active' : '')}
                          draggable
                          onDragStart={() => {
                            dragged.current = s.id;
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const from = p.page.sections.findIndex((x) => x.id === dragged.current),
                              to = i;
                            if (from < 0 || from === to) return;
                            const arr = [...p.page.sections];
                            arr.splice(to, 0, arr.splice(from, 1)[0]);
                            change({ ...p, page: { ...p.page, sections: arr } });
                            dragged.current = null;
                          }}
                        >
                          <button className="layer-main" onClick={() => setSelected(s.id)}>
                            <GripVertical size={13} />
                            <span className="layer-type-icon">
                              <Layers size={14} />
                            </span>
                            <span>
                              {s.label}
                              <small>{registry[s.type].name}</small>
                            </span>
                          </button>
                          <div className="layer-item-actions">
                            <button
                              aria-label={s.label + ' 위로'}
                              disabled={i === 0}
                              onClick={() => move(s.id, -1)}
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              aria-label={s.label + ' 아래로'}
                              disabled={i === p.page.sections.length - 1}
                              onClick={() => move(s.id, 1)}
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="add-section-button" onClick={() => setPanel('components')}>
                      <Plus size={16} />
                      섹션 추가
                    </button>
                    <div className="panel-bottom-note">
                      <Keyboard size={16} />
                      <span>
                        드래그로 섹션 순서를 변경하세요.
                        <br />
                        방향 버튼으로도 이동할 수 있어요.
                      </span>
                    </div>
                  </>
                ) : panel === 'components' ? (
                  <>
                    <div className="library-search">
                      <Search size={14} />
                      <input
                        aria-label="컴포넌트 검색"
                        placeholder="컴포넌트 검색…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <div className="library-filter">
                      <select
                        aria-label="컴포넌트 카테고리"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {[
                          'All',
                          'Layout',
                          'Navigation & UI',
                          'Data & Storytelling',
                          'Media & Simulation',
                          'Assessment & Conversion',
                        ].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div className="component-library">
                      {(
                        Object.entries(registry) as [
                          ComponentType,
                          (typeof registry)[ComponentType],
                        ][]
                      )
                        .filter(
                          ([, v]) =>
                            (v.name + v.description).toLowerCase().includes(query.toLowerCase()) &&
                            (category === 'All' || category === v.category),
                        )
                        .map(([type, meta]) => (
                          <button
                            className="component-library-card"
                            key={type}
                            onClick={() => add(type)}
                          >
                            <div className="component-thumb">
                              <span>
                                {type === 'hero'
                                  ? 'Aa'
                                  : type.includes('simulation') || type === 'scene'
                                    ? '⌘'
                                    : type.includes('cta')
                                      ? '↗'
                                      : type === 'tabs'
                                        ? '▣ ▣ ▣'
                                        : '▰ ▱'}
                              </span>
                              <Plus size={14} />
                            </div>
                            <strong>{meta.name}</strong>
                            <small>{meta.description}</small>
                          </button>
                        ))}
                    </div>
                  </>
                ) : panel === 'colors' ? (
                  <div className="scrolling-panel">
                    <ColorStudio project={p} onChange={change} />
                  </div>
                ) : panel === 'styles' ? (
                  <div className="scrolling-panel">
                    <p className="library-description">
                      콘텐츠를 유지하고 스타일을 바꿉니다.
                      <br />
                      팔레트는 별도로 선택하세요.
                    </p>
                    {styles
                      .filter((s) => s.ready)
                      .map((s) => (
                        <div className="library-style-card" key={s.id}>
                          <button aria-label={s.name + ' 적용'} onClick={() => applyStyle(s)}>
                            <StylePreview
                              style={s}
                              mode={s.id === 'linear-dark' ? 'dark' : 'light'}
                            />
                          </button>
                          <div>
                            <strong>{s.name}</strong>
                            <button className="small-button" onClick={() => applyStyle(s)}>
                              {p.theme.styleId === s.id ? <Check size={13} /> : '적용'}
                            </button>
                          </div>
                        </div>
                      ))}
                    <button className="button button-outline full" onClick={() => setGallery(true)}>
                      전체 30종 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="scrolling-panel">
                    <p className="library-description">
                      템플릿을 적용하면 현재 페이지의
                      <br />
                      섹션 구성이 교체됩니다.
                    </p>
                    {templates.map((t) => (
                      <div className="library-style-card" key={t.id}>
                        <button
                          aria-label={t.name + ' 템플릿 미리보기'}
                          onClick={() => setTemplateConfirm(t.id)}
                        >
                          <StylePreview
                            style={styles.find((s) => s.id === t.style)!}
                            mode={t.id === 'physical' ? 'dark' : 'light'}
                          />
                        </button>
                        <div>
                          <strong>{t.name}</strong>
                          <button className="small-button" onClick={() => setTemplateConfirm(t.id)}>
                            적용
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </>
          )}
          <main className="canvas-area">
            <div className="canvas-topline">
              <span>
                <span className={preview ? 'preview-dot' : 'edit-dot'} />
                {preview ? 'LIVE PREVIEW' : 'EDITING CANVAS'}
              </span>
              <span>
                {viewport === 'desktop' ? 'Responsive' : viewport === 'tablet' ? '768px' : '390px'}
                <span className="topline-divider">/</span>
                {p.page.title}
              </span>
              {preview && (
                <button onClick={() => setPreview(false)}>
                  편집기로 돌아가기 <X size={13} />
                </button>
              )}
            </div>
            <div className="canvas-scroll" ref={canvasScroll}>
              <div className={'canvas-device device-' + viewport}>
                <PreviewScrollContext.Provider value={canvasScroll}>
                  <PageRenderer
                    project={p}
                    editing={!preview}
                    selected={selected}
                    onSelect={setSelected}
                    viewport={viewport}
                  />
                </PreviewScrollContext.Provider>
              </div>
              {!preview && (
                <button className="canvas-add" onClick={() => setPanel('components')}>
                  <Plus size={17} />
                  새로운 섹션 추가
                </button>
              )}
            </div>
            {!preview && section && (
              <div className="selection-toolbar">
                <span>
                  <Layers size={14} />
                  {registry[section.type].name}
                </span>
                <button
                  title="선택 섹션 복제"
                  aria-label="선택 섹션 복제"
                  onClick={() => duplicate(section.id)}
                >
                  <Copy size={15} />
                </button>
                <button
                  title="선택 섹션 삭제"
                  aria-label="선택 섹션 삭제"
                  onClick={() => setDeleting(section.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
            <div className="canvas-statusbar">
              <span>
                {preview
                  ? '직접 조작하며 경험을 확인하세요.'
                  : '선택하고, 편집하고, 당신만의 경험을 만드세요.'}
              </span>
              <span>
                100%<span className="topline-divider">/</span>
                {p.page.sections.length} sections
              </span>
            </div>
          </main>
          {!preview && (
            <Inspector
              section={section}
              onChange={update}
              defaultRadius={styles.find((s) => s.id === p.theme.styleId)?.shapePreset ?? 16}
            />
          )}
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={16} />
            {toast}
          </div>
        )}
        <Modal
          open={gallery}
          onOpenChange={setGallery}
          title="Design gallery"
          description="디자인은 바뀌어도, 당신의 이야기는 그대로."
          wide
        >
          <StyleGallery current={p.theme.styleId} onApply={applyStyle} />
        </Modal>
        <Modal
          open={settings}
          onOpenChange={setSettings}
          title="프로젝트 설정"
          description="페이지의 기본 정보와 글로벌 디자인을 설정합니다."
        >
          <Field label="브랜드 이름">
            <DraftInput
              label="브랜드 이름"
              value={p.page.title}
              onCommit={(v) => change({ ...p, page: { ...p.page, title: v } })}
            />
          </Field>
          <Field label="페이지 설명">
            <DraftInput
              multiline
              label="페이지 설명"
              value={p.page.description}
              onCommit={(v) => change({ ...p, page: { ...p.page, description: v } })}
            />
          </Field>
          {(['headingFont', 'bodyFont'] as const).map((key, i) => (
            <Field key={key} label={i === 0 ? '제목 폰트' : '본문 폰트'}>
              <select
                value={p.theme[key] ?? 'style'}
                onChange={(e) =>
                  change({
                    ...p,
                    theme: {
                      ...p.theme,
                      [key]: e.target.value === 'style' ? null : e.target.value,
                    },
                  })
                }
              >
                {key === 'headingFont' && <option value="style">스타일 기본값</option>}
                <option value="sans">Sans serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </Field>
          ))}
          <Range
            label="최대 콘텐츠 너비"
            value={p.theme.maxWidth}
            min={480}
            max={1600}
            step={20}
            unit="px"
            onChange={(v) => change({ ...p, theme: { ...p.theme, maxWidth: v } })}
          />
          <div className="dialog-actions">
            <button className="button button-primary" onClick={() => setSettings(false)}>
              완료
            </button>
          </div>
        </Modal>
        <Modal
          open={exportOpen}
          onOpenChange={setExportOpen}
          title="작업을 안전하게 보관하세요"
          description="JSON 백업에는 페이지, 디자인, 인터랙션 설정이 포함됩니다."
        >
          <button
            className="export-option"
            onClick={() => {
              try {
                downloadProject(p);
                setToast('JSON 백업 다운로드를 시작했습니다.');
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <span>
              <Download size={22} />
            </span>
            <div>
              <strong>프로젝트 JSON</strong>
              <small>이 스튜디오에서 다시 열 수 있는 전체 프로젝트</small>
            </div>
            <span className="small-pill">AVAILABLE</span>
          </button>
          <div className="info-box roomy">
            ZIP 에셋 백업·정적 웹사이트·Next.js 출력은 후속 단계입니다. 현재는 JSON 백업·복원만
            지원합니다. 외부 미디어 파일은 JSON에 URL로 저장됩니다.
          </div>
          <button
            className="button button-outline full"
            onClick={() =>
              void persist(p)
                .then(() => setToast('브라우저에 저장했습니다.'))
                .catch(() => {})
            }
          >
            <Save size={15} />
            브라우저에도 지금 저장
          </button>
        </Modal>
        <Modal
          open={!!deleting}
          onOpenChange={(v) => !v && setDeleting(null)}
          title="이 섹션을 삭제할까요?"
          description="삭제 후 Undo로 복원할 수 있습니다."
        >
          <div className="dialog-actions">
            <button className="button button-outline" onClick={() => setDeleting(null)}>
              취소
            </button>
            <button
              className="button button-danger"
              onClick={() => {
                change({
                  ...p,
                  page: { ...p.page, sections: p.page.sections.filter((s) => s.id !== deleting) },
                });
                if (selected === deleting) setSelected(null);
                setDeleting(null);
              }}
            >
              섹션 삭제
            </button>
          </div>
        </Modal>
        <Modal
          open={!!templateConfirm}
          onOpenChange={(v) => !v && setTemplateConfirm(null)}
          title="템플릿을 적용할까요?"
          description="현재 섹션과 테마가 교체됩니다. Undo로 되돌리거나 적용 전 JSON 백업을 내려받을 수 있습니다."
        >
          <div className="dialog-actions">
            <button className="button button-outline" onClick={() => downloadProject(p)}>
              백업
            </button>
            <button className="button button-outline" onClick={() => setTemplateConfirm(null)}>
              취소
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                const fresh = newProject(templateConfirm!);
                change({ ...p, page: fresh.page, theme: fresh.theme });
                setSelected(fresh.page.sections[0]?.id || null);
                setTemplateConfirm(null);
              }}
            >
              적용
            </button>
          </div>
        </Modal>
        <Modal
          open={exitError}
          onOpenChange={setExitError}
          title="작업을 저장하지 못했습니다"
          description="JSON 백업으로 작업을 보관하거나 저장을 다시 시도하세요."
        >
          <div className="dialog-actions">
            <button className="button button-outline" onClick={() => downloadProject(p)}>
              JSON 백업
            </button>
            <button className="button button-primary" onClick={() => void exit()}>
              저장 재시도
            </button>
          </div>
        </Modal>
      </div>
    </DraftContext.Provider>
  );
}
