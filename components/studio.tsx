'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  PanelsTopLeft,
  Palette,
  BookOpen,
  ArrowUpRight,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  Upload,
  FolderOpen,
  Clock,
  Layers,
  Sparkles,
  Command,
  Check,
  AlertCircle,
  Download,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { Project, uid, importProject } from '@/lib/schema';
import { listProjects, saveProject, deleteProject, downloadProject } from '@/lib/storage';
import { templates, newProject } from '@/lib/templates';
import { styles, Style } from '@/lib/catalog';
import { StyleGallery, StylePreview } from './style-gallery';
import { Modal, Field, DraftInput } from './ui';
import Editor from './editor';
type View = 'projects' | 'templates' | 'styles' | 'guide';
export default function Studio() {
  const [projects, setProjects] = useState<Project[]>([]),
    [active, setActive] = useState<Project | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [view, setView] = useState<View>('projects'),
    [query, setQuery] = useState(''),
    [create, setCreate] = useState(false),
    [template, setTemplate] = useState('saas'),
    [name, setName] = useState(''),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState<Project | null>(null),
    [renaming, setRenaming] = useState<Project | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [dark, setDark] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    listProjects()
      .then((r) => {
        setProjects(r.projects);
        if (r.invalid)
          setError(`${r.invalid}개의 손상된 프로젝트를 건너뛰었습니다. 원본 데이터는 유지됩니다.`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  async function persist(p: Project) {
    await saveProject(p);
    setProjects((all) =>
      [p, ...all.filter((x) => x.id !== p.id)].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    );
  }
  async function createProject(style?: Style) {
    if (busy) return;
    setBusy(true);
    try {
      const p = newProject(template, name);
      if (style)
        p.theme = {
          ...p.theme,
          styleId: style.id,
          paletteId: style.defaultPaletteId,
          headingFont: null,
          mode: style.id === 'linear-dark' ? 'dark' : 'light',
        };
      await persist(p);
      setActive(p);
      setCreate(false);
      setName('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function duplicate(p: Project) {
    try {
      const clone = structuredClone(p);
      clone.id = uid();
      clone.name = p.name + ' (복사)';
      clone.createdAt = clone.updatedAt = new Date().toISOString();
      await persist(clone);
      setNotice('프로젝트를 복제했습니다.');
      setMenu(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function importFile(file: File) {
    try {
      if (file.size > 5_000_000) throw new Error('파일 크기는 5MB 이하여야 합니다.');
      const p = importProject(await file.text());
      p.id = uid();
      p.name = p.name + ' (가져옴)';
      p.createdAt = p.updatedAt = new Date().toISOString();
      await persist(p);
      setActive(p);
      setNotice('기존 프로젝트를 덮어쓰지 않고 복원했습니다.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  if (active)
    return (
      <Editor
        key={active.id}
        initial={active}
        onSave={persist}
        onExit={() => setActive(null)}
        notify={setNotice}
      />
    );
  const filtered = projects.filter((p) =>
    (p.name + p.page.title).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={'studio-shell ' + (dark ? 'studio-dark' : '')}>
      <aside className="app-sidebar">
        <a
          className="app-logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('projects');
          }}
        >
          <span className="logo-symbol">✳</span>
          <span>
            ils<span className="logo-period">.</span>
          </span>
          <small>STUDIO</small>
        </a>
        <button className="workspace-switch" onClick={() => setView('projects')}>
          <span className="workspace-avatar">K</span>
          <span>
            My workspace<small>Local workspace</small>
          </span>
          <span className="workspace-shortcut">⌘ K</span>
        </button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav>
          {(
            [
              { id: 'projects', label: '프로젝트', en: 'Projects', icon: LayoutGrid },
              { id: 'templates', label: '템플릿', en: 'Templates', icon: PanelsTopLeft },
              { id: 'styles', label: '디자인 갤러리', en: 'Design gallery', icon: Palette },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setMenu(null);
              }}
              className={view === item.id ? 'active' : ''}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === 'projects' && <small>{projects.length}</small>}
              {item.id === 'styles' && <span className="new-label">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-library">
          <span>YOUR CREATIVE TOOLKIT</span>
          <div>
            <Layers size={17} />
            <p>32 reusable blocks</p>
          </div>
          <div>
            <Palette size={17} />
            <p>30 design directions</p>
          </div>
          <div>
            <Sparkles size={17} />
            <p>Endless possibilities</p>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="local-note">
            <span className="local-note-icon">
              <FolderOpen size={18} />
            </span>
            <strong>Your ideas, your space.</strong>
            <p>
              모든 프로젝트는 이 브라우저에
              <br />
              안전하게 저장됩니다.
            </p>
            <button onClick={() => fileRef.current?.click()}>
              백업 가져오기 <Upload size={13} />
            </button>
          </div>
          <button
            className={view === 'guide' ? 'sidebar-help active' : 'sidebar-help'}
            onClick={() => setView('guide')}
          >
            <BookOpen size={17} />
            시작 가이드
            <ArrowUpRight size={15} />
          </button>
          <div className="sidebar-profile">
            <span className="profile-avatar">K</span>
            <div>
              <strong>Creator workspace</strong>
              <small>Local edition · v1.1</small>
            </div>
            <button
              className="icon-button"
              aria-label="스튜디오 테마 전환"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </aside>
      <main className="dashboard">
        <header className="dashboard-topbar">
          <span>
            Workspace <span>/</span>{' '}
            {view === 'projects'
              ? 'Projects'
              : view === 'templates'
                ? 'Templates'
                : view === 'styles'
                  ? 'Design gallery'
                  : 'Getting started'}
          </span>
          <div>
            <span className="local-badge">
              <span />
              Local-first workspace
            </span>
            <button className="icon-button" aria-label="도움말" onClick={() => setView('guide')}>
              <BookOpen size={17} />
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button onClick={() => setError('')}>닫기</button>
            </div>
          )}
          {view === 'projects' ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">A SPACE FOR WHAT’S NEXT</p>
                  <h1>
                    아이디어가 경험이 되는 곳<span>.</span>
                  </h1>
                  <p>새로운 가능성을 만들고, 당신만의 방식으로 전해보세요.</p>
                </div>
                <button className="button button-primary" onClick={() => setCreate(true)}>
                  <Plus size={17} />새 프로젝트
                </button>
              </div>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <span className="pill">
                    <Sparkles size={13} />
                    FROM IDEA TO INTERACTION
                  </span>
                  <h2>
                    좋은 이야기에,
                    <br />
                    움직임을 더하세요.
                  </h2>
                  <p>
                    디자인을 고르고, 콘텐츠를 채우고, 경험을 만드세요.
                    <br />
                    코드 없이도 당신의 아이디어는 충분히 특별하니까요.
                  </p>
                  <button className="button button-dark" onClick={() => setView('templates')}>
                    템플릿 둘러보기 <PanelsTopLeft size={15} />
                  </button>
                  <span className="welcome-caption">DESIGN. INTERACT. MAKE IT YOURS.</span>
                </div>
                <div className="welcome-art">
                  <div className="welcome-art-grid" />
                  <div className="floating-label">
                    <span /> Ready when you are.
                  </div>
                  <div className="banner-window">
                    <div className="banner-window-top">
                      <i />
                      <i />
                      <i />
                      <span>your-next-big-idea.ils</span>
                    </div>
                    <StylePreview style={styles[4]} />
                  </div>
                  <span className="banner-flower">✳</span>
                  <div className="little-card">
                    <span>
                      <Check size={15} />
                    </span>
                    <div>
                      Made by you.<small>Built for possibility.</small>
                    </div>
                  </div>
                </div>
              </section>
              <div className="section-heading">
                <div>
                  <h2>
                    내 프로젝트 <span>{projects.length}</span>
                  </h2>
                  <p>어제의 아이디어를, 오늘의 경험으로 이어가세요.</p>
                </div>
                <div className="project-controls">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      aria-label="프로젝트 검색"
                      placeholder="프로젝트 검색…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className="button button-outline"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={15} />
                    가져오기
                  </button>
                </div>
              </div>
              {!loaded ? (
                <div className="empty-projects">프로젝트를 불러오는 중…</div>
              ) : filtered.length ? (
                <div className="project-grid">
                  {filtered.map((p) => (
                    <article className="project-card" key={p.id}>
                      <button
                        className="project-preview"
                        aria-label={p.name + ' 열기'}
                        onClick={() => setActive(p)}
                      >
                        <StylePreview
                          style={styles.find((s) => s.id === p.theme.styleId) || styles[0]}
                          mode={p.theme.mode}
                        />
                        <span className="open-project-label">
                          <FolderOpen size={16} />
                          프로젝트 열기
                        </span>
                      </button>
                      <div className="project-card-info">
                        <div>
                          <button className="project-title" onClick={() => setActive(p)}>
                            {p.name}
                          </button>
                          <span>
                            <Clock size={12} />
                            {new Date(p.updatedAt).toLocaleDateString('ko-KR')} ·{' '}
                            {p.page.sections.length} sections
                          </span>
                        </div>
                        <div className="project-menu-wrap">
                          <button
                            className="icon-button"
                            aria-label={p.name + ' 메뉴'}
                            aria-expanded={menu === p.id}
                            onClick={() => setMenu(menu === p.id ? null : p.id)}
                          >
                            <MoreHorizontal size={19} />
                          </button>
                          {menu === p.id && (
                            <div className="project-menu">
                              <button
                                onClick={() => {
                                  setRenaming(p);
                                  setMenu(null);
                                }}
                              >
                                <Pencil size={14} />
                                이름 변경
                              </button>
                              <button onClick={() => duplicate(p)}>
                                <Copy size={14} />
                                복제
                              </button>
                              <button
                                onClick={() => {
                                  downloadProject(p);
                                  setMenu(null);
                                }}
                              >
                                <Download size={14} />
                                JSON 백업
                              </button>
                              <button
                                className="text-danger"
                                onClick={() => {
                                  setDeleting(p);
                                  setMenu(null);
                                }}
                              >
                                <Trash2 size={14} />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                  <button className="new-project-card" onClick={() => setCreate(true)}>
                    <span>
                      <Plus size={24} />
                    </span>
                    <strong>새로운 가능성 만들기</strong>
                    <small>빈 캔버스보다 좋은 시작</small>
                  </button>
                </div>
              ) : (
                <div className="empty-projects">
                  <span>
                    <Layers size={24} />
                  </span>
                  <div>
                    <h3>{query ? '검색 결과가 없습니다.' : '첫 번째 프로젝트를 만들어 보세요.'}</h3>
                    <p>
                      {query
                        ? '다른 이름으로 검색해 보세요.'
                        : '아래 템플릿으로 시작하거나, 저장해 둔 JSON 백업을 가져오세요.'}
                    </p>
                  </div>
                  {!query && (
                    <button className="button button-outline" onClick={() => setCreate(true)}>
                      <Plus size={15} />
                      프로젝트 만들기
                    </button>
                  )}
                </div>
              )}
              <div className="section-heading template-heading">
                <div>
                  <h2>
                    A good place to start<span className="small-pill">CURATED TEMPLATES</span>
                  </h2>
                  <p>서로 다른 이야기, 하나의 유연한 스튜디오.</p>
                </div>
                <button className="text-button" onClick={() => setView('templates')}>
                  모든 템플릿 보기 <Plus size={14} />
                </button>
              </div>
              <TemplateCards
                onChoose={(id) => {
                  setTemplate(id);
                  setCreate(true);
                }}
              />
              <footer className="dashboard-footer">
                <span>✳ Made for ideas worth sharing.</span>
                <span>Interactive Landing Studio · Local edition</span>
              </footer>
            </>
          ) : view === 'templates' ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">START WITH A LITTLE INSPIRATION</p>
                  <h1>
                    당신의 이야기로 채우세요<span>.</span>
                  </h1>
                  <p>공통 컴포넌트로 만든 세 가지 시작점. 콘텐츠는 모두 편집할 수 있습니다.</p>
                </div>
              </div>
              <TemplateCards
                onChoose={(id) => {
                  setTemplate(id);
                  setCreate(true);
                }}
              />
              <div className="info-box roomy">
                템플릿을 선택하면 독립적인 새 프로젝트를 만듭니다. 기존 프로젝트는 그대로
                유지됩니다.
              </div>
            </>
          ) : view === 'styles' ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">FIND YOUR VISUAL VOICE</p>
                  <h1>
                    좋은 디자인의 시작<span>.</span>
                  </h1>
                  <p>콘텐츠와 분리된 디자인 시스템. 스타일과 팔레트를 자유롭게 조합하세요.</p>
                </div>
              </div>
              <StyleGallery onApply={(style) => void createProject(style)} />
            </>
          ) : (
            <Guide onStart={() => setCreate(true)} />
          )}
        </div>
      </main>
      <input
        ref={fileRef}
        className="sr-only"
        type="file"
        accept=".json,application/json"
        aria-label="프로젝트 JSON 가져오기"
        onChange={(e) => e.target.files?.[0] && void importFile(e.target.files[0])}
      />
      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      <Modal
        open={create}
        onOpenChange={setCreate}
        title="새로운 가능성의 시작"
        description="템플릿을 고르고 프로젝트에 이름을 붙여주세요."
        wide
      >
        <div className="create-options">
          {templates.map((t) => (
            <button
              className={template === t.id ? 'active' : ''}
              key={t.id}
              onClick={() => setTemplate(t.id)}
            >
              <StylePreview
                style={styles.find((s) => s.id === t.style)!}
                mode={t.id === 'physical' ? 'dark' : 'light'}
              />
              <strong>{t.name}</strong>
              <small>{t.category}</small>
              {template === t.id && (
                <span className="create-check">
                  <Check size={13} />
                </span>
              )}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void createProject();
          }}
        >
          <Field label="프로젝트 이름">
            <input
              aria-label="새 프로젝트 이름"
              autoFocus
              maxLength={100}
              placeholder={templates.find((t) => t.id === template)?.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setCreate(false)}
            >
              취소
            </button>
            <button className="button button-primary" disabled={busy}>
              {busy ? '저장소 준비 중…' : '프로젝트 만들기'}
              <Plus size={15} />
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="프로젝트를 삭제할까요?"
        description={
          '“' +
          deleting?.name +
          '”의 브라우저 저장본이 삭제됩니다. 필요하면 먼저 JSON 백업을 내려받으세요.'
        }
      >
        <div className="dialog-actions">
          <button
            className="button button-outline"
            onClick={() => deleting && downloadProject(deleting)}
          >
            <Download size={15} />
            백업
          </button>
          <button className="button button-outline" onClick={() => setDeleting(null)}>
            취소
          </button>
          <button
            className="button button-danger"
            onClick={async () => {
              if (!deleting) return;
              try {
                await deleteProject(deleting.id);
                setProjects((all) => all.filter((p) => p.id !== deleting.id));
                setDeleting(null);
                setNotice('프로젝트를 삭제했습니다.');
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            삭제
          </button>
        </div>
      </Modal>
      <Modal
        open={!!renaming}
        onOpenChange={(v) => !v && setRenaming(null)}
        title="프로젝트 이름 변경"
      >
        {renaming && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (!renaming.name.trim()) return;
                await persist({ ...renaming, updatedAt: new Date().toISOString() });
                setRenaming(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <Field label="이름">
              <input
                aria-label="프로젝트 새 이름"
                value={renaming.name}
                maxLength={100}
                required
                onChange={(e) => setRenaming({ ...renaming, name: e.target.value })}
              />
            </Field>
            <div className="dialog-actions">
              <button className="button button-primary">이름 저장</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
function TemplateCards({ onChoose }: { onChoose: (id: string) => void }) {
  return (
    <div className="template-grid">
      {templates.map((t) => (
        <button key={t.id} className="template-card" onClick={() => onChoose(t.id)}>
          <div className="template-preview">
            <StylePreview
              style={styles.find((s) => s.id === t.style)!}
              mode={t.id === 'physical' ? 'dark' : 'light'}
            />
            <span className="template-use">
              이 템플릿으로 시작 <Plus size={14} />
            </span>
          </div>
          <div>
            <span className="template-category">{t.category}</span>
            <h3>
              {t.name}
              <ArrowUpRight size={16} />
            </h3>
            <p>{t.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
function Guide({ onStart }: { onStart: () => void }) {
  return (
    <div className="guide">
      <p className="eyebrow">A SMALL GUIDE TO BIG POSSIBILITIES</p>
      <h1>
        몇 번의 선택으로,
        <br />
        나만의 인터랙티브 페이지.
      </h1>
      {[
        [
          '템플릿에서 시작하세요',
          '프로젝트를 만들고 세 가지 주제 중 하나를 선택하세요. 모든 프로젝트는 같은 렌더러와 컴포넌트를 사용합니다.',
        ],
        [
          '당신의 이야기를 채우세요',
          '왼쪽에서 컴포넌트를 추가하고, 캔버스에서 선택한 뒤 오른쪽 Inspector에서 콘텐츠와 디자인을 편집하세요. 입력을 마치고 포커스를 이동하면 편집 명령으로 기록됩니다.',
        ],
        [
          '스타일과 컬러를 입히세요',
          'Raw Grid, Linear Dark, Earthy Calm 중 하나를 고르세요. 콘텐츠를 유지하며 팔레트와 디자인을 독립적으로 변경할 수 있습니다.',
        ],
        [
          '미리보기로 직접 경험하세요',
          '모바일·태블릿·데스크톱에서 확인하세요. Preview 모드에서는 탭, 체크리스트, 시뮬레이터가 실제로 작동합니다.',
        ],
        [
          '작업을 안전하게 보관하세요',
          '브라우저 IndexedDB에 자동 저장됩니다. 저장 완료를 확인하고 JSON 백업을 정기적으로 내려받으세요. 브라우저 데이터 삭제 시 로컬 프로젝트도 삭제됩니다.',
        ],
      ].map(([title, body], i) => (
        <article key={title}>
          <span>{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
        </article>
      ))}
      <button className="button button-primary" onClick={onStart}>
        <Plus size={16} />첫 프로젝트 시작하기
      </button>
      <div className="info-box roomy">
        <strong>현재 구현 범위</strong>
        <p>
          프로젝트 JSON 백업·복원과 로컬 편집을 지원합니다. ZIP·정적 사이트·Next.js 프로젝트 출력,
          3D, AI 생성, 외부 데이터 연결은 후속 단계입니다. 컴포넌트는 2D 기반 초기 버전입니다.
        </p>
      </div>
    </div>
  );
}
