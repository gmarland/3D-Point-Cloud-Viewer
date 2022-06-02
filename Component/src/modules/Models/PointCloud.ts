class PointCloud {
    private _verticies: Float32Array;

    public constructor(verticies: Float32Array) {
        this._verticies = verticies;
    }
    
    public get verticies(): Float32Array {
        return this._verticies;
    }
}

export default PointCloud;