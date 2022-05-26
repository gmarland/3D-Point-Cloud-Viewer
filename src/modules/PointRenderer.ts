import { WebGLRenderer, Color } from 'three';
import { PointScene } from './PointScene';
import { PointCamera } from './PointCamera';

class PointRenderer {
    private _scene: PointScene;
    private _camera: PointCamera;

    private _renderer: WebGLRenderer;

    private _rendering: boolean = false;
    private _keepRendering: boolean = false;

    private _width: number;
    private _height: number;

    constructor(scene: PointScene, camera: PointCamera, width: number, height: number, backgroundColor: string) {
        this._scene = scene;
        this._camera = camera;

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

        this._scene.Update();

        console.log("Time to update: " + (Date.now() - updateTime));

        if (this._scene.IsDirty) {
            let startTime = Date.now();

            this._renderer.render(this._scene.GetScene(), this._camera.GetCamera());

            console.log("Time to render: " + (Date.now() - startTime));

            this._scene.IsDirty = false;
        }

		requestAnimationFrame(() => 
        {
            if (this._keepRendering) this.Render()
        });
    }
}

export { PointRenderer }