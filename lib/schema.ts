import { z } from 'zod';
export const componentTypes = [
  'hero',
  'anchor-navigation',
  'sticky-header',
  'tabs',
  'expandable-card',
  'accordion',
  'search-filter',
  'carousel',
  'hotspot-map',
  'comparison',
  'step-viewer',
  'progress',
  'count-up',
  'telemetry',
  'timeline',
  'story-player',
  'gallery',
  'relationship-graph',
  'countdown',
  'video',
  'video-carousel',
  'drag',
  'leader-follower',
  'simulation-switch',
  'scene',
  'state-machine',
  'checklist',
  'conditional-cta',
  'cta',
  'contact',
  'form-result',
  'eligibility',
] as const;
export const motionPresets = [
  'none',
  'fade-in',
  'fade-up',
  'slide-left',
  'slide-right',
  'scale-in',
  'stagger',
  'parallax',
  'scroll-progress',
  'hover-lift',
  'flip',
  'marquee',
  'text-reveal',
] as const;
export const colorRoles = [
  'background',
  'surface',
  'foreground',
  'muted',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
  'border',
  'focus',
  'success',
  'warning',
  'error',
] as const;
export const colorSchema = z
  .string()
  .regex(/^#[\da-fA-F]{6}([\da-fA-F]{2})?$/, 'HEX 6자리 또는 8자리를 입력하세요.');
export const safeUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    if (/^#[\w-]+$/.test(v)) return true;
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v)) return true;
    if (/^tel:\+?[\d(). -]+$/i.test(v)) return true;
    try {
      const parsed = new URL(v);
      return ['https:', 'http:'].includes(parsed.protocol) && !!parsed.hostname;
    } catch {
      return false;
    }
  }, 'https, mailto, tel 또는 페이지 앵커만 허용됩니다.');
const itemSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: z.string().max(300),
    body: z.string().max(5000),
    value: z.number().finite().min(0).max(1000000).default(75),
    url: safeUrl.default(''),
  })
  .strict();
export const sectionSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum(componentTypes),
    label: z.string().min(1).max(100),
    content: z
      .object({
        eyebrow: z.string().max(200),
        title: z.string().max(500),
        body: z.string().max(10000),
        button: z.string().max(100),
        url: safeUrl,
        items: z.array(itemSchema).max(100),
        mediaUrl: safeUrl,
        deadline: z.string().max(50),
      })
      .strict(),
    design: z
      .object({
        align: z.enum(['left', 'center']),
        padding: z.number().min(16).max(160),
        columns: z.number().int().min(1).max(4),
        gap: z.number().min(0).max(80),
        radius: z.number().min(0).max(64).nullable(),
        fontSize: z.number().min(16).max(100),
        weight: z.number().min(300).max(900),
        lineHeight: z.number().min(1).max(2.5),
        letterSpacing: z.number().min(-5).max(12),
        uppercase: z.boolean(),
        shadow: z.boolean(),
        border: z.boolean(),
        hiddenMobile: z.boolean(),
        hiddenDesktop: z.boolean(),
        background: z.union([z.literal(''), colorSchema]),
        foreground: z.union([z.literal(''), colorSchema]),
      })
      .strict(),
    motion: z
      .object({
        preset: z.enum(motionPresets),
        duration: z.number().min(0.1).max(5),
        delay: z.number().min(0).max(5),
        intensity: z.number().min(0).max(100),
        easing: z.enum(['easeOut', 'easeInOut', 'linear']),
        trigger: z.enum(['load', 'scroll', 'hover']),
        repeat: z.boolean(),
      })
      .strict(),
    interaction: z
      .object({
        autoplay: z.boolean(),
        simulation: z.enum(['drag', 'robot', 'string']),
        target: z.number().min(1).max(1000000),
      })
      .strict(),
    accessibility: z.object({ label: z.string().max(300) }).strict(),
  })
  .strict();
export const projectSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(100),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    page: z
      .object({
        title: z.string().max(300),
        description: z.string().max(1000),
        sections: z.array(sectionSchema).max(100),
      })
      .strict(),
    theme: z
      .object({
        styleId: z.string().max(100),
        paletteId: z.string().max(100),
        mode: z.enum(['light', 'dark']),
        overrides: z.partialRecord(z.enum(colorRoles), colorSchema),
        headingFont: z.enum(['sans', 'serif', 'mono']).nullable(),
        bodyFont: z.enum(['sans', 'serif', 'mono']),
        maxWidth: z.number().min(480).max(1600),
        motionPreset: z.enum(motionPresets),
        gradient: z.boolean(),
        gradientAngle: z.number().min(0).max(360),
      })
      .strict(),
    assets: z.array(z.object({ id: z.string(), name: z.string().max(200), url: safeUrl })).max(100),
    dataBindings: z
      .array(
        z.object({
          id: z.string(),
          sectionId: z.string(),
          source: z.literal('inline'),
          values: z.array(z.number().finite()).max(1000),
        }),
      )
      .max(100),
  })
  .strict()
  .superRefine((p, ctx) => {
    const ids = p.page.sections.map((s) => s.id);
    p.page.sections.forEach((section, index) => {
      const itemIds = section.content.items.map((item) => item.id);
      if (new Set(itemIds).size !== itemIds.length)
        ctx.addIssue({
          code: 'custom',
          message: '중복된 항목 ID입니다.',
          path: ['page', 'sections', index, 'content', 'items'],
        });
    });
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: 'custom',
        message: '중복된 섹션 ID입니다.',
        path: ['page', 'sections'],
      });
  });
export type Project = z.infer<typeof projectSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type ComponentType = (typeof componentTypes)[number];
export type ColorRole = (typeof colorRoles)[number];
export type Colors = Record<ColorRole, string>;
export function parseProject(input: unknown): Project {
  const result = projectSchema.safeParse(input);
  if (!result.success)
    throw new Error('지원하지 않거나 손상된 프로젝트입니다. ' + result.error.issues[0]?.message);
  return result.data;
}
export function importProject(text: string): Project {
  if (text.length > 5_000_000) throw new Error('파일 크기는 5MB 이하여야 합니다.');
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('올바른 JSON 파일이 아닙니다.');
  }
  return parseProject(value);
}
export const uid = () => crypto.randomUUID();
export function createSection(type: ComponentType): Section {
  return {
    id: uid(),
    type,
    label: type,
    content: {
      eyebrow: 'BUILD SOMETHING MEANINGFUL',
      title: '새로운 경험을 만들어 보세요',
      body: '좋은 이야기에 직접 참여하는 즐거움을 더하세요. 모든 콘텐츠와 디자인을 자유롭게 편집할 수 있습니다.',
      button: '자세히 알아보기',
      url: '#contact',
      items: [
        {
          id: uid(),
          title: 'Discover',
          body: '가능성을 발견하는 첫 번째 단계입니다.',
          value: 72,
          url: '',
        },
        {
          id: uid(),
          title: 'Create',
          body: '아이디어를 직접 만들고 실험해 보세요.',
          value: 86,
          url: '',
        },
        { id: uid(), title: 'Connect', body: '새로운 경험을 함께 나눕니다.', value: 94, url: '' },
      ],
      mediaUrl: '',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    design: {
      align: 'left',
      padding: 56,
      columns: 3,
      gap: 20,
      radius: null,
      fontSize: 40,
      weight: 700,
      lineHeight: 1.15,
      letterSpacing: -1,
      uppercase: false,
      shadow: false,
      border: true,
      hiddenMobile: false,
      hiddenDesktop: false,
      background: '',
      foreground: '',
    },
    motion: {
      preset: 'none',
      duration: 0.6,
      delay: 0,
      intensity: 30,
      easing: 'easeOut',
      trigger: 'scroll',
      repeat: false,
    },
    interaction: { autoplay: false, simulation: 'drag', target: 100 },
    accessibility: { label: '' },
  };
}
