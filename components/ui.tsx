'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { createContext, useContext, useEffect, useId, useState } from 'react';
export const DraftContext = createContext<((id: string, dirty: boolean) => void) | null>(null);
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={'dialog ' + (wide ? 'dialog-wide' : '')}>
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                {description || '프로젝트에 적용할 옵션을 선택하세요.'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="닫기">
              <X size={19} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function DraftInput({
  value,
  onCommit,
  multiline = false,
  label,
  placeholder = '',
  type = 'text',
}: {
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  label?: string;
  placeholder?: string;
  type?: string;
}) {
  const [draft, setDraft] = useState(value);
  const report = useContext(DraftContext);
  const draftId = useId();
  useEffect(() => {
    setDraft(value);
    report?.(draftId, false);
  }, [value, report, draftId]);
  useEffect(() => () => report?.(draftId, false), [report, draftId]);
  const props = {
    value: draft,
    placeholder,
    'aria-label': label,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft(e.target.value);
      report?.(draftId, e.target.value !== value);
    },
    onBlur: () => {
      report?.(draftId, false);
      if (draft !== value) onCommit(draft);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline)
        e.currentTarget instanceof HTMLElement && e.currentTarget.blur();
      if (e.key === 'Escape') {
        setDraft(value);
        report?.(draftId, false);
      }
    },
  };
  return multiline ? <textarea {...props} rows={3} /> : <input {...props} type={type} />;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <Field label={label}>
      <div className="range-label">
        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => setV(+e.target.value)}
          onPointerUp={() => onChange(v)}
          onKeyUp={(e) => {
            if (e.key.startsWith('Arrow') || ['Home', 'End'].includes(e.key)) onChange(v);
          }}
        />
        <output>
          {v}
          {unit}
        </output>
      </div>
    </Field>
  );
}
