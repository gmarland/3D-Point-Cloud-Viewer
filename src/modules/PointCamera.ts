import { PerspectiveCamera } from 'three';

class PointCamera {
    private _camera: PerspectiveCamera;

    private _sceneHeight: number;
    private _sceneWidth: number;

    constructor(sceneWidth: number, sceneHeight: number) {
        this._sceneWidth = sceneWidth;
        this._sceneHeight = sceneHeight;

        this._camera = new PerspectiveCamera(75, this._sceneWidth / this._sceneHeight, 0.1, 1000 );
        this._camera.position.z = 5;
    }

    public GetCamera(): PerspectiveCamera {
        return this._camera;
    }

	public SetAspectRatio(width: number, height: number): void {
		this._camera.aspect = width / height;

		this._camera.updateProjectionMatrix();
	}
}

export { PointCamera }