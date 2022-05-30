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

    constructor(camera: PointCamera, controls: FirstPersonControls, width: number, height: number) {
        this._camera = camera;

        this._controls = controls;

        this._renderer = new WebGLRenderer({
            alpha: true
        });

        this._renderer.setClearColor( 0x000000, 0 );

        this.SetSize(width, height);
    }

    public GetDOMElement(): HTMLCanvasElement {
        return this._renderer.domElement;
    }

    public SetSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        
        this._renderer.setSize( this._width, this._height );
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

            this._renderer.autoClear = false;

            let renderPromises = [];

            for (let i=0; i<scenes.length; i++) {
                renderPromises.push(new Promise<void>((resolve) => {
                    this.RenderScene(render, scenes[i]);
                    
                    resolve();
                }));
            }

            Promise.all(renderPromises).then(() => {
                requestAnimationFrame(() => 
                {
                    if (this._keepRendering) this.Render(scenes);
                });
            });
        }
        else {
            requestAnimationFrame(() => 
            {
                if (this._keepRendering) this.Render(scenes);
            });
        }
    }

    private RenderScene(render: boolean, scene: PointScene): void {
        let renderScene = render;

        scene.Update();

        if (scene.IsDirty) {
            renderScene = true;
        }

        if (renderScene) {
            let startTime = Date.now();

            this._renderer.render(scene.GetScene(), this._camera.GetCamera());

            Logging.Log("Time to render: " + (Date.now() - startTime));

            this._renderer.autoClear = false;

            scene.IsDirty = false;
        }
    }
}

export { PointRenderer }