'use client';
import { useEffect, useState } from 'react';
import { Check, RotateCcw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Project, ColorRole, colorRoles, colorSchema } from '@/lib/schema';
import { palettes, resolveColors, contrast } from '@/lib/catalog';
import { Field, Range } from './ui';
export function ColorStudio({
  project,
  onChange,
}: {
  project: Project;
  onChange: (p: Project) => void;
}) {
  const colors = resolveColors(project.theme),
    [role, setRole] = useState<ColorRole>('primary'),
    [format, setFormat] = useState('HEX'),
    [draft, setDraft] = useState(colors.primary),
    [error, setError] = useState('');
  useEffect(() => {
    setDraft(formatColor(colors[role], format));
    setError('');
  }, [colors[role], role, format]);
  const patch = (theme: Partial<Project['theme']>) =>
    onChange({ ...project, theme: { ...project.theme, ...theme } });
  function commit() {
    const color = parseColor(draft, format);
    if (!color) {
      setError('유효한 ' + format + ' 값을 입력하세요. 이전 색상을 유지합니다.');
      return;
    }
    setError('');
    patch({ overrides: { ...project.theme.overrides, [role]: color } });
  }
  const pairs = [
    ['본문', colors.foreground, colors.background, 4.5],
    ['버튼', colors.primaryForeground, colors.primary, 4.5],
    ['보조 텍스트', colors.muted, colors.background, 4.5],
    ['포커스', colors.focus, colors.background, 3],
  ] as const;
  return (
    <div className="color-studio">
      <div className="panel-section-title">
        CURATED PALETTES <span>6 collections</span>
      </div>
      <div className="palette-list">
        {palettes.map((p) => (
          <button
            key={p.id}
            className={'palette-option ' + (project.theme.paletteId === p.id ? 'active' : '')}
            onClick={() => patch({ paletteId: p.id, overrides: {} })}
          >
            <span className="palette-swatches">
              {['background', 'primary', 'secondary', 'accent', 'foreground'].map((k) => (
                <i key={k} style={{ background: p[project.theme.mode][k as ColorRole] }} />
              ))}
            </span>
            <span className="palette-name">
              {p.name}
              {project.theme.paletteId === p.id && <Check size={14} />}
            </span>
            <small>{p.description}</small>
          </button>
        ))}
      </div>
      <div className="segmented">
        <button
          className={project.theme.mode === 'light' ? 'active' : ''}
          onClick={() => patch({ mode: 'light' })}
        >
          Light
        </button>
        <button
          className={project.theme.mode === 'dark' ? 'active' : ''}
          onClick={() => patch({ mode: 'dark' })}
        >
          Dark
        </button>
      </div>
      <div className="panel-divider" />
      <div className="panel-section-title">
        SEMANTIC COLORS{' '}
        <button
          className="icon-button"
          title="오버라이드 초기화"
          onClick={() => patch({ overrides: {} })}
        >
          <RotateCcw size={13} />
        </button>
      </div>
      <Field label="컬러 역할">
        <select value={role} onChange={(e) => setRole(e.target.value as ColorRole)}>
          {colorRoles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>
      <div className="color-input-row">
        <input
          aria-label="시각적 컬러 피커"
          type="color"
          value={colors[role].slice(0, 7)}
          onChange={(e) => {
            setDraft(formatColor(e.target.value, format));
          }}
          onBlur={() => commit()}
        />
        <div className="color-text">
          <select
            aria-label="색상 입력 형식"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {['HEX', 'RGB', 'HSL'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            aria-label={format + ' 색상 값'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
          />
        </div>
      </div>
      {error && (
        <small className="error-text" role="alert">
          {error}
        </small>
      )}
      <Range
        label="불투명도"
        min={0}
        max={100}
        value={
          colors[role].length === 9
            ? Math.round((parseInt(colors[role].slice(7), 16) / 255) * 100)
            : 100
        }
        unit="%"
        onChange={(n) =>
          patch({
            overrides: {
              ...project.theme.overrides,
              [role]:
                colors[role].slice(0, 7) +
                Math.round((n / 100) * 255)
                  .toString(16)
                  .padStart(2, '0'),
            },
          })
        }
      />
      <label className="check-field">
        <input
          type="checkbox"
          checked={project.theme.gradient}
          onChange={(e) => patch({ gradient: e.target.checked })}
        />
        배경 그라디언트
      </label>
      {project.theme.gradient && (
        <Range
          label="그라디언트 각도"
          min={0}
          max={360}
          value={project.theme.gradientAngle}
          unit="°"
          onChange={(n) => patch({ gradientAngle: n })}
        />
      )}
      <div className="contrast-card">
        <div>
          <ShieldCheck size={16} />
          <strong>Contrast check</strong>
          <span>AA</span>
        </div>
        {pairs.map(([name, a, b, min]) => {
          const transparent =
            (a.length === 9 && a.slice(7) !== 'ff') || (b.length === 9 && b.slice(7) !== 'ff');
          const score = contrast(a, b);
          return (
            <p key={name}>
              <span>{name}</span>
              <b className={!transparent && score >= min ? 'pass' : 'warn'}>
                {transparent ? '투명도 수동 확인' : score.toFixed(2) + ':1'}{' '}
                {!transparent && score >= min ? <Check size={12} /> : <TriangleAlert size={12} />}
              </b>
            </p>
          );
        })}
        <small>
          본문 4.5:1 · 포커스 3:1 기준. 섹션 개별 색상과 투명도·그라디언트는 별도 확인이 필요합니다.
        </small>
      </div>
    </div>
  );
}
export function parseColor(text: string, format: string): string | null {
  if (format === 'HEX') {
    const v = text.startsWith('#') ? text : '#' + text;
    return colorSchema.safeParse(v).success ? v : null;
  }
  const values = text
    .replace(/rgba?|hsla?|[()%]/gi, '')
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (values.length !== 3 || values.some((v) => !Number.isFinite(v))) return null;
  let rgb = values;
  if (format === 'RGB') {
    if (values.some((v) => v < 0 || v > 255)) return null;
  } else {
    const [h, s, l] = values;
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    rgb = [f(0), f(8), f(4)].map((x) => x * 255);
  }
  return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function formatColor(hex: string, format: string) {
  if (format === 'HEX') return hex;
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  if (format === 'RGB') return rgb.join(', ');
  const [r, g, b] = rgb.map((v) => v / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2;
  let h = 0;
  if (d)
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return `${Math.round(h * 60)}, ${Math.round((d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100)}%, ${Math.round(l * 100)}%`;
}
