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
  
  private _maxPointCloud: number = 10000;

  private _processingCloudPoints: CloudPoint[] = null;
  private _processingBatches: number = 1;
  private _processingPointRanges: Array<PointRange> = new Array<PointRange>();

  private _rangesWorkers: Array<Worker> = new Array<Worker>();
  private _currentRangeWorker: number = 0;
  private _dimensionsWorker: Worker;

  
  @Prop() concurrentWorkers: number = 10;
  @Prop() sceneSize?: number = null;

  @Prop() pointColor: string = "#000000";
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
      if (this._processingCloudPoints === null) {
        this._processingCloudPoints = cloudPoints;

          if (this.sceneSize !== null) {
            this._processingBatches = Math.ceil(this._processingCloudPoints.length/this._maxPointCloud);

            Logging.log("sending for processing " + Date.now());

            for (let i=0; i<this._processingBatches; i++) {
              if ((i*this._maxPointCloud) < cloudPoints.length) {
                this._rangesWorkers[this._currentRangeWorker].postMessage({
                  action: "processPoints",
                  cloudPoints: this._processingCloudPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud)
                });
              }
              else {
                this._rangesWorkers[this._currentRangeWorker].postMessage({
                  action: "processPoints",
                  cloudPoints: this._processingCloudPoints.slice(i*this._maxPointCloud, this._processingCloudPoints.length)
                });
              }

              if (this._currentRangeWorker < (this._rangesWorkers.length-1)) this._currentRangeWorker++;
              else this._currentRangeWorker = 0;
            }
          }
          else {
            this._cloudViewer.UpdateCloud(this._processingCloudPoints, null).then(() => {
              this._processingCloudPoints = null;
              this._processingBatches = 1;
              this._processingPointRanges = new Array<PointRange>();
            });
          }
      }

      return true;
    }
    else {
      return false;
    }
  }

  connectedCallback() {
    for (let i=0; i<this.concurrentWorkers; i++) {
      this._rangesWorkers[i] = new Worker(workerPath);
      this._rangesWorkers[i].onmessage = (work) => {
        if (work.data.action == "processPoints") {
          this._processingPointRanges.push(work.data.ranges as PointRange);
    
          if (this._processingPointRanges.length === this._processingBatches) {
            this._dimensionsWorker.postMessage({
              action: "cloudDimensions",
              sceneSize: this.sceneSize,
              pointRanges: this._processingPointRanges
            });
          }
        }
      };  
    }

    this._dimensionsWorker = new Worker(workerPath);
    this._dimensionsWorker.onmessage = (work) => {
      if (work.data.action == "cloudDimensions") {
        const cloudDimensions = work.data.cloudDimensions as CloudDimensions;
  
        Logging.log("continuing " + Date.now());
  
        this._cloudViewer.UpdateCloud(this._processingCloudPoints, cloudDimensions).then(() => {
          Logging.log("cloud updated " + Date.now());
  
          this._processingCloudPoints = null;
          this._processingBatches = 1;
          this._processingPointRanges = new Array<PointRange>();
        });
      }
    };
  }

  componentDidLoad() {
    this._cloudViewer = new CloudViewer(this._canvas, this.pointColor, this.pointSize, this.concurrentWorkers);
  }

  render() {
    return (
      <Host>
        <div ref={(el) => this._canvas = el as HTMLDivElement} id="canvas-container"></div>
      </Host>
    );
  }
}
