import { Component, Host, h, Method, Prop } from '@stencil/core';
import { CloudViewer } from '../../modules/CloudViewer';
import { CloudDimensions } from '../../modules/Models/CloudDimensions';
import CloudPoint from '../../modules/Models/CloudPoint';
import { GetCloudDimensions } from '../../utils/pointCloudUtils';

@Component({
  tag: 'cloud-scene',
  styleUrl: 'cloud-scene.scss',
  shadow: true,
})
export class CloudScene {
  _canvas: HTMLDivElement;
  _cloudViewer: CloudViewer;
  
  _processing: boolean = false;

  @Prop() sceneWidth: number = 3;
  @Prop() sceneDepth: number = 3;
  @Prop() sceneHeight: number = 3;

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
      if (!this._processing) {
        this._processing = true;

        new Promise<Array<CloudPoint>>((resolve) => {
          let mapped: CloudPoint[] = cloudPoints;

          resolve(mapped);
        }).then((mappedPoints: Array<CloudPoint>) => {
          GetCloudDimensions(this.sceneWidth, this.sceneHeight, this.sceneDepth, mappedPoints).then((cloudDimensions: CloudDimensions) => {
            this._cloudViewer.UpdateCloud(mappedPoints, cloudDimensions);
          
            this._processing = false;
          });
        });
      }

      return true;
    }
    else {
      return false;
    }
  }

  componentDidLoad() {
    this._cloudViewer = new CloudViewer(this._canvas, this.pointColor, this.pointSize);
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._canvas = el as HTMLDivElement} id="canvas-container"></div>
      </Host>
    );
  }
}
