'use client';
import { useState } from 'react';
import { AlignLeft, AlignCenter, ChevronDown, SlidersHorizontal, Trash2, Plus } from 'lucide-react';
import { Section, motionPresets, uid, safeUrl } from '@/lib/schema';
import { registry, contrast } from '@/lib/catalog';
import { DraftInput, Field, Range } from './ui';
export default function Inspector({
  section: s,
  onChange,
  defaultRadius = 16,
}: {
  section: Section | null;
  onChange: (s: Section) => void;
  defaultRadius?: number;
}) {
  const [tab, setTab] = useState('Content'),
    [error, setError] = useState('');
  if (!s)
    return (
      <aside className="inspector">
        <div className="inspector-heading">
          <SlidersHorizontal size={16} />
          Inspector
        </div>
        <div className="inspector-empty">
          <MouseIcon />
          <h3>Make it yours.</h3>
          <p>
            캔버스에서 섹션을 선택하면
            <br />
            세부 설정을 편집할 수 있습니다.
          </p>
        </div>
      </aside>
    );
  const content = (patch: Partial<Section['content']>) =>
      onChange({ ...s, content: { ...s.content, ...patch } }),
    design = (patch: Partial<Section['design']>) =>
      onChange({ ...s, design: { ...s.design, ...patch } }),
    motion = (patch: Partial<Section['motion']>) =>
      onChange({ ...s, motion: { ...s.motion, ...patch } });
  function url(value: string, field: 'url' | 'mediaUrl') {
    if (!safeUrl.safeParse(value).success) {
      setError('허용된 URL 형식이 아닙니다.');
      return;
    }
    setError('');
    content({ [field]: value });
  }
  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <SlidersHorizontal size={16} />
        Inspector <span>SECTION</span>
      </div>
      <div className="selected-component">
        <span className="component-icon">
          <SlidersHorizontal size={16} />
        </span>
        <div>
          <strong>{registry[s.type].name}</strong>
          <small>{s.label}</small>
        </div>
      </div>
      <div className="inspector-tabs">
        {['Content', 'Design', 'Motion', 'More'].map((v) => (
          <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>
            {v}
          </button>
        ))}
      </div>
      <div className="inspector-body">
        {tab === 'Content' ? (
          <>
            <div className="panel-section-title">CONTENT</div>
            <Field label="섹션 이름">
              <DraftInput
                label="섹션 이름"
                value={s.label}
                onCommit={(v) => v.trim() && onChange({ ...s, label: v })}
              />
            </Field>
            <Field label="Eyebrow">
              <DraftInput
                label="Eyebrow"
                value={s.content.eyebrow}
                onCommit={(v) => content({ eyebrow: v })}
              />
            </Field>
            <Field label="제목">
              <DraftInput
                multiline
                label="제목"
                value={s.content.title}
                onCommit={(v) => content({ title: v })}
              />
            </Field>
            <Field label="설명">
              <DraftInput
                multiline
                label="설명"
                value={s.content.body}
                onCommit={(v) => content({ body: v })}
              />
            </Field>
            <Field label="버튼 텍스트">
              <DraftInput
                label="버튼 텍스트"
                value={s.content.button}
                onCommit={(v) => content({ button: v })}
              />
            </Field>
            <Field label="링크" hint="https:// · mailto: · tel: · #anchor">
              <DraftInput label="링크" value={s.content.url} onCommit={(v) => url(v, 'url')} />
            </Field>
            {['video', 'video-carousel'].includes(s.type) && (
              <Field label="영상 파일 URL">
                <DraftInput
                  label="영상 파일 URL"
                  value={s.content.mediaUrl}
                  onCommit={(v) => url(v, 'mediaUrl')}
                />
              </Field>
            )}
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            {s.type !== 'hero' && s.type !== 'cta' && (
              <>
                <div className="panel-divider" />
                <div className="panel-section-title">
                  DATA ITEMS <span>{s.content.items.length}</span>
                </div>
                {s.content.items.map((item, i) => (
                  <details className="item-editor" key={item.id}>
                    <summary>
                      {item.title || '항목 ' + (i + 1)}
                      <ChevronDown size={14} />
                    </summary>
                    <Field label="항목 제목">
                      <DraftInput
                        value={item.title}
                        label={'항목 ' + (i + 1) + ' 제목'}
                        onCommit={(v) =>
                          content({
                            items: s.content.items.map((x) =>
                              x.id === item.id ? { ...x, title: v } : x,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label="항목 설명">
                      <DraftInput
                        value={item.body}
                        multiline
                        label={'항목 ' + (i + 1) + ' 설명'}
                        onCommit={(v) =>
                          content({
                            items: s.content.items.map((x) =>
                              x.id === item.id ? { ...x, body: v } : x,
                            ),
                          })
                        }
                      />
                    </Field>
                    <Field label="데이터 값">
                      <DraftInput
                        value={String(item.value)}
                        type="number"
                        label={'항목 ' + (i + 1) + ' 값'}
                        onCommit={(v) => {
                          const n = Number(v);
                          if (Number.isFinite(n) && n >= 0 && n <= 1000000)
                            content({
                              items: s.content.items.map((x) =>
                                x.id === item.id ? { ...x, value: n } : x,
                              ),
                            });
                        }}
                      />
                    </Field>
                    <Field label="항목 URL">
                      <DraftInput
                        value={item.url}
                        label={'항목 ' + (i + 1) + ' URL'}
                        onCommit={(v) => {
                          if (safeUrl.safeParse(v).success)
                            content({
                              items: s.content.items.map((x) =>
                                x.id === item.id ? { ...x, url: v } : x,
                              ),
                            });
                          else setError('허용된 URL 형식이 아닙니다.');
                        }}
                      />
                    </Field>
                    <button
                      className="text-danger"
                      onClick={() =>
                        content({ items: s.content.items.filter((x) => x.id !== item.id) })
                      }
                    >
                      <Trash2 size={13} /> 항목 삭제
                    </button>
                  </details>
                ))}
                <button
                  className="button button-outline full"
                  disabled={s.content.items.length >= 100}
                  onClick={() =>
                    content({
                      items: [
                        ...s.content.items,
                        {
                          id: uid(),
                          title: '새 항목',
                          body: '설명을 입력하세요.',
                          value: 75,
                          url: '',
                        },
                      ],
                    })
                  }
                >
                  <Plus size={14} />
                  항목 추가
                </button>
              </>
            )}
          </>
        ) : tab === 'Design' ? (
          <>
            <div className="panel-section-title">LAYOUT</div>
            <Field label="정렬">
              <div className="segmented">
                {(['left', 'center'] as const).map((a) => (
                  <button
                    key={a}
                    className={s.design.align === a ? 'active' : ''}
                    aria-label={a === 'left' ? '왼쪽 정렬' : '가운데 정렬'}
                    onClick={() => design({ align: a })}
                  >
                    {a === 'left' ? <AlignLeft size={16} /> : <AlignCenter size={16} />}
                  </button>
                ))}
              </div>
            </Field>
            <Range
              label="섹션 여백"
              value={s.design.padding}
              min={16}
              max={160}
              unit="px"
              onChange={(v) => design({ padding: v })}
            />
            <Range
              label="컬럼 수"
              value={s.design.columns}
              min={1}
              max={4}
              onChange={(v) => design({ columns: v })}
            />
            <Range
              label="Grid gap"
              value={s.design.gap}
              min={0}
              max={80}
              unit="px"
              onChange={(v) => design({ gap: v })}
            />
            <div className="panel-divider" />
            <div className="panel-section-title">TYPOGRAPHY</div>
            <Range
              label="제목 크기"
              value={s.design.fontSize}
              min={16}
              max={100}
              unit="px"
              onChange={(v) => design({ fontSize: v })}
            />
            <Range
              label="글자 두께"
              value={s.design.weight}
              min={300}
              max={900}
              step={100}
              onChange={(v) => design({ weight: v })}
            />
            <Range
              label="행간"
              value={s.design.lineHeight}
              min={1}
              max={2.5}
              step={0.05}
              onChange={(v) => design({ lineHeight: v })}
            />
            <Range
              label="자간"
              value={s.design.letterSpacing}
              min={-5}
              max={12}
              step={0.5}
              unit="px"
              onChange={(v) => design({ letterSpacing: v })}
            />
            <label className="check-field">
              <input
                type="checkbox"
                checked={s.design.uppercase}
                onChange={(e) => design({ uppercase: e.target.checked })}
              />
              대문자 제목
            </label>
            <div className="panel-divider" />
            <div className="panel-section-title">SHAPE & EFFECTS</div>
            <Range
              label="카드 모서리"
              value={s.design.radius ?? defaultRadius}
              min={0}
              max={64}
              unit="px"
              onChange={(v) => design({ radius: v })}
            />
            {(['shadow', 'border'] as const).map((v, i) => (
              <label className="check-field" key={v}>
                <input
                  type="checkbox"
                  checked={s.design[v]}
                  onChange={(e) => design({ [v]: e.target.checked })}
                />
                {['카드 그림자', '카드 테두리'][i]}
              </label>
            ))}
            <div className="panel-divider" />
            <div className="panel-section-title">SECTION COLORS</div>
            {(['background', 'foreground'] as const).map((v) => (
              <Field key={v} label={v}>
                <div className="inline-field">
                  <input
                    type="color"
                    aria-label={'섹션 ' + v}
                    value={s.design[v] || '#FFFFFF'}
                    onChange={(e) => design({ [v]: e.target.value })}
                  />
                  <button className="small-button" onClick={() => design({ [v]: '' })}>
                    테마로 복원
                  </button>
                </div>
              </Field>
            ))}
            {s.design.background && s.design.foreground && (
              <small>
                대비 {contrast(s.design.background, s.design.foreground).toFixed(2)}:1{' '}
                {contrast(s.design.background, s.design.foreground) < 4.5
                  ? '· AA 기준 미달'
                  : '· AA 통과'}
              </small>
            )}
          </>
        ) : tab === 'Motion' ? (
          <>
            <div className="panel-section-title">ANIMATION</div>
            <Field label="Preset">
              <select
                value={s.motion.preset}
                onChange={(e) => motion({ preset: e.target.value as Section['motion']['preset'] })}
              >
                {motionPresets.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Range
              label="Duration"
              value={s.motion.duration}
              min={0.1}
              max={5}
              step={0.1}
              unit="s"
              onChange={(v) => motion({ duration: v })}
            />
            <Range
              label="Delay"
              value={s.motion.delay}
              min={0}
              max={5}
              step={0.1}
              unit="s"
              onChange={(v) => motion({ delay: v })}
            />
            <Range
              label="Intensity"
              value={s.motion.intensity}
              min={0}
              max={100}
              onChange={(v) => motion({ intensity: v })}
            />
            <Field label="Easing">
              <select
                value={s.motion.easing}
                onChange={(e) => motion({ easing: e.target.value as Section['motion']['easing'] })}
              >
                {['easeOut', 'easeInOut', 'linear'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Trigger">
              <select
                value={s.motion.trigger}
                onChange={(e) =>
                  motion({ trigger: e.target.value as Section['motion']['trigger'] })
                }
              >
                {['load', 'scroll', 'hover'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <label className="check-field">
              <input
                type="checkbox"
                checked={s.motion.repeat}
                onChange={(e) => motion({ repeat: e.target.checked })}
              />
              반복 재생
            </label>
            <div className="info-box">
              미리보기에서 모션을 확인하세요. 시스템의 모션 줄이기 설정을 따릅니다.
            </div>
          </>
        ) : (
          <>
            <div className="panel-section-title">INTERACTION & DATA</div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={s.interaction.autoplay}
                onChange={(e) =>
                  onChange({ ...s, interaction: { ...s.interaction, autoplay: e.target.checked } })
                }
              />
              캐러셀 / 스토리 자동재생
            </label>
            <Field label="시뮬레이션 어댑터">
              <select
                value={s.interaction.simulation}
                onChange={(e) =>
                  onChange({
                    ...s,
                    interaction: {
                      ...s.interaction,
                      simulation: e.target.value as Section['interaction']['simulation'],
                    },
                  })
                }
              >
                <option value="drag">2D Drag</option>
                <option value="robot">Robot Arm</option>
                <option value="string">Music String</option>
              </select>
            </Field>
            <Field label="카운트 목표">
              <DraftInput
                type="number"
                label="카운트 목표"
                value={String(s.interaction.target)}
                onCommit={(v) => {
                  const n = Number(v);
                  if (n >= 1 && n <= 1000000)
                    onChange({ ...s, interaction: { ...s.interaction, target: n } });
                }}
              />
            </Field>
            <Field label="카운트다운 종료일">
              <input
                type="datetime-local"
                value={s.content.deadline.slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value)
                    content({ deadline: new Date(e.target.value + 'Z').toISOString() });
                }}
              />
              <small>UTC 기준</small>
            </Field>
            <div className="panel-divider" />
            <div className="panel-section-title">RESPONSIVE</div>
            {(['hiddenMobile', 'hiddenDesktop'] as const).map((v, i) => (
              <label key={v} className="check-field">
                <input
                  type="checkbox"
                  checked={s.design[v]}
                  onChange={(e) => design({ [v]: e.target.checked })}
                />
                {['모바일에서 숨기기', '데스크톱 / 태블릿에서 숨기기'][i]}
              </label>
            ))}
            <div className="panel-divider" />
            <div className="panel-section-title">ACCESSIBILITY</div>
            <Field label="섹션 접근성 이름">
              <DraftInput
                label="섹션 접근성 이름"
                value={s.accessibility.label}
                onCommit={(v) => onChange({ ...s, accessibility: { label: v } })}
              />
            </Field>
            <p className="info-box">
              키보드 포커스·의미 있는 레이블·모션 줄이기는 공통 렌더러가 처리합니다.
            </p>
          </>
        )}
      </div>
      <div className="inspector-footer">
        <span className="save-dot" /> Changes are saved automatically
      </div>
    </aside>
  );
}
function MouseIcon() {
  return <SlidersHorizontal size={24} />;
}
