import { Colors, ComponentType, componentTypes } from './schema';
export type Style = {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  defaultPaletteId: string;
  paletteIds: string[];
  typographyPreset: 'sans' | 'serif' | 'mono';
  layoutPreset: string;
  shapePreset: number;
  effectsPreset: string;
  motionPreset: 'fade-up' | 'fade-in' | 'none';
  recommendedIndustries: string[];
  supportedComponents: ComponentType[];
  ready: boolean;
};
const names = [
  'Raw Grid',
  'Liquid Glass',
  'Linear Dark',
  'Neon Chrome',
  'Earthy Calm',
  'Bold n Fun',
  'Modular Blocks',
  'Motion Text',
  'Soft Tactile',
  'Magazine',
  'Soft Clay',
  'Mesh Glow',
  'Depth Layers',
  'Raw Chaos',
  'Swiss Grid',
  'Tech Console',
  'Soft Candy',
  'Risograph',
  'Metal Flow',
  'Fluid Shapes',
  'Mono Pop',
  'Color Wash',
  'Real Texture',
  'Night City',
  'Cozy Clean',
  'Soft 3D',
  'Blueprint',
  'Sticker Pop',
  'Light Glass',
  'Two-Tone',
];
export const styles: Style[] = names.map((name, i) => ({
  id: name.toLowerCase().replaceAll(' ', '-'),
  name,
  category: [0, 5, 6, 13, 14, 20, 27, 29].includes(i)
    ? 'Graphic'
    : [2, 3, 11, 15, 18, 23, 26].includes(i)
      ? 'Technology'
      : [4, 8, 9, 10, 17, 22, 24].includes(i)
        ? 'Editorial'
        : 'Expressive',
  description:
    i === 0
      ? '선명한 그리드와 대담한 타이포그래피. 본질에 집중하는 디자인.'
      : i === 2
        ? '정교한 라인과 깊은 어둠. 기술의 가능성을 표현하는 디자인.'
        : i === 4
          ? '자연의 색과 여유로운 호흡. 이야기가 머무는 따뜻한 디자인.'
          : '확장 예정인 디자인 카탈로그입니다. 대표 스타일을 먼저 사용해 보세요.',
  preview: name,
  defaultPaletteId: i === 2 ? 'neon' : i === 4 ? 'heritage' : 'monochrome',
  paletteIds: ['heritage', 'ocean', 'neon', 'forest', 'monochrome', 'sunset'],
  typographyPreset: i === 4 ? 'serif' : i === 2 ? 'mono' : 'sans',
  layoutPreset: i === 4 ? 'relaxed' : 'balanced',
  shapePreset: i === 0 ? 0 : i === 2 ? 12 : 24,
  effectsPreset: i === 2 ? 'grid' : i === 4 ? 'grain' : 'none',
  motionPreset: 'fade-up',
  recommendedIndustries: i === 4 ? ['문화', '여행'] : i === 2 ? ['AI', '교육'] : ['SaaS', '브랜드'],
  supportedComponents: [...componentTypes],
  ready: [0, 2, 4].includes(i),
}));
function colors(
  background: string,
  surface: string,
  foreground: string,
  muted: string,
  primary: string,
  primaryForeground: string,
  secondary: string,
  accent: string,
  border: string,
): Colors {
  return {
    background,
    surface,
    foreground,
    muted,
    primary,
    primaryForeground,
    secondary,
    secondaryForeground: foreground,
    accent,
    accentForeground: primaryForeground,
    border,
    focus: primary,
    success: '#278353',
    warning: '#A65D00',
    error: '#D13438',
  };
}
export const palettes = [
  {
    id: 'heritage',
    name: 'Heritage',
    description: '전통의 깊이와 현대적인 온기',
    light: colors(
      '#F8F5EE',
      '#FFFFFF',
      '#343E32',
      '#697064',
      '#4B6044',
      '#FFFFFF',
      '#E5EADB',
      '#AB593A',
      '#DADFD3',
    ),
    dark: colors(
      '#20291F',
      '#2B352A',
      '#F2F3E9',
      '#B2BDAA',
      '#B5CA8E',
      '#20291F',
      '#364332',
      '#DC9A72',
      '#465441',
    ),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: '깊고 차분한 푸른빛',
    light: colors(
      '#F1F7FA',
      '#FFFFFF',
      '#183748',
      '#537080',
      '#126B91',
      '#FFFFFF',
      '#DBEDF3',
      '#087B88',
      '#CDDFE6',
    ),
    dark: colors(
      '#10232F',
      '#193440',
      '#ECF5FA',
      '#A0BECF',
      '#73CBE9',
      '#10232F',
      '#234855',
      '#73DECA',
      '#345361',
    ),
  },
  {
    id: 'neon',
    name: 'Neon',
    description: '대담하고 선명한 테크 무드',
    light: colors(
      '#F4F6F0',
      '#FFFFFF',
      '#202A20',
      '#5E6D58',
      '#476B12',
      '#FFFFFF',
      '#E6EDDB',
      '#6562B3',
      '#D7DECA',
    ),
    dark: colors(
      '#131711',
      '#1C2218',
      '#F0F4E9',
      '#A3AE98',
      '#D5F58C',
      '#18200F',
      '#293321',
      '#CAB8F6',
      '#35402B',
    ),
  },
  {
    id: 'forest',
    name: 'Forest',
    description: '자연에서 온 편안한 초록',
    light: colors(
      '#F1F6F2',
      '#FFFFFF',
      '#203F31',
      '#597264',
      '#286747',
      '#FFFFFF',
      '#DDEBE1',
      '#886844',
      '#CFDED3',
    ),
    dark: colors(
      '#13261C',
      '#1E3527',
      '#E9F5EC',
      '#ABC4B2',
      '#95D7A8',
      '#13261C',
      '#2B4835',
      '#DAC28E',
      '#3B5846',
    ),
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: '명확한 대비, 변하지 않는 균형',
    light: colors(
      '#F8F9F7',
      '#FFFFFF',
      '#232621',
      '#6B7167',
      '#343D2F',
      '#FFFFFF',
      '#E8ECE3',
      '#65734E',
      '#DDE2D8',
    ),
    dark: colors(
      '#181B17',
      '#232721',
      '#F5F7F0',
      '#ADB4A6',
      '#D9E4C7',
      '#20251A',
      '#333A2C',
      '#BFCFA4',
      '#41483B',
    ),
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: '따뜻한 오렌지와 부드러운 빛',
    light: colors(
      '#FFF7F1',
      '#FFFFFF',
      '#4C3025',
      '#886658',
      '#B74A25',
      '#FFFFFF',
      '#F9E5D5',
      '#985440',
      '#ECD7C9',
    ),
    dark: colors(
      '#2B1D18',
      '#3B2921',
      '#FFF2E5',
      '#D5B5A2',
      '#FFB282',
      '#361D10',
      '#50372A',
      '#F3BCAD',
      '#664B3C',
    ),
  },
];
export function resolveColors(theme: {
  paletteId: string;
  mode: 'light' | 'dark';
  overrides: Partial<Colors>;
}): Colors {
  const palette = palettes.find((p) => p.id === theme.paletteId) || palettes[4];
  return { ...palette[theme.mode], ...theme.overrides };
}
export function contrast(a: string, b: string) {
  const lum = (c: string) => {
    const rgb = [1, 3, 5]
      .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export const registry: Record<
  ComponentType,
  { name: string; category: string; description: string }
> = Object.fromEntries(
  componentTypes.map((type, i) => [
    type,
    {
      name: [
        'Hero Section',
        'Anchor Navigation',
        'Sticky Header',
        'Tab Switcher',
        'Expandable Card',
        'Accordion',
        'Search Filter',
        'Horizontal Carousel',
        'Hotspot Map',
        'Comparison Toggle',
        'Step / File Viewer',
        'Progress Bar',
        'Count-up Number',
        'Live Telemetry',
        'Timeline',
        'Step Story Player',
        'Project Gallery',
        'Relationship Graph',
        'Countdown',
        'Video Player',
        'Video Carousel',
        '2D Drag Demo',
        'Leader / Follower',
        'Simulation Switch',
        'Interactive 2D Scene',
        'Action State Machine',
        'Checklist Assessment',
        'Conditional CTA',
        'CTA Link',
        'External Contact',
        'Form Result View',
        'Eligibility Counter',
      ][i],
      category:
        i === 0
          ? 'Layout'
          : i < 11
            ? 'Navigation & UI'
            : i < 19
              ? 'Data & Storytelling'
              : i < 26
                ? 'Media & Simulation'
                : 'Assessment & Conversion',
      description: [
        '시선을 사로잡는 첫 화면',
        '섹션을 연결하는 빠른 탐색',
        '스크롤에도 유지되는 헤더',
        '콘텐츠를 나누는 탭',
        '클릭하여 자세히 보기',
        '질문과 답변',
        '실시간으로 항목 검색',
        '가로로 탐색하는 카드',
        '공간 속 포인트 탐색',
        '두 가지 경험 비교',
        '단계별 콘텐츠 탐색',
        '목표 달성도 시각화',
        '숫자로 보여주는 성과',
        '시뮬레이션 상태 데이터',
        '시간을 따라가는 이야기',
        '직접 넘기는 스토리',
        '프로젝트 모아보기',
        '노드 사이의 관계',
        '다가오는 순간까지',
        '내 영상 URL로 재생',
        '영상 목록 탐색',
        '움직이며 실험하기',
        '입력을 따라가는 시각화',
        '세 가지 시뮬레이션',
        '2D 인터랙티브 어댑터',
        '상태를 전환하는 액션',
        '선택하며 알아보는 적합도',
        '조건에 맞는 액션',
        '다음 경험으로 연결',
        '이메일과 연락처 연결',
        '입력 결과를 즉시 확인',
        '선택 항목으로 자격 확인',
      ][i],
    },
  ]),
) as Record<ComponentType, { name: string; category: string; description: string }>;
export const fonts = {
  sans: 'Arial, "Apple SD Gothic Neo", sans-serif',
  serif: 'Georgia, "Noto Serif KR", serif',
  mono: '"SFMono-Regular", Consolas, monospace',
};
