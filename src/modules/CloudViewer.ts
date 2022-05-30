import { Raycaster, Vector2 } from 'three';
import { FirstPersonControls } from './FirstPersonControls';
import { CloudDimensions } from './Models/CloudDimensions';
import CloudPoint from './Models/CloudPoint';
import { PointCamera } from "./PointCamera";
import { PointRenderer } from "./PointRenderer";
import { PointScene } from "./PointScene";

class CloudViewer {
    private _container: HTMLDivElement;

    private _pointColor: string;
    private _pointSize: number;

    private _scenes: Array<PointScene> = new Array<PointScene>(); 
    
    private _camera: PointCamera;

    private _controls: FirstPersonControls;

    private _renderer: PointRenderer;

    private _maxPointCloud: number = 200000;

    constructor(container: HTMLDivElement, backgroundColor: string, pointColor: string, pointSize: number) {
        this._container = container;

        this._pointColor = pointColor;
        this._pointSize = pointSize;

        this._scenes = new Array<PointScene>();

        this._camera = new PointCamera(this._container.clientWidth, this._container.clientHeight);

        this._controls = new FirstPersonControls(this._camera);
        this._controls.BindEvents(container);

        this._renderer = new PointRenderer(this._camera, this._controls, this._container.clientWidth, this._container.clientHeight, backgroundColor);

        container.appendChild(this._renderer.GetDOMElement());

        this._renderer.GetDOMElement().onclick = (ev: MouseEvent) => {
            this.ScreenClicked(ev);
        }

        this._renderer.StartRendering(this._scenes);
    }

    private ScreenClicked(ev: MouseEvent): void {
        const raycaster = new Raycaster();
        raycaster.setFromCamera(this.GetMousePosition(ev), this._camera.GetCamera());
    }
    
    public Resize(): void {
        this._renderer.SetSize(this._container.clientWidth, this._container.clientHeight);
        this._camera.SetAspectRatio(this._container.clientWidth, this._container.clientHeight);
    }

    private GetMousePosition(ev: MouseEvent): Vector2 {
        const mousePosition = new Vector2();
        mousePosition.set((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1);

        return mousePosition;
    }

    public UpdateCloud(cloudPoints: Array<CloudPoint>, cloudDimensions: CloudDimensions): void {
        const sceneCount = Math.ceil(cloudPoints.length/this._maxPointCloud);
        
        if (this._scenes.length !== sceneCount) {
            if (this._scenes.length > sceneCount) {
                const scenesToRemove = this._scenes.length-sceneCount;

                for (let i=0; i<scenesToRemove; i++) {
                    this._scenes.splice(this._scenes.length-1);
                }
            }
            else {
                const scenesToAdd = sceneCount-this._scenes.length;

                for (let i=0; i<scenesToAdd; i++) {
                    const newScene = new PointScene(this._pointColor, this._pointSize);

                    this._scenes.push(newScene);
                    this._controls.AddToScene(newScene);
                }
            }
        }

        for (let i=0; i<sceneCount; i++) {
            if ((i*this._maxPointCloud) < cloudPoints.length) this._scenes[i].UpdateCloud(cloudPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud), cloudDimensions, !this._controls.UpdatePosition);
            else this._scenes[i].UpdateCloud(cloudPoints.slice(i*this._maxPointCloud, cloudPoints.length), cloudDimensions, !this._controls.UpdatePosition);
        }
    }
}

export { CloudViewer }