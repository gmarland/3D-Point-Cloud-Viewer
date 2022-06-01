import { WebGLRenderer } from 'three';
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

    public StartRendering(scene: PointScene) {
        this._keepRendering = true;

        if (!this._rendering) {
            this._rendering = true;
            
            this.Render(scene);
        }
    }

    public StopRendering() {
        this._keepRendering = false;
        this._rendering = false;
    }

    private Render(scene: PointScene): void {
        let render = false;

        if ((this._controls) && (this._controls.UpdatePosition)) {
            let controlsTime = Date.now();

            this._controls.Update();

            Logging.log("Time to move: " + (Date.now() - controlsTime));

            render = true;
        }
        
        new Promise<void>((resolve) => {
            let renderScene = render;
    
            if (scene.IsDirty) renderScene = true;
    
            if (renderScene) {
                let startTime = Date.now();
    
                this._renderer.render(scene.GetScene(), this._camera.GetCamera());
    
                Logging.log("Time to render: " + (Date.now() - startTime));
    
                scene.IsDirty = false;
            }

            resolve();
        }).then(() => {
            requestAnimationFrame(() => 
            {
                if (this._keepRendering) this.Render(scene);
            });
        });
    }
}

export { PointRenderer }