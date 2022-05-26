import { Component, Host, h, Method, Prop } from '@stencil/core';
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
  
  @Prop() sceneWidth: any = 3;
  @Prop() sceneDepth: number = 3;
  @Prop() sceneHeight: number = 3;

  @Prop() backgroundColor: string = "#484848";
  @Prop() pointColor: string = "#ffffff";
  @Prop() pointSize: number = 0.01;

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
    this._cloudViewer = new CloudViewer(this._canvas, this.backgroundColor, this.pointColor, this.pointSize, this.sceneWidth, this.sceneHeight, this.sceneDepth);
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._canvas = el as HTMLDivElement} id="canvas-container"></div>
      </Host>
    );
  }
}
