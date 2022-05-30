import { WebGLRenderer, Color } from 'three';
import { PointScene } from './PointScene';
import { PointCamera } from './PointCamera';
import { Logging } from './Logging';
import { FirstPersonControls } from './FirstPersonControls';

class PointRenderer {
    private _camera: PointCamera;

    private _controls?: FirstPersonControls;

    private _renderer: WebGLRenderer;

    private _rendering: boolean = false;
    private _keepRendering: boolean = false;

    private _width: number;
    private _height: number;

    constructor(camera: PointCamera, controls: FirstPersonControls, width: number, height: number, backgroundColor: string) {
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
        //this._renderer.setClearColor(new Color(color));
    }

    public StartRendering(scenes: Array<PointScene>) {
        this._keepRendering = true;

        if (!this._rendering) {
            this._rendering = true;
            
            this.Render(scenes);
        }
    }

    public StopRendering() {
        this._keepRendering = true;
    }

    private Render(scenes: Array<PointScene>): void {
        let updateTime = Date.now();

        Logging.Log("Starting render: " + new Date());

        let render = false;

        if ((this._controls) && (this._controls.UpdatePosition)) {
            this._controls.Update();
            render = true;
        }
        
        if (scenes.length > 0) {
            this._renderer.autoClear = true;
            
            for (let i=0; i<scenes.length; i++) {
                scenes[i].Update();

                if (scenes[i].IsDirty) {
                    render = true;
                }

                Logging.Log("Time to update: " + (Date.now() - updateTime));

                if (render) {
                    console.log("here")
                    let startTime = Date.now();

                    this._renderer.render(scenes[i].GetScene(), this._camera.GetCamera());

                    Logging.Log("Time to render: " + (Date.now() - startTime));

                    this._renderer.autoClear = false;

                    scenes[i].IsDirty = false;
                }
            }
        }

		requestAnimationFrame(() => 
        {
            if (this._keepRendering) this.Render(scenes);
        });
    }
}

export { PointRenderer }