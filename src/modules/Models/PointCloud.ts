import CloudPoint from "./CloudPoint";

class PointCloud {
    private _targetXSize: number = 3;
    private _targetYSize: number = 3;
    private _targetZSize: number = 3;

    private _cloud: Map<string, CloudPoint> = new Map<string, CloudPoint>();
    
    private _isDirty: boolean = false;

    public get IsDirty() {
        return this._isDirty;
    }

    public set IsDirty(dirty: boolean) {
        this._isDirty = dirty;
    }

    public LoadCloud(cloudPoints: Array<CloudPoint>): void {
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
        });

        var mappedCloudPoints = cloudPoints.reduce((map, obj) => (map[obj.key] = obj, map), new Map<string, CloudPoint>());

        for (let [key] of this._cloud) {
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
        const currentCloudArray = Array.from(this._cloud.values());

        let vertices = [];

        let i = 0;

        currentCloudArray.forEach((value: CloudPoint) => {
            vertices.push(value.x);
            vertices.push(value.y);
            vertices.push(value.z);

            i++;
        });

        for (let i=0; i<vertices.length; i+=3) {
            vertices[i] = vertices[i];
            vertices[i+1] = vertices[i+1];
            vertices[i+2] = vertices[i+2];
        }

        return new Float32Array(vertices);
    }

    private normailizePoint(num: number) {
        return Math.round(num * 100) / 100
    }
}

export default PointCloud;