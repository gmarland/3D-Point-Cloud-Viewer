import * as THREE from "three";
import CloudPoint from "./Models/CloudPoint";
import PointCloud from "./Models/PointCloud";

class PointScene {
    private _scene: THREE.Scene = new THREE.Scene();
    
    private _pointCloud: PointCloud = new PointCloud();
    private _pointsMaterial: THREE.PointsMaterial  = new THREE.PointsMaterial({ color:0xff0000, size: 0.1 });
    private _points?: THREE.Points = null;
    
    constructor() {
        this._scene = new THREE.Scene();
    }

    public GetScene(): THREE.Scene {
        return this._scene;
    }

    public UpdateCloud(cloudPoints: Array<CloudPoint>): void {
        this._pointCloud.LoadCloud(cloudPoints);
    }

    public Update(): void {
        if (this._pointCloud.IsDirty) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.BufferAttribute( this._pointCloud.GetPointsVerticies(), 3 ) );

            if (this._points) {
                this._points.geometry.dispose();
                this._points.geometry = geometry;
            }
            else {
                this._points = new THREE.Points(geometry, this._pointsMaterial);
                this._scene.add(this._points);
            }

            this._pointCloud.IsDirty = false;
        }
    }
}

export { PointScene } 