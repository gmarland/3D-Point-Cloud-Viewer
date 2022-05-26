import CloudPoint from "./CloudPoint";

class PointCloud {
    private _cloud: Map<string, CloudPoint> = new Map<string, CloudPoint>();
    
    private _isDirty: boolean = false;

    public get IsDirty() {
        return this._isDirty;
    }

    public set IsDirty(dirty: boolean) {
        this._isDirty = dirty;
    }

    public LoadCloud(cloudPoints: Array<CloudPoint>): void {
        var mappedCloudPoints = cloudPoints.reduce((map, obj) => (map[obj.key] = obj, map), new Map<string, CloudPoint>());

        for (let [key, value] of this._cloud) {
            if (!mappedCloudPoints.has(key)) {
                this._cloud.delete(key);
                this._isDirty = true;
            }
        }

        
        cloudPoints.forEach(cloudPoint => {
            if (!this._cloud.has(cloudPoint.key)) {
                this._cloud.set(cloudPoint.key, cloudPoint);
                this._isDirty = true;
            }
        });
    }

    public GetPointsVerticies(): Float32Array {
        let vertices = [];

        let i = 0;

        this._cloud.forEach((value: CloudPoint, key: string) => {
            vertices.push(value.x);
            vertices.push(value.y);
            vertices.push(value.z);

            i++;
        });

        return new Float32Array(vertices);
    }
}

export default PointCloud;