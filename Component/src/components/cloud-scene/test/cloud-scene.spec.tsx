import { newSpecPage } from '@stencil/core/testing';
import { CloudScene } from '../cloud-scene';

describe('cloud-scene', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CloudScene],
      html: `<cloud-scene></cloud-scene>`,
    });
    expect(page.root).toEqualHtml(`
      <cloud-scene>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cloud-scene>
    `);
  });
});
