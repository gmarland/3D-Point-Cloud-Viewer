import { Component, Host, h, Method } from '@stencil/core';
import { CloudViewer } from '../../modules/CloudViewer';
import CloudPoint from '../../modules/Models/CloudPoint';

@Component({
  tag: 'cloud-scene',
  styleUrl: 'cloud-scene.scss',
  shadow: true,
})
export class CloudScene {
  _canvas: HTMLDivElement;
  _cloudViewer: CloudViewer;

  @Method()
  public async resize(): Promise<boolean> {
    if (this._cloudViewer) {
      this._cloudViewer.Resize();

      return true;
    }
    else {
      return false;
    }
  }

  @Method()
  public async updateCloud(cloudPoints: Array<any>): Promise<boolean> {
    if (this._cloudViewer) {
      const mappedPoints = cloudPoints.map(cp => new CloudPoint(cp.x, cp.y, cp.z));

      this._cloudViewer.UpdateCloud(mappedPoints);

      return true;
    }
    else {
      return false;
    }
  }

  componentDidLoad() {
    this._cloudViewer = new CloudViewer(this._canvas);
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._canvas = el as HTMLDivElement} id="canvas-container"></div>
      </Host>
    );
  }
}
