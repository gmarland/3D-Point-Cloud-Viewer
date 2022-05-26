import { Raycaster, Vector2 } from 'three';
import CloudPoint from './Models/CloudPoint';
import { PointCamera } from "./PointCamera";
import { PointRenderer } from "./PointRenderer";
import { PointScene } from "./PointScene";

class CloudViewer {
    private _container: HTMLDivElement;

    private _scene: PointScene; 
    private _camera: PointCamera;
    private _renderer: PointRenderer;

    constructor(container: HTMLDivElement, backgroundColor: string, pointColor: string, pointSize: number, sceneWidth: number, sceneHeight: number, sceneDepth: number) {
        this._container = container;

        this._scene = new PointScene(pointColor, pointSize, sceneWidth, sceneHeight, sceneDepth);

        this._camera = new PointCamera(this._container.clientWidth, this._container.clientHeight);

        this._renderer = new PointRenderer(this._scene, this._camera, this._container.clientWidth, this._container.clientHeight, backgroundColor);
        
        container.appendChild(this._renderer.GetDOMElement());

        this._renderer.GetDOMElement().onclick = (ev: MouseEvent) => {
            this.ScreenClicked(ev);
        }

        this._renderer.StartRendering();
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

    public UpdateCloud(cloudPoints: Array<CloudPoint>): void {
        if (this._scene) {
            this._scene.UpdateCloud(cloudPoints);
        }
    }
}

export { CloudViewer }