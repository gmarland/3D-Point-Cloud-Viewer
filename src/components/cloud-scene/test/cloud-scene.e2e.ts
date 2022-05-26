import { newE2EPage } from '@stencil/core/testing';

describe('cloud-scene', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cloud-scene></cloud-scene>');

    const element = await page.find('cloud-scene');
    expect(element).toHaveClass('hydrated');
  });
});
