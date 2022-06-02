import { Scene, PointsMaterial, Points, BufferGeometry, BufferAttribute, Color } from "three";
import CloudPoint from "./Models/CloudPoint";
import PointCloud from "./Models/PointCloud";
import { CloudDimensions } from "./Models/CloudDimensions";
import { workerPath } from '../workers/pointCloud.worker.ts?worker';
import { Logging } from "./Logging";

class PointScene {
    private _scene: Scene = new Scene();
    
    private _pointsMaterial: PointsMaterial;
    
    private _pointCloudWorkers: Array<Worker> = new Array<Worker>();
    private _currentPointsWorker: number = 0;
    private _isBuilding: boolean = false;

    private _maxProcessingPointCloud: number = 200000;
    private _pointCloudCount: number = 0;
    private _pointClouds: Array<PointCloud> = new Array<PointCloud>();

    private _points: Array<Points> = new Array<Points>();

    private _isDirty: boolean = false;

    constructor(pointColor: string, pointSize: number, concurrentWorkers: number) {
        this._pointsMaterial = new PointsMaterial({ 
            color:new Color(pointColor), 
            size: pointSize 
        });

        for (let i=0; i<concurrentWorkers; i++) {
            let worker = new Worker(workerPath);
            worker.onmessage = (work) => {
                if (work.data.action == "cloudVerticies") {
                    this._pointClouds.push(new PointCloud(work.data.vertices as Float32Array));
                    if (this._pointClouds.length === this._pointCloudCount) {
                        Logging.log("built clouds");

                        this.Update().then(() => {
                            Logging.log("built scene");
                            
                            this._isBuilding = false;
                        });
                    }
                }
            }

            this._pointCloudWorkers.push(worker);
        }

        this._pointClouds = new Array<PointCloud>();

        this._scene = new Scene();
    }

    public get IsDirty(): boolean {
        return this._isDirty
    }

    public set IsDirty(isDirty: boolean) {
        this._isDirty = isDirty
    }

    public GetScene(): Scene {
        return this._scene;
    }

    public UpdateCloud(cloudPoints: Array<CloudPoint>, cloudDimensions: CloudDimensions): Promise<void> {
        if (!this._isBuilding) {
            this._isBuilding = true;

            this._pointClouds = new Array<PointCloud>();

            return new Promise<void>((resolve) => {
                this._pointCloudCount = Math.ceil(cloudPoints.length/this._maxProcessingPointCloud);

                for (let i=0; i<this._pointCloudCount; i++) {
                    if ((i*this._maxProcessingPointCloud) < cloudPoints.length) {
                        this._pointCloudWorkers[this._currentPointsWorker].postMessage({
                            action: "buildVerticies",
                            pointCloudData: cloudPoints.slice(i*this._maxProcessingPointCloud, (i+1)*this._maxProcessingPointCloud),
                            pointCloudDimensions: cloudDimensions
                        });
                    }
                    else {
                        this._pointCloudWorkers[this._currentPointsWorker].postMessage({
                            action: "buildVerticies",
                            pointCloudData: cloudPoints.slice(i*this._maxProcessingPointCloud, cloudPoints.length),
                            pointCloudDimensions: cloudDimensions
                        });
                    }

                    if (this._currentPointsWorker < (this._pointCloudWorkers.length-1)) this._currentPointsWorker++;
                    else this._currentPointsWorker = 0;
                }

                resolve();
            });
        }
    }

    public Add(element: any): void {
        this._scene.add(element);
    }

    private Update(): Promise<void> {
        return new Promise((resolve) => {
            for (let i=0; i<this._pointClouds.length; i++) {
                if (i < this._points.length) {
                    this._points[i].geometry.setAttribute('position', new BufferAttribute(this._pointClouds[i].verticies, 3 ) );
                    this._points[i].geometry.attributes.position.needsUpdate = true;
                }
                else {
                    const geometry = new BufferGeometry();
                    geometry.setAttribute('position', new BufferAttribute(this._pointClouds[i].verticies, 3 ) );

                    const points = new Points(geometry, this._pointsMaterial)

                    this._points.push(points);
                    this._scene.add(points);
                }
            }

            if (this._points.length > this._pointClouds.length) {
                const pointDifference = this._points.length - this._pointClouds.length;

                for (let i=0; i<pointDifference; i++) {
                    this._scene.remove(this._points[(this._points.length-1)]);
                    
                    this._points.pop();
                }
            }

            this._isDirty = true;

            resolve();
        });
    }
}

export { PointScene } 