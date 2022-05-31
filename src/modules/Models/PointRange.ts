class PointRange {
    private _minX: number;
    private _maxX: number;
    private _minY: number;
    private _maxY: number;
    private _minZ: number;
    private _maxZ: number;
    
    public get minX(): number {
        return this._minX;
    }

    public set minX(newMinX: number) {
        this._minX = newMinX;
    }
    
    public get maxX(): number {
        return this._maxX;
    }

    public set maxX(newMaxX: number) {
        this._maxX = newMaxX;
    }
    
    public get minY(): number {
        return this._minY;
    }

    public set minY(newMinY: number) {
        this._minY = newMinY;
    }
    
    public get maxY(): number {
        return this._maxY;
    }

    public set maxY(newMaxY: number) {
        this._maxY = newMaxY;
    }
    
    public get minZ(): number {
        return this._minZ;
    }

    public set minZ(newMinZ: number) {
        this._minZ = newMinZ;
    }
    
    public get maxZ(): number {
        return this._maxZ;
    }

    public set maxZ(newMaxZ: number) {
        this._maxZ = newMaxZ;
    }
}

export { PointRange }