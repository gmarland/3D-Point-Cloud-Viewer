import { WebGLRenderer, Color } from 'three';
import { PointScene } from './PointScene';
import { PointCamera } from './PointCamera';
import { Logging } from './Logging';
import { FirstPersonControls } from './FirstPersonControls';

class PointRenderer {
    private _scene: PointScene;
    private _camera: PointCamera;

    private _controls?: FirstPersonControls;

    private _renderer: WebGLRenderer;

    private _rendering: boolean = false;
    private _keepRendering: boolean = false;

    private _width: number;
    private _height: number;

    constructor(scene: PointScene, camera: PointCamera, controls: FirstPersonControls, width: number, height: number, backgroundColor: string) {
        this._scene = scene;
        this._camera = camera;

        this._controls = controls;

        this._renderer = new WebGLRenderer();

        this.SetSize(width, height);
        this.SetColor(backgroundColor);
    }

    public GetDOMElement(): HTMLCanvasElement {
        return this._renderer.domElement;
    }

    public SetSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        
        this._renderer.setSize( this._width, this._height );
    }

    public SetColor(color: string): void {
        this._renderer.setClearColor(new Color(color));
    }

    public StartRendering() {
        this._keepRendering = true;

        if (!this._rendering) {
            this._rendering = true;
            
            this.Render();
        }
    }

    public StopRendering() {
        this._keepRendering = true;
    }

    private Render(): void {
        let updateTime = Date.now();

        Logging.Log("Starting render: " + new Date());

        let render = false;

        if ((this._controls) && (this._controls.UpdatePosition)) {
            this._controls.Update();
            render = true;
        }
        
        this._scene.Update();

        if (this._scene.IsDirty) {
            render = true;
        }

        Logging.Log("Time to update: " + (Date.now() - updateTime));

        if (render) {
            let startTime = Date.now();

            this._renderer.render(this._scene.GetScene(), this._camera.GetCamera());

            Logging.Log("Time to render: " + (Date.now() - startTime));

            this._scene.IsDirty = false;
        }

		requestAnimationFrame(() => 
        {
            if (this._keepRendering) this.Render()
        });
    }
}

export { PointRenderer }