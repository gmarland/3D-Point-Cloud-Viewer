import { Component, Host, h, Method, Prop } from '@stencil/core';
import { CloudViewer } from '../../modules/CloudViewer';
import { Logging } from '../../modules/Logging';
import { CloudDimensions } from '../../modules/Models/CloudDimensions';
import CloudPoint from '../../modules/Models/CloudPoint';
import { PointRange } from '../../modules/Models/PointRange';
import { workerPath } from '../../workers/pointProcessing.worker.ts?worker';

@Component({
  tag: 'cloud-scene',
  styleUrl: 'cloud-scene.scss',
  shadow: true,
})
export class CloudScene {
  _canvas: HTMLDivElement;
  _cloudViewer: CloudViewer;
  
  _processing: boolean = false;
  private _maxPointCloud: number = 10000;

  private _rangesWorker: Worker;
  private _dimensionsWorker: Worker;

  @Prop() sceneSize?: number = null;

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
          if (this.sceneSize !== null) {
            const sceneCount = Math.ceil(mappedPoints.length/this._maxPointCloud);
            const pointRanges = Array<PointRange>();
            
            Logging.Log("sending for processing " + Date.now());

            for (let i=0; i<sceneCount; i++) {
              if ((i*this._maxPointCloud) < cloudPoints.length) {
                this._rangesWorker.postMessage({
                  action: "processPoints",
                  cloudPoints: mappedPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud)
                });
              }
              else {
                this._rangesWorker.postMessage({
                  action: "processPoints",
                  cloudPoints: mappedPoints.slice(i*this._maxPointCloud, mappedPoints.length)
                });
              }
            }
          }
          else {
            this._cloudViewer.UpdateCloud(mappedPoints, null).then(() => {
              this._processing = false;
            });
          }
        });
      }

      return true;
    }
    else {
      return false;
    }
  }

  connectedCallback() {
    this._rangesWorker = new Worker(workerPath);
    this._dimensionsWorker = new Worker(workerPath);
    
    this._rangesWorker.onmessage = (work) => {
      if (work.data.action == "processPoints") {
        pointRanges.push(work.data.ranges as PointRange);

        if (pointRanges.length === sceneCount) {
          this._dimensionsWorker.postMessage({
            action: "cloudDimensions",
            sceneSize: this.sceneSize,
            pointRanges: pointRanges
          });
        }
      }
    };

    this._dimensionsWorker.onmessage = (work) => {
      if (work.data.action == "cloudDimensions") {
        const cloudDimensions = work.data.cloudDimensions as CloudDimensions;

        Logging.Log("continuing " + Date.now());

        this._cloudViewer.UpdateCloud(mappedPoints, cloudDimensions).then(() => {
          Logging.Log("cloud updated " + Date.now());

          this._processing = false;
        });
      }
    };
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
