class CloudDimensions {
    private _xRatio: number;
    private _yRatio: number;
    private _zRatio: number;

    private _xOffset: number;
    private _yOffset: number;
    private _zOffset: number;

    public get xRatio(): number {
        return this._xRatio;
    }

    public set xRatio(newXRatio: number) {
        this._xRatio = newXRatio;
    }

    public get yRatio(): number {
        return this._yRatio;
    }

    public set yRatio(newYRatio: number) {
        this._yRatio = newYRatio;
    }

    public get zRatio(): number {
        return this._zRatio;
    }

    public set zRatio(newZRatio: number) {
        this._zRatio = newZRatio;
    }

    public get xOffset(): number {
        return this._xOffset;
    }
    
    public set xOffset(newXOffset: number) {
        this._xOffset = newXOffset;
    }

    public get yOffset(): number {
        return this._yOffset;
    }

    public set yOffset(newYOffset: number) {
        this._yOffset = newYOffset;
    }

    public get zOffset(): number {
        return this._zOffset;
    }
    
    public set zOffset(newZOffset: number) {
        this._zOffset = newZOffset;
    }
}

export { CloudDimensions }