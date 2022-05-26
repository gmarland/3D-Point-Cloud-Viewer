class CloudPoint {
    private _x: number;
    private _y: number;
    private _z: number;

    private _i?: number;

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public get x() {
        return  this._x;
    }

    public get y() {
        return  this._y;
    }

    public get z() {
        return  this._z;
    }

    public get i() {
        return this._i;
    }

    public set i(index: number) {
        this._i = index;
    }

    public get key() {
        return this._x + "_" + this._y + "_" + this._z;
    }
}

export default CloudPoint;