import { Logging } from "../Logging";
import CloudPoint from "./CloudPoint";

class PointCloud {
    
    private _targetXSize: number;
    private _targetYSize: number;
    private _targetZSize: number;

    private _isProcessing = false;
    private _awaitingProcess?: Array<CloudPoint> = null;

    private _cloud: Array<CloudPoint> = new Array<CloudPoint>();
    
    private _isDirty: boolean = false;

    constructor(sceneWidth: number, sceneHeight: number, sceneDepth: number) {
        this._targetXSize = sceneWidth;
        this._targetYSize = sceneHeight;
        this._targetZSize = sceneDepth;

        Logging.Log(sceneWidth);
    }

    public get IsDirty() {
        return this._isDirty;
    }

    public set IsDirty(dirty: boolean) {
        this._isDirty = dirty;
    }

    public LoadCloud(cloudPoints: Array<CloudPoint>, continuing: boolean): void {
        if (!this._isProcessing || continuing) {
            this._isProcessing = true;

            let startTime = Date.now();

            this._cloud = new Array<CloudPoint>();

            let minX = null;
            let maxX = null;
            let minY = null;
            let maxY = null;
            let minZ = null;
            let maxZ = null;

            cloudPoints.forEach((cloudPoint: CloudPoint) => {
                if ((minX === null) || (cloudPoint.x < minX)) minX = cloudPoint.x;
                if ((maxX === null) || (cloudPoint.x > maxX)) maxX = cloudPoint.x;
                if ((minX === null) || (cloudPoint.y < minY)) minY = cloudPoint.y;
                if ((maxY === null) || (cloudPoint.y > maxY)) maxY = cloudPoint.y;
                if ((minX === null) || (cloudPoint.z < minZ)) minZ = cloudPoint.z;
                if ((maxZ === null) || (cloudPoint.z > maxZ)) maxZ = cloudPoint.z;
            });

            let xRatio = this._targetXSize/(maxX-minX);
            let yRatio = this._targetYSize/(maxY-minY);
            let zRatio = this._targetZSize/(maxZ-minZ);

            cloudPoints.forEach((cloudPoint: CloudPoint) => {
                cloudPoint.x = this.normailizePoint(cloudPoint.x*xRatio);
                cloudPoint.y = this.normailizePoint(cloudPoint.y*yRatio);
                cloudPoint.z = this.normailizePoint(cloudPoint.z*zRatio);

                this._cloud.push(cloudPoint);
            });

            Logging.Log("Time to build: " + (Date.now() - startTime));

            this._isDirty = true;
            
            if (this._awaitingProcess !== null) {
                const awaiting = this._awaitingProcess.slice(0, this._awaitingProcess.length);
                this._awaitingProcess = null;

                this.LoadCloud(awaiting, true);
            }
            else {
                this._isProcessing = false;
            }
        }
        else {
            this._awaitingProcess = cloudPoints;
        }
    }

    public GetPointsVerticies(): Float32Array {
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


        return new Float32Array(vertices);
    }

    private normailizePoint(num: number) {
        return Math.round(num * 100) / 100
    }
}

export default PointCloud;