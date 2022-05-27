import * as THREE from "three";
import CloudPoint from "./Models/CloudPoint";
import PointCloud from "./Models/PointCloud";

class PointScene {
    private _scene: THREE.Scene = new THREE.Scene();
    
    private _pointCloud: PointCloud;
    private _pointsMaterial: THREE.PointsMaterial;;
    private _points?: THREE.Points = null;
    
    private _isDirty: boolean = false;

    constructor(pointColor: string, pointSize: number, sceneWidth: number, sceneHeight: number, sceneDepth: number) {
        this._pointsMaterial = new THREE.PointsMaterial({ 
            color:new THREE.Color(pointColor), 
            size: pointSize 
        });
        this._pointCloud = new PointCloud(sceneWidth, sceneHeight, sceneDepth);

        this._scene = new THREE.Scene();
    }

    public get IsDirty() {
        return this._isDirty;
    }

    public set IsDirty(dirty: boolean) {
        this._isDirty = dirty;
    }

    public GetScene(): THREE.Scene {
        return this._scene;
    }

    public UpdateCloud(cloudPoints: Array<CloudPoint>, apply: boolean): void {
        if (apply) this._pointCloud.LoadCloud(cloudPoints, false);
        //else this._pointCloud.StoreAwaitingProcessing(cloudPoints);
    }

    public Add(element: any): void {
        this._scene.add(element);
    }

    public Update(): void {
        if (this._pointCloud.IsDirty) {
            this._pointCloud.GetPointsVerticies().then((vertices) => {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3 ) );
    
                if (this._points) {
                    this._points.geometry.dispose();
                    this._points.geometry = geometry;
                }
                else {
                    this._points = new THREE.Points(geometry, this._pointsMaterial);
                    this._scene.add(this._points);
                }
    
                this._pointCloud.IsDirty = false;
    
                this.IsDirty = true;
            });
        }
    }
}

export { PointScene } 