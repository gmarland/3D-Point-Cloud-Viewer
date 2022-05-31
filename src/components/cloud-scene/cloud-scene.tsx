import { Component, Host, h, Method, Prop } from '@stencil/core';
import { CloudViewer } from '../../modules/CloudViewer';
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
            const PointRanges = Array<PointRange>();
            
            console.log("sending for processing " + Date.now());
            const processingWork = new Worker(workerPath);

            for (let i=0; i<sceneCount; i++) {
              if ((i*this._maxPointCloud) < cloudPoints.length) {
                processingWork.postMessage({
                  action: "processPoints",
                  cloudPoints: mappedPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud)
                });
              }
              else {
                processingWork.postMessage({
                  action: "processPoints",
                  cloudPoints: mappedPoints.slice(i*this._maxPointCloud, mappedPoints.length)
                });
              }
            }

            processingWork.onmessage = (cloudDimensions) => {
              if (cloudDimensions.data.action == "processPoints") {
                PointRanges.push(cloudDimensions.data.ranges as PointRange);

                if (PointRanges.length === sceneCount) {
                  console.log(PointRanges);
                }
              }
            };

            const cloudSections = Array<Promise<CloudDimensions>>();

            /*for (let i=0; i<sceneCount; i++) {
                if ((i*this._maxPointCloud) < cloudPoints.length) cloudSections.push(GetCloudDimensions(this.sceneSize, mappedPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud)));
                else cloudSections.push(GetCloudDimensions(this.sceneSize, mappedPoints.slice(i*this._maxPointCloud, mappedPoints.length)));
            }
            
            Promise.all(cloudSections).then((dimensions) => {
              console.log(dimensions);
            });

            GetCloudDimensions(this.sceneSize, mappedPoints).then((cloudDimensions: CloudDimensions) => {
              console.log("continuing " + Date.now());
              this._cloudViewer.UpdateCloud(mappedPoints, cloudDimensions).then(() => {
                console.log("cloud updated " + Date.now());
                this._processing = false;
              });
            });*/
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
