class CloudPoint {
    private _x: number;
    private _y: number;
    private _z: number;

    constructor(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public get x() {
        return this._x;
    }

    public set x(newX: number) {
        this._x = newX;
    }

    public get y() {
        return this._y;
    }

    public set y(newY: number) {
        this._y = newY;
    }

    public get z() {
        return this._z;
    }

    public set z(newZ: number) {
        this._z = newZ;
    }

    public get key() {
        return this._x + "_" + this._y + "_" + this._z;
    }
}

export default CloudPoint;