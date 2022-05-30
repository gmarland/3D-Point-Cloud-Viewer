import { Logging } from "../Logging";
import { CloudDimensions } from "./CloudDimensions";
import CloudPoint from "./CloudPoint";

class PointCloud {
    private _isProcessing = false;
    private _awaitingProcess?: Array<CloudPoint> = null;

    private _cloud: Array<CloudPoint> = new Array<CloudPoint>();
    
    private _isDirty: boolean = false;

    public get IsDirty() {
        return this._isDirty;
    }

    public set IsDirty(dirty: boolean) {
        this._isDirty = dirty;
    }

    public LoadCloud(cloudPoints: Array<CloudPoint>, cloudDimensions: CloudDimensions, continuing: boolean): void {
        if (!this._isProcessing || continuing) {
            this._isProcessing = true;

            let startTime = Date.now();

            new Promise<Array<CloudPoint>>((resolve) => {
                // get the points where we want them if we are normalizing them
                
                if (cloudDimensions != null) {
                    let processed = new Array<CloudPoint>();
                    
                    cloudPoints.forEach((cloudPoint: CloudPoint) => {
                        cloudPoint.x = (cloudPoint.x-cloudDimensions.xOffset)*cloudDimensions.xRatio;
                        cloudPoint.y = (cloudPoint.y-cloudDimensions.yOffset)*cloudDimensions.yRatio;
                        cloudPoint.z = (cloudPoint.z-cloudDimensions.zOffset)*cloudDimensions.zRatio;
        
                        processed.push(cloudPoint);
                    });

                    resolve(processed);
                }
                else {
                    resolve(cloudPoints);
                }
            }).then((points: Array<CloudPoint>) => {
                this._cloud = points;

                Logging.Log("Time to build: " + (Date.now() - startTime));

                this._isDirty = true;

                if (this._awaitingProcess !== null) {
                    const awaiting = this._awaitingProcess.slice(0, this._awaitingProcess.length);
                    this._awaitingProcess = null;
    
                    this.LoadCloud(awaiting, cloudDimensions, true);
                }
                else {
                    this._isProcessing = false;
                }
            });
        }
        else {
            this._awaitingProcess = cloudPoints;
        }
    }

    public GetPointsVerticies(): Promise<Float32Array> {
        return new Promise((resolve) => {
            const currentCloudArray = Array.from(this._cloud.values());

            let startLooping = Date.now();

            let vertices = [];

            currentCloudArray.forEach((value: CloudPoint) => {
                vertices.push(value.x);
                vertices.push(value.y);
                vertices.push(value.z);
            });

            for (let i=0; i<vertices.length; i+=3) {
                vertices[i] = vertices[i];
                vertices[i+1] = vertices[i+1];
                vertices[i+2] = vertices[i+2];
            }

            Logging.Log("Time to vertex: " + (Date.now() - startLooping));

            resolve(new Float32Array(vertices));
        });
    }
}

export default PointCloud;