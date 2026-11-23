import { createSection, Project, uid, ComponentType } from './schema';
export const templates = [
  {
    id: 'saas',
    name: 'Forma — SaaS Product',
    category: 'SaaS · Product',
    description: '좋은 아이디어가, 더 좋은 결과로.',
    style: 'raw-grid',
    palette: 'monochrome',
    brand: 'FORMA',
    title: 'Less busywork.\nMore possibility.',
    body: '흩어진 아이디어를 하나의 흐름으로. 팀의 다음 가능성을 만드는 가장 간결한 워크스페이스.',
    tag: 'A LITTLE LESS FRICTION. A LOT MORE FLOW.',
    types: ['hero', 'tabs', 'comparison', 'gallery', 'accordion', 'cta'] as ComponentType[],
  },
  {
    id: 'physical',
    name: 'Physical AI Campus',
    category: 'Education · Technology',
    description: '화면을 넘어, 현실을 움직이는 AI.',
    style: 'linear-dark',
    palette: 'neon',
    brand: 'PAAI CAMPUS',
    title: 'Intelligence,\nin motion.',
    body: '로봇과 함께 배우는 Physical AI. 직접 움직이고 실험하며 다음 세대의 기술을 경험하세요.',
    tag: 'LEARN BY BUILDING. BUILD THE FUTURE.',
    types: [
      'hero',
      'simulation-switch',
      'telemetry',
      'tabs',
      'comparison',
      'checklist',
      'cta',
    ] as ComponentType[],
  },
  {
    id: 'somssi',
    name: 'SOMSSI — Cultural Journey',
    category: 'Culture · Travel',
    description: '손끝에서 시작되는 새로운 여행.',
    style: 'earthy-calm',
    palette: 'heritage',
    brand: 'SOMSSI',
    title: '오래된 솜씨,\n새로운 감각.',
    body: '가야금의 울림에서 장인의 손끝까지. 지역의 이야기를 나만의 경험으로 만나는 문화 여행.',
    tag: 'LOCAL STORIES. LASTING EXPERIENCES.',
    types: [
      'hero',
      'scene',
      'story-player',
      'gallery',
      'comparison',
      'accordion',
      'cta',
    ] as ComponentType[],
  },
];
export function newProject(templateId = 'saas', name?: string): Project {
  const t = templates.find((t) => t.id === templateId) || templates[0];
  const sections = t.types.map((type) => {
    const s = createSection(type);
    s.label =
      type === 'hero'
        ? 'Hero · 첫 화면'
        : type === 'cta'
          ? 'Contact · 시작하기'
          : type === 'accordion'
            ? 'FAQ · 자주 묻는 질문'
            : type === 'tabs'
              ? 'Features · 주요 기능'
              : type === 'gallery'
                ? 'Stories · 갤러리'
                : type === 'comparison'
                  ? 'Comparison · 비교'
                  : type === 'scene' || type === 'simulation-switch'
                    ? 'Playground · 시뮬레이션'
                    : type === 'telemetry'
                      ? 'Live · 텔레메트리'
                      : 'Assessment · 체크리스트';
    if (type === 'hero') {
      s.content = {
        ...s.content,
        eyebrow: t.tag,
        title: t.title,
        body: t.body,
        button:
          templateId === 'somssi'
            ? '나만의 여행 시작하기'
            : templateId === 'physical'
              ? '플레이그라운드 체험하기'
              : 'Start your flow',
        url:
          '#' +
          (t.types.some((type) => type === 'simulation-switch' || type === 'scene')
            ? 'playground'
            : 'features'),
      };
      s.design.fontSize = 64;
    } else if (type === 'tabs') {
      s.content.title = 'Everything flows, together.';
      s.content.eyebrow = 'DESIGNED FOR YOUR EVERYDAY';
      s.content.body = '복잡함은 덜고, 중요한 일에 집중하세요.';
    } else if (type === 'accordion') {
      s.content.title = '궁금한 점이 있나요?';
      s.content.items = [
        {
          id: uid(),
          title: '누구나 시작할 수 있나요?',
          body: '네, 별도의 전문 지식 없이 체험을 시작할 수 있습니다.',
          value: 0,
          url: '',
        },
        {
          id: uid(),
          title: '어떻게 참여하나요?',
          body: '아래 안내를 통해 자세한 참여 방법을 확인하세요.',
          value: 0,
          url: '',
        },
        {
          id: uid(),
          title: '다른 사람과 함께할 수 있나요?',
          body: '물론입니다. 함께하는 경험은 더 많은 가능성을 만듭니다.',
          value: 0,
          url: '',
        },
      ];
    } else if (type === 'cta') {
      s.content.title = 'Your next chapter starts here.';
      s.content.body = '가능성을 경험하는 가장 좋은 방법은, 직접 시작하는 것.';
      s.content.button = '문의 이메일 보내기';
      s.content.url = 'mailto:hello@example.com';
    } else if (type === 'comparison') {
      s.content.title = 'A better way forward.';
      s.content.items = s.content.items.slice(0, 2);
      s.content.items[0].title = 'Before';
      s.content.items[1].title = 'With ' + t.brand;
    } else if (type === 'scene' || type === 'simulation-switch') {
      s.content.title =
        templateId === 'somssi' ? '손끝으로 만나는 울림' : 'Move. Explore. Understand.';
      s.content.eyebrow = 'INTERACTIVE PLAYGROUND';
      s.interaction.simulation = templateId === 'somssi' ? 'string' : 'robot';
    } else if (type === 'gallery') {
      s.content.title =
        templateId === 'somssi' ? '지역에서 만나는 특별한 순간' : 'Made for your kind of work.';
    }
    return s;
  });
  return {
    schemaVersion: 1,
    id: uid(),
    name: name?.trim() || t.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    page: { title: t.brand, description: t.body, sections },
    theme: {
      styleId: t.style,
      paletteId: t.palette,
      mode: templateId === 'physical' ? 'dark' : 'light',
      overrides: {},
      headingFont: null,
      bodyFont: 'sans',
      maxWidth: 1120,
      motionPreset: 'none',
      gradient: false,
      gradientAngle: 135,
    },
    assets: [],
    dataBindings: [],
  };
}
