'use client';
import { useEffect, useState } from 'react';
import { Heart, Search, Check, Monitor, Smartphone, Sun, Moon, Plus } from 'lucide-react';
import { Style, styles, palettes } from '@/lib/catalog';
import { Modal } from './ui';
export function StylePreview({
  style,
  mode = 'light',
  mobile = false,
}: {
  style: Style;
  mode?: 'light' | 'dark';
  mobile?: boolean;
}) {
  const p = palettes.find((p) => p.id === style.defaultPaletteId)![mode];
  return (
    <div
      className={'style-preview ' + (mobile ? 'mobile-sample' : '')}
      style={{
        background: p.background,
        color: p.foreground,
        fontFamily:
          style.typographyPreset === 'serif'
            ? 'Georgia, serif'
            : style.typographyPreset === 'mono'
              ? 'monospace'
              : 'Arial',
        borderRadius: style.shapePreset / 2,
      }}
    >
      <div className="preview-mini-nav">
        <b>✳ studio</b>
        <span>About &nbsp; Works &nbsp; +</span>
      </div>
      <div className="preview-mini-body">
        <div>
          <small style={{ color: p.muted }}>A NEW PERSPECTIVE</small>
          <h3>
            {style.id === 'earthy-calm'
              ? 'Made of\nlittle moments.'
              : style.id === 'linear-dark'
                ? 'Beyond\nthe ordinary.'
                : 'Ideas into\npossibility.'}
          </h3>
          <span
            className="preview-mini-button"
            style={{
              background: p.primary,
              color: p.primaryForeground,
              borderRadius: style.shapePreset,
            }}
          >
            Explore <Plus size={10} />
          </span>
        </div>
        <div
          className="preview-mini-art"
          style={{ background: p.secondary, borderRadius: style.shapePreset }}
        >
          <span style={{ color: p.primary }}>✳</span>
          <div
            style={{
              background: p.surface,
              border: `1px solid ${p.border}`,
              borderRadius: style.shapePreset / 2,
            }}
          />
        </div>
      </div>
      <div className="preview-mini-grid">
        {['Discover', 'Make', 'Connect'].map((v) => (
          <div
            key={v}
            style={{
              background: p.surface,
              border: `1px solid ${p.border}`,
              borderRadius: style.shapePreset / 2,
            }}
          >
            <span style={{ color: p.primary }}>✧</span>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}
export function StyleGallery({
  onApply,
  current,
}: {
  onApply: (s: Style) => void;
  current?: string;
}) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All styles'),
    [favorites, setFavorites] = useState<string[]>([]),
    [onlyFav, setOnlyFav] = useState(false),
    [mode, setMode] = useState<'light' | 'dark'>('light'),
    [mobile, setMobile] = useState(false),
    [detail, setDetail] = useState<Style | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ils-favorites') || '[]');
      if (Array.isArray(saved) && saved.every((x) => typeof x === 'string')) setFavorites(saved);
    } catch {}
  }, []);
  const list = styles.filter(
    (s) =>
      (s.name + s.description).toLowerCase().includes(query.toLowerCase()) &&
      (category === 'All styles' || s.category === category) &&
      (!onlyFav || favorites.includes(s.id)),
  );
  function favorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((v) => v !== id) : [...favorites, id];
    setFavorites(next);
    try {
      localStorage.setItem('ils-favorites', JSON.stringify(next));
    } catch {}
  }
  return (
    <>
      <div className="gallery-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="스타일 검색…"
            aria-label="스타일 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="스타일 카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {['All styles', 'Graphic', 'Technology', 'Editorial', 'Expressive'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button
          className={'icon-button ' + (onlyFav ? 'active' : '')}
          aria-label="즐겨찾기만 보기"
          aria-pressed={onlyFav}
          onClick={() => setOnlyFav(!onlyFav)}
        >
          <Heart size={17} fill={onlyFav ? 'currentColor' : 'none'} />
        </button>
        <button
          className="icon-button"
          aria-label="스타일 명암 전환"
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
        >
          {mode === 'light' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="icon-button"
          aria-label="스타일 화면 크기 전환"
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? <Smartphone size={17} /> : <Monitor size={17} />}
        </button>
      </div>
      <div className="gallery-note">
        30 styles to explore. <strong>3 styles ready to create.</strong> 나머지 카탈로그의
        미리보기는 탐색용이며 적용은 준비 중입니다.
      </div>
      <div className="style-gallery-grid">
        {list.map((s) => (
          <article
            key={s.id}
            className={'style-gallery-card ' + (current === s.id ? 'chosen' : '')}
          >
            <button
              className="style-preview-button"
              aria-label={s.name + ' 상세 미리보기'}
              onClick={() => setDetail(s)}
            >
              <StylePreview style={s} mode={mode} mobile={mobile} />
            </button>
            <button
              className={'favorite-button ' + (favorites.includes(s.id) ? 'active' : '')}
              aria-label={s.name + ' 즐겨찾기'}
              onClick={() => favorite(s.id)}
            >
              <Heart size={16} fill={favorites.includes(s.id) ? 'currentColor' : 'none'} />
            </button>
            <div className="style-card-info">
              <div>
                <strong>{s.name}</strong>
                <small>{s.category}</small>
              </div>
              <button
                className={'small-button ' + (current === s.id ? 'selected' : '')}
                disabled={!s.ready}
                onClick={() => onApply(s)}
              >
                {current === s.id ? (
                  <>
                    <Check size={13} />
                    적용됨
                  </>
                ) : s.ready ? (
                  '적용하기'
                ) : (
                  '준비 중'
                )}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!list.length && <div className="empty-search">해당하는 스타일이 없습니다.</div>}
      <Modal
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title={detail?.name || 'Style'}
        description={detail?.description}
        wide
      >
        {detail && (
          <>
            <StylePreview style={detail} mode={mode} mobile={mobile} />
            <div className="detail-style-meta">
              <span>
                {detail.category} · {detail.typographyPreset} ·{' '}
                {detail.recommendedIndustries.join(', ')}
              </span>
              <button
                className="button button-primary"
                disabled={!detail.ready}
                onClick={() => {
                  onApply(detail);
                  setDetail(null);
                }}
              >
                {detail.ready ? '이 스타일 적용' : '준비 중'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
