import * as THREE from "three";
import CloudPoint from "./Models/CloudPoint";
import PointCloud from "./Models/PointCloud";
import { CloudDimensions } from "./Models/CloudDimensions";

class PointScene {
    private _scene: THREE.Scene = new THREE.Scene();
    
    private _pointsMaterial: THREE.PointsMaterial;

    private _pointClouds: Array<PointCloud> = new Array<PointCloud>();
    private _points?: Array<THREE.Points> = new Array<THREE.Points>();

    constructor(pointColor: string, pointSize: number) {
        this._pointsMaterial = new THREE.PointsMaterial({ 
            color:new THREE.Color(pointColor), 
            size: pointSize 
        });

        this._pointClouds = new Array<PointCloud>();

        this._scene = new THREE.Scene();
    }

    public GetScene(): THREE.Scene {
        return this._scene;
    }

    public UpdateCloud(cloudPoints: Array<Array<CloudPoint>>, cloudDimensions: CloudDimensions): Promise<void> {
        return new Promise((resolve) => {
            if (this._pointClouds.length < cloudPoints.length) {
                const difference = cloudPoints.length-this._pointClouds.length;

                for (let i=0; i< difference; i++) {
                    this._pointClouds.push(new PointCloud());
                }
            }
            else {

            }

            const loads = [];

            for (let i=0; i<this._pointClouds.length; i++) {
                loads.push(this._pointClouds[i].LoadCloud(cloudPoints[i], cloudDimensions));
            }

            Promise.all(loads).then(() => {
                this.Update().then(() => {
                    resolve();
                });
            });
        });
    }

    public Add(element: any): void {
        this._scene.add(element);
    }

    private Update(): Promise<void> {
        return new Promise((resolve) => {
            for (let i=0; i<this._pointClouds.length; i++) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(this._pointClouds[i].verticies, 3 ) );

                const points = new THREE.Points(geometry, this._pointsMaterial)

                this._points.push(points);
                this._scene.add(points);
            }

            resolve();
        });

        /*
        return new Promise((resolve) => {
            if (this._points) {
                this._points.geometry.setAttribute('position', new THREE.BufferAttribute(this._pointCloud.verticies, 3 ) );
                this._points.geometry.attributes.position.needsUpdate = true;
            }
            else {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(this._pointCloud.verticies, 3 ) );
    
                this._points = new THREE.Points(geometry, this._pointsMaterial);
                this._scene.add(this._points);
            }

            resolve();
        });*/
    }
}

export { PointScene } 