'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Search,
  Plus,
  Minus,
  CheckCheck,
  Command,
  Sparkles,
  Layers,
  MousePointer2,
  TrendingUp,
  Grip,
  Mail,
} from 'lucide-react';
import { Project, Section } from '@/lib/schema';
import { fonts, resolveColors, styles } from '@/lib/catalog';
import { MotionSection } from './motion-section';
import { sectionAnchor } from '@/lib/navigation';
const Simulation = dynamic(() => import('./simulation'), {
  ssr: false,
  loading: () => <div className="sim-loading">시뮬레이션 로딩 중…</div>,
});
export function HeroArt() {
  return (
    <div className="hero-art" aria-label="프로젝트 워크스페이스 UI 예제" role="img">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-star">✳</div>
      <div className="art-card art-main">
        <div className="art-card-head">
          <span className="art-icon">
            <Layers size={15} />
          </span>
          <span>Your workspace, reimagined.</span>
          <span>•••</span>
        </div>
        <div className="art-chart">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="art-caption">
          <span>PROJECT MOMENTUM</span>
          <strong>In your element.</strong>
        </div>
        <div className="art-tags">
          <span>Strategy</span>
          <span>Design</span>
          <span>Launch</span>
        </div>
      </div>
      <div className="art-card art-small">
        <span className="art-check">
          <Check size={16} />
        </span>
        <div>
          <strong>A little more progress.</strong>
          <small>One good idea at a time.</small>
        </div>
      </div>
      <div className="art-card art-float">
        <TrendingUp size={19} />
        <div>
          <strong>32%</strong>
          <small>more room to create</small>
        </div>
      </div>
      <div className="art-cursor">
        <MousePointer2 size={21} />
        <span>You, in flow</span>
      </div>
    </div>
  );
}
export function PageRenderer({
  project,
  editing = false,
  selected,
  onSelect,
  viewport = 'desktop',
}: {
  project: Project;
  editing?: boolean;
  selected?: string | null;
  onSelect?: (id: string) => void;
  viewport?: 'desktop' | 'tablet' | 'mobile';
}) {
  const c = resolveColors(project.theme);
  const style = styles.find((s) => s.id === project.theme.styleId) ?? styles[0];
  const visibleSections = project.page.sections.filter((s) =>
    viewport === 'mobile' ? !s.design.hiddenMobile : !s.design.hiddenDesktop,
  );
  const featureSection = visibleSections.find((s) =>
    ['tabs', 'simulation-switch', 'scene'].includes(s.type),
  );
  const storySection = visibleSections.find(
    (s) => s.type === 'gallery' || s.type === 'story-player',
  );
  const contactSection = visibleSections.find((s) => s.type === 'cta' || s.type === 'contact');
  const variables = Object.fromEntries(
    Object.entries(c).map(([k, v]) => ['--lp-' + k, v]),
  ) as CSSProperties;
  return (
    <div
      id="top"
      className={`landing style-${project.theme.styleId} viewport-${viewport}`}
      style={
        {
          ...variables,
          '--lp-heading': fonts[project.theme.headingFont ?? style.typographyPreset],
          '--lp-body': fonts[project.theme.bodyFont],
          '--lp-max': project.theme.maxWidth + 'px',
          background: project.theme.gradient
            ? `linear-gradient(${project.theme.gradientAngle}deg,${c.background},${c.secondary})`
            : c.background,
        } as CSSProperties
      }
    >
      <nav className="landing-nav">
        <a href="#top" onClick={(e) => editing && e.preventDefault()} className="landing-brand">
          <span className="brand-mark">✳</span>
          {project.page.title}
        </a>
        <div>
          {featureSection && (
            <a
              href={'#' + sectionAnchor(featureSection, visibleSections)}
              onClick={(e) => editing && e.preventDefault()}
            >
              Explore
            </a>
          )}
          {storySection && (
            <a
              href={'#' + sectionAnchor(storySection, visibleSections)}
              onClick={(e) => editing && e.preventDefault()}
            >
              Stories
            </a>
          )}
          {contactSection && (
            <a
              href={'#' + sectionAnchor(contactSection, visibleSections)}
              className="landing-nav-cta"
              onClick={(e) => editing && e.preventDefault()}
            >
              Let’s begin <Plus size={14} />
            </a>
          )}
        </div>
      </nav>
      {project.page.sections.length === 0 && (
        <div className="canvas-empty">왼쪽 라이브러리에서 첫 섹션을 추가하세요.</div>
      )}
      {visibleSections.map((s) => {
        return (
          <div
            key={s.id}
            className={`render-section ${!editing && s.type === 'sticky-header' ? 'runtime-sticky' : ''} ${editing ? 'selectable' : ''} ${selected === s.id && editing ? 'is-selected' : ''}`}
            onClick={editing ? () => onSelect?.(s.id) : undefined}
            role={editing ? 'button' : undefined}
            tabIndex={editing ? 0 : undefined}
            aria-label={editing ? s.label + ' 선택' : undefined}
            onKeyDown={
              editing
                ? (e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelect?.(s.id);
                    }
                  }
                : undefined
            }
          >
            {editing && selected === s.id && <span className="selection-label">{s.label}</span>}
            <MotionSection
              config={
                s.motion.preset === 'none'
                  ? { ...s.motion, preset: project.theme.motionPreset }
                  : s.motion
              }
              disabled={editing}
            >
              <section
                id={sectionAnchor(s, visibleSections)}
                aria-label={s.accessibility.label || s.content.title}
                className="landing-section"
                style={
                  {
                    padding: `${viewport === 'mobile' ? Math.min(s.design.padding, 32) : s.design.padding}px ${viewport === 'mobile' ? 24 : 40}px`,
                    textAlign: s.design.align,
                    ...(s.design.background ? { background: s.design.background } : {}),
                    ...(s.design.foreground ? { color: s.design.foreground } : {}),
                    '--section-radius': (s.design.radius ?? style.shapePreset) + 'px',
                    '--section-gap': s.design.gap + 'px',
                    '--section-columns': viewport === 'mobile' ? 1 : s.design.columns,
                    '--section-shadow': s.design.shadow ? '0 12px 35px #00000018' : 'none',
                    '--section-border': s.design.border ? '1px solid var(--lp-border)' : 'none',
                  } as CSSProperties
                }
              >
                <div className="section-inner">
                  {s.type === 'hero' ? (
                    <div className="hero-layout">
                      <div>
                        <p className="lp-eyebrow">
                          <span /> {s.content.eyebrow}
                        </p>
                        <h1 style={headingStyle(s, viewport)}>{s.content.title}</h1>
                        <p className="hero-body">{s.content.body}</p>
                        <a
                          className="lp-button"
                          href={s.content.url || '#contact'}
                          onClick={(e) => editing && e.preventDefault()}
                        >
                          {s.content.button} <Plus size={16} />
                        </a>
                        <div className="hero-proof">
                          <div className="mini-avatars">
                            <span>J</span>
                            <span>S</span>
                            <span>M</span>
                            <span>+</span>
                          </div>
                          <span>A little space for your next big thing.</span>
                        </div>
                      </div>
                      <HeroArt />
                    </div>
                  ) : (
                    <>
                      <p className="lp-eyebrow">{s.content.eyebrow}</p>
                      <h2 style={headingStyle(s, viewport)}>{s.content.title}</h2>
                      <p className="section-body">{s.content.body}</p>
                      <div
                        className={editing ? 'edit-content' : ''}
                        inert={editing ? true : undefined}
                      >
                        <InteractiveContent
                          key={s.id + '-' + s.type}
                          section={s}
                          editing={editing}
                          sections={visibleSections}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>
            </MotionSection>
          </div>
        );
      })}
      <footer className="landing-footer">
        <span>✳ {project.page.title}</span>
        <span>Made with intention. Built with ILS.</span>
        <a href="#top" onClick={(e) => editing && e.preventDefault()}>
          Back to top
        </a>
      </footer>
    </div>
  );
}
function headingStyle(s: Section, viewport: string): CSSProperties {
  return {
    fontSize:
      viewport === 'mobile'
        ? Math.min(s.design.fontSize, 38)
        : `clamp(${Math.min(28, s.design.fontSize)}px, 4.5cqw, ${s.design.fontSize}px)`,
    fontWeight: s.design.weight,
    lineHeight: s.design.lineHeight,
    letterSpacing: s.design.letterSpacing + 'px',
    textTransform: s.design.uppercase ? 'uppercase' : 'none',
  };
}
function InteractiveContent({
  section: s,
  editing,
  sections,
}: {
  section: Section;
  editing: boolean;
  sections: Section[];
}) {
  const [index, setIndex] = useState(0),
    [query, setQuery] = useState(''),
    [checked, setChecked] = useState<string[]>([]),
    [count, setCount] = useState(0),
    [running, setRunning] = useState(false),
    [sim, setSim] = useState(s.interaction.simulation),
    [form, setForm] = useState(''),
    [result, setResult] = useState(''),
    [now, setNow] = useState<number | null>(null);
  const items = s.content.items;
  useEffect(() => {
    setSim(s.interaction.simulation);
  }, [s.interaction.simulation]);
  useEffect(() => {
    setIndex((n) => n % Math.max(1, items.length));
    setChecked((ids) => ids.filter((id) => items.some((item) => item.id === id)));
  }, [items]);
  const current = items[index % Math.max(1, items.length)];
  useEffect(() => {
    if (editing) return;
    if (s.type === 'countdown') {
      setNow(Date.now());
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }
    if (s.type === 'count-up') {
      const start = performance.now();
      let id = 0;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        setCount(s.interaction.target);
        return;
      }
      const tick = () => {
        const p = Math.min(1, (performance.now() - start) / 1200);
        setCount(Math.round(p * s.interaction.target));
        if (p < 1) id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    }
  }, [editing, s.type, s.interaction.target]);
  useEffect(() => {
    if (
      !editing &&
      s.interaction.autoplay &&
      ['carousel', 'video-carousel', 'story-player'].includes(s.type) &&
      items.length > 1 &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setRunning(true);
    } else setRunning(false);
  }, [s.interaction.autoplay, s.type, editing, items.length]);
  useEffect(() => {
    if (!running || editing) return;
    const t = setInterval(() => setIndex((n) => (n + 1) % Math.max(1, items.length)), 3500);
    return () => clearInterval(t);
  }, [running, editing, items.length]);
  const toggle = (id: string) =>
    setChecked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  const cards = (list = items) => (
    <div className="lp-grid">
      {list.map((item, i) => (
        <article className="lp-card" key={item.id}>
          <span className="feature-symbol">
            {[<Command key="a" />, <Layers key="b" />, <Sparkles key="c" />][i % 3]}
          </span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          {item.url && <a href={item.url}>자세히 보기</a>}
        </article>
      ))}
    </div>
  );
  if (['scene', 'drag', 'leader-follower', 'simulation-switch'].includes(s.type))
    return (
      <>
        {s.type === 'simulation-switch' && (
          <div className="lp-tabs" role="tablist" aria-label="시뮬레이션 선택">
            {(['drag', 'robot', 'string'] as const).map((k) => (
              <button key={k} role="tab" aria-selected={sim === k} onClick={() => setSim(k)}>
                {k === 'drag' ? '2D Drag' : k === 'robot' ? 'Robot Arm' : 'Music String'}
              </button>
            ))}
          </div>
        )}
        <Simulation
          key={sim}
          kind={s.type === 'drag' || s.type === 'leader-follower' ? 'drag' : sim}
          disabled={editing}
        />
      </>
    );
  if (s.type === 'tabs')
    return items.length ? (
      <>
        <div className="lp-tabs" role="tablist" aria-label="콘텐츠 탭">
          {items.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              id={'tab-' + item.id}
              aria-controls={'panel-' + s.id}
              aria-selected={index === i}
              tabIndex={index === i ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const next =
                    (index + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
                  setIndex(next);
                  document.getElementById('tab-' + items[next].id)?.focus();
                }
              }}
              onClick={() => setIndex(i)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div
          className="tab-panel"
          role="tabpanel"
          id={'panel-' + s.id}
          aria-labelledby={'tab-' + current?.id}
        >
          <div>
            <span className="feature-symbol">
              <Layers />
            </span>
            <h3>{current?.title}</h3>
            <p>{current?.body}</p>
          </div>
          <div className="mini-workspace">
            <div className="workspace-line" />
            <div className="workspace-row">
              <CheckCheck /> A clearer picture.
            </div>
            <div className="workspace-row">
              <Grip /> Space to make it yours.
            </div>
            <div className="workspace-row">
              <Check /> Everything, in its place.
            </div>
          </div>
        </div>
      </>
    ) : (
      <Empty />
    );
  if (s.type === 'accordion' || s.type === 'expandable-card')
    return items.length ? (
      <div className="lp-accordion">
        {items.map((item) => (
          <details key={item.id}>
            <summary>
              {item.title}
              <ChevronDown size={17} />
            </summary>
            <p>{item.body}</p>
          </details>
        ))}
      </div>
    ) : (
      <Empty />
    );
  if (s.type === 'search-filter')
    return (
      <>
        <label className="lp-search">
          <Search size={16} />
          <input
            placeholder="항목 검색"
            aria-label="항목 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {items.filter((i) => (i.title + i.body).toLowerCase().includes(query.toLowerCase()))
          .length ? (
          cards(items.filter((i) => (i.title + i.body).toLowerCase().includes(query.toLowerCase())))
        ) : (
          <Empty text="검색 결과가 없습니다." />
        )}
      </>
    );
  if (['carousel', 'story-player', 'step-viewer', 'video-carousel'].includes(s.type))
    return items.length ? (
      <div className="lp-player">
        {s.type === 'video-carousel' ? (
          <Video url={current?.url || ''} />
        ) : (
          <div className="story-slide">
            <span className="story-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{current?.title}</h3>
            <p>{current?.body}</p>
          </div>
        )}
        <div className="player-controls">
          <button
            aria-label="이전 항목"
            onClick={() => setIndex((index - 1 + items.length) % items.length)}
          >
            <ChevronLeft size={18} />
          </button>
          <span aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <button aria-label="다음 항목" onClick={() => setIndex((index + 1) % items.length)}>
            <ChevronRight size={18} />
          </button>
          {['carousel', 'story-player', 'video-carousel'].includes(s.type) && (
            <button onClick={() => setRunning(!running)}>
              {running ? '자동재생 중지' : '자동재생'}
            </button>
          )}
        </div>
      </div>
    ) : (
      <Empty />
    );
  if (s.type === 'comparison')
    return items.length ? (
      <>
        <div className="lp-tabs" role="tablist" aria-label="비교 보기">
          {items.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={index === i}
              onClick={() => setIndex(i)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="comparison-panel">
          <span className="feature-symbol">
            <CheckCheck />
          </span>
          <h3>{current?.title}</h3>
          <p>{current?.body}</p>
          <div className="lp-meter">
            <span style={{ width: Math.min(100, current?.value || 0) + '%' }} />
          </div>
          <strong>{current?.value}%</strong>
        </div>
      </>
    ) : (
      <Empty />
    );
  if (['progress', 'telemetry'].includes(s.type))
    return (
      <div className="lp-grid">
        {items.map((item) => (
          <div className="lp-card" key={item.id}>
            <small>{item.title}</small>
            <strong className="metric">
              {item.value}
              {s.type === 'progress' ? '%' : ''}
            </strong>
            <div className="lp-meter">
              <span style={{ width: Math.min(item.value, 100) + '%' }} />
            </div>
            <p>{item.body}</p>
          </div>
        ))}
        {s.type === 'telemetry' && (
          <small className="data-note">설정된 예제 데이터 · 외부 실시간 데이터 미연결</small>
        )}
      </div>
    );
  if (s.type === 'count-up')
    return (
      <div className="count-number" aria-live="off">
        {editing ? s.interaction.target : count}
        <span>+</span>
      </div>
    );
  if (s.type === 'countdown') {
    const deadline = Date.parse(s.content.deadline);
    if (!Number.isFinite(deadline)) return <Empty text="올바른 마감 날짜를 설정하세요." />;
    const secs = Math.max(0, Math.floor((deadline - (now || deadline)) / 1000));
    return (
      <div className="countdown">
        {[
          Math.floor(secs / 86400),
          Math.floor(secs / 3600) % 24,
          Math.floor(secs / 60) % 60,
          secs % 60,
        ].map((v, i) => (
          <div key={i}>
            <strong>{String(v).padStart(2, '0')}</strong>
            <span>{['DAYS', 'HOURS', 'MINUTES', 'SECONDS'][i]}</span>
          </div>
        ))}
      </div>
    );
  }
  if (s.type === 'timeline')
    return (
      <div className="lp-timeline">
        {items.map((item, i) => (
          <article key={item.id}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    );
  if (s.type === 'hotspot-map' || s.type === 'relationship-graph')
    return items.length ? (
      <>
        <div className="hotspot-map">
          {s.type === 'relationship-graph' && (
            <svg viewBox="0 0 500 220" preserveAspectRatio="none">
              {items.map((_, i) => (
                <line
                  key={i}
                  x1="250"
                  y1="110"
                  x2={70 + (i % 5) * 90}
                  y2={i % 2 ? 160 : 60}
                  stroke="var(--lp-primary)"
                  strokeWidth="2"
                />
              ))}
            </svg>
          )}
          {items.map((item, i) => (
            <button
              key={item.id}
              className={index === i ? 'active' : ''}
              style={{ left: 10 + (i % 5) * 18 + '%', top: (i % 2 ? 65 : 25) + '%' }}
              onClick={() => setIndex(i)}
              aria-label={item.title}
            >
              <span>{i + 1}</span>
              {item.title}
            </button>
          ))}
        </div>
        <div className="hotspot-detail" aria-live="polite">
          <h3>{current?.title}</h3>
          <p>{current?.body}</p>
        </div>
      </>
    ) : (
      <Empty />
    );
  if (s.type === 'video') return <Video url={s.content.mediaUrl} />;
  if (s.type === 'state-machine')
    return (
      <div className="state-machine">
        <span className={'machine-state state-' + index}>
          {['준비', '실행 중', '완료'][index % 3]}
        </span>
        <p>액션을 실행하면 다음 상태로 전환합니다.</p>
        <button className="lp-button" onClick={() => setIndex((index + 1) % 3)}>
          {['시작', '완료하기', '다시 시작'][index % 3]} <Play size={14} />
        </button>
      </div>
    );
  if (['checklist', 'eligibility', 'conditional-cta'].includes(s.type))
    return items.length ? (
      <div className="assessment">
        {items.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={checked.includes(item.id)}
              onChange={() => toggle(item.id)}
            />
            <span>
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </span>
          </label>
        ))}
        <div className="assessment-result">
          <strong>
            {checked.length} / {items.length} {s.type === 'eligibility' ? '조건 충족' : '선택 완료'}
          </strong>
          <div className="lp-meter">
            <span style={{ width: (checked.length / items.length) * 100 + '%' }} />
          </div>
          {s.type === 'conditional-cta' &&
            (checked.length === items.length ? (
              <a className="lp-button" href={s.content.url || '#contact'}>
                {s.content.button}
              </a>
            ) : (
              <p>모든 항목을 선택하면 다음 단계로 이동할 수 있습니다.</p>
            ))}
        </div>
      </div>
    ) : (
      <Empty />
    );
  if (s.type === 'form-result')
    return (
      <form
        className="result-form"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(
            form.trim() +
              ' 님, 입력하신 내용이 확인되었습니다. 이 양식은 외부로 전송되지 않습니다.',
          );
        }}
      >
        <label>
          이름
          <input
            required
            maxLength={100}
            value={form}
            onChange={(e) => setForm(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </label>
        <button className="lp-button" type="submit">
          결과 확인
        </button>
        <p role="status">{result}</p>
      </form>
    );
  if (s.type === 'anchor-navigation' || s.type === 'sticky-header')
    return (
      <nav
        className={s.type === 'sticky-header' ? 'lp-anchor sticky' : 'lp-anchor'}
        aria-label="섹션 탐색"
      >
        {sections
          .filter((x) => x.id !== s.id)
          .map((x) => (
            <a key={x.id} href={'#' + sectionAnchor(x, sections)}>
              {x.label}
            </a>
          ))}
      </nav>
    );
  if (s.type === 'cta' || s.type === 'contact')
    return (
      <a className="lp-button" href={s.content.url || '#top'}>
        {s.type === 'contact' ? <Mail size={16} /> : <Plus size={16} />} {s.content.button}
      </a>
    );
  if (s.type === 'gallery')
    return (
      <div className="lp-grid">
        {items.map((item, i) => (
          <article key={item.id} className="gallery-card">
            <div className={'gallery-art gallery-art-' + (i % 3)}>
              <span>{['✳', '◒', '⌘'][i % 3]}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.url && <a href={item.url}>프로젝트 보기</a>}
          </article>
        ))}
      </div>
    );
  return cards();
}
function Empty({ text = '콘텐츠 항목을 추가하세요.' }: { text?: string }) {
  return <div className="lp-empty">{text}</div>;
}
function Video({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!/^https?:\/\//i.test(url))
    return (
      <Empty text="Inspector에 HTTP(S) 영상 파일 URL을 입력하세요. 외부 영상은 사용자가 재생할 때 연결됩니다." />
    );
  return (
    <>
      <video className="lp-video" src={url} controls preload="none" onError={() => setFailed(true)}>
        브라우저에서 영상을 지원하지 않습니다.
      </video>
      {failed && (
        <p className="error-text" role="alert">
          영상을 불러올 수 없습니다. 미디어 URL을 확인하세요.
        </p>
      )}
    </>
  );
}
