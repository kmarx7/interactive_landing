import { test, expect } from '@playwright/test';
test('create, edit, history, persistence, backup and restore', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '새 프로젝트', exact: true }).click();
  await page.getByLabel('새 프로젝트 이름').fill('QA lifecycle');
  await page.getByRole('button', { name: '프로젝트 만들기', exact: true }).click();
  await expect(page.getByLabel('프로젝트 이름')).toHaveValue('QA lifecycle');
  const title = page.getByLabel('제목', { exact: true });
  await title.fill('A verified story');
  await title.blur();
  await expect(page.getByRole('heading', { name: 'A verified story' })).toBeVisible();
  await page.getByLabel('Undo', { exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Less busywork. More possibility.' }),
  ).toBeVisible();
  await page.getByLabel('Redo', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A verified story' })).toBeVisible();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.getByRole('tab', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Create');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('프로젝트 저장', { exact: true }).click();
  await expect(page.getByLabel('프로젝트 저장', { exact: true })).toContainText(
    '모든 변경사항 저장됨',
  );
  await page.getByRole('button', { name: '내보내기', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /프로젝트 JSON/ }).click();
  const backup = await download;
  const path = await backup.path();
  await page.getByLabel('닫기', { exact: true }).click();
  await page.getByLabel('프로젝트 목록으로').click();
  await page.reload();
  await page.getByLabel('QA lifecycle 열기').click();
  await expect(page.getByRole('heading', { name: 'A verified story' })).toBeVisible();
  await page.getByLabel('프로젝트 목록으로').click();
  await page.getByLabel('프로젝트 JSON 가져오기').setInputFiles(path!);
  await expect(page.getByLabel('프로젝트 이름')).toHaveValue('QA lifecycle (가져옴)');
  await expect(page.getByRole('heading', { name: 'A verified story' })).toBeVisible();
});
test('corrupt import leaves existing data intact', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('프로젝트 JSON 가져오기').setInputFiles({
    name: 'corrupt.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole('alert')).toContainText('손상된 프로젝트');
  await expect(page.getByRole('heading', { name: '내 프로젝트 0' })).toBeVisible();
});
