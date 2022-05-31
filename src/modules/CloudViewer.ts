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

    private _scene: PointScene;
    
    private _camera: PointCamera;

    private _controls: FirstPersonControls;

    private _renderer: PointRenderer;

    private _maxPointCloud: number = 200000;

    constructor(container: HTMLDivElement, pointColor: string, pointSize: number) {
        this._container = container;

        this._pointColor = pointColor;
        this._pointSize = pointSize;
        
        this._camera = new PointCamera(this._container.clientWidth, this._container.clientHeight);

        this._controls = new FirstPersonControls(this._camera);
        this._controls.BindEvents(container);

        this._scene = new PointScene(this._pointColor, this._pointSize);
        this._controls.AddToScene(this._scene);

        this._renderer = new PointRenderer(this._camera, this._controls, this._container.clientWidth, this._container.clientHeight);

        container.appendChild(this._renderer.GetDOMElement());

        this._renderer.GetDOMElement().onclick = (ev: MouseEvent) => {
            this.ScreenClicked(ev);
        }

        this._renderer.StartRendering(this._scene);
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

    public UpdateCloud(cloudPoints: Array<CloudPoint>, cloudDimensions: CloudDimensions): Promise<void> {
        return new Promise((resolve) => {
            const sceneCount = Math.ceil(cloudPoints.length/this._maxPointCloud);
            
            const cloudSections = Array<Array<CloudPoint>>();

            for (let i=0; i<sceneCount; i++) {
                if ((i*this._maxPointCloud) < cloudPoints.length) cloudSections.push(cloudPoints.slice(i*this._maxPointCloud, (i+1)*this._maxPointCloud));
                else cloudSections.push(cloudPoints.slice(i*this._maxPointCloud, cloudPoints.length));
            }
            
            this._scene.UpdateCloud(cloudSections, cloudDimensions);

            resolve();
        });
    }
}

export { CloudViewer }