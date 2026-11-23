import { Section } from './schema';
const aliases: Partial<Record<Section['type'], string>> = {
  tabs: 'features',
  gallery: 'stories',
  cta: 'contact',
  'simulation-switch': 'playground',
  scene: 'playground',
};
export function sectionAnchor(section: Section, sections: Section[]): string {
  const alias = aliases[section.type];
  if (alias && sections.find((s) => aliases[s.type] === alias)?.id === section.id) return alias;
  return section.id;
}
