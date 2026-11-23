import { describe, it, expect } from 'vitest';
import { parseColor } from '../components/color-studio';
import { newProject } from '../lib/templates';
import { sectionAnchor } from '../lib/navigation';
import { createSection, parseProject } from '../lib/schema';
describe('color editing validation', () => {
  it('converts HEX, RGB and HSL to a valid semantic color', () => {
    expect(parseColor('00ff00', 'HEX')).toBe('#00ff00');
    expect(parseColor('255, 0, 0', 'RGB')).toBe('#ff0000');
    expect(parseColor('120, 100%, 50%', 'HSL')).toBe('#00ff00');
    expect(parseColor('#00ff0080', 'HEX')).toBe('#00ff0080');
  });
  it('rejects malformed and out-of-range edits', () => {
    for (const [value, format] of [
      ['red', 'HEX'],
      ['12', 'HEX'],
      ['256,0,0', 'RGB'],
      ['-1,0,0', 'RGB'],
      ['120,101%,50%', 'HSL'],
      ['NaN,0,0', 'RGB'],
      ['12,4', 'RGB'],
    ])
      expect(parseColor(value, format)).toBeNull();
  });
});
describe('navigation remains unique when cloning', () => {
  it('gives an alias only to the first matching section', () => {
    const a = createSection('tabs'),
      b = createSection('tabs');
    expect(sectionAnchor(a, [a, b])).toBe('features');
    expect(sectionAnchor(b, [a, b])).toBe(b.id);
  });
  it('every starter primary anchor resolves', () => {
    for (const name of ['saas', 'physical', 'somssi']) {
      const p = newProject(name);
      const anchors = p.page.sections.map((s) => '#' + sectionAnchor(s, p.page.sections));
      expect(anchors).toContain(p.page.sections[0].content.url);
    }
  });
  it('rejects duplicate item identifiers', () => {
    const p = newProject();
    p.page.sections[0].content.items.push(p.page.sections[0].content.items[0]);
    expect(() => parseProject(p)).toThrow();
  });
});
