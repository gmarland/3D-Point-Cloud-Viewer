import { Object3D, Vector3 } from 'three';
import { PointCamera } from './PointCamera';
import { PointScene } from './PointScene';

class FirstPersonControls {
    private _movementSpeed: number = 0.25;

    private _camera: PointCamera;

    private _pitchObject: Object3D;
    private _yawObject: Object3D;

    private _moveCameraWithMouse: boolean;

    private _touchStartPosition; 
    
    private _moveForward: boolean = false;
    private _moveBackward: boolean = false;
    private _moveLeft: boolean = false;
    private _moveRight: boolean = false;
    private _moveUp: boolean = false;
    private _moveDown: boolean = false;
    private _rotateLeft: boolean = false;
    private _rotateRight: boolean = false;
    private _rotateUp: boolean = false;
    private _rotateDown: boolean = false;

    private _updatePosition: boolean = false;
    private _keepUpdatingPosition: boolean = false;

    constructor(camera: PointCamera) {
        this._camera = camera;
    
        this._camera = camera;
        this._camera.IncreaseYRotation(3.14159);
    
        this._pitchObject = new Object3D();
        this._pitchObject.add(this._camera.GetCamera());
    
        this._yawObject = new Object3D();
        this._yawObject.add(this._pitchObject);
    }

    public get UpdatePosition() {
        return this._updatePosition;
    }

    public set UpdatePosition(updatePosition: boolean) {
        this._updatePosition = updatePosition;
    }

	AddToScene(scene: PointScene) {
		scene.Add(this._yawObject);
	}

	OnMouseDown(event: MouseEvent): void {
		if (this.GetIsLeftMouseButton(event)) this._moveCameraWithMouse = true;
	}

	OnMouseUp(event: MouseEvent): void {
		if (this.GetIsLeftMouseButton(event)) this._moveCameraWithMouse = false;
	}

    GetIsLeftMouseButton(event: MouseEvent): boolean {
        return event.button == 1;
    }

    GetIsMiddleMouseButton(event: MouseEvent): boolean {
        return event.button == 2;
    }

    GetIsRightMouseButton(event: MouseEvent): boolean {
        return event.button == 3;
    }

	OnMouseMove(event: MouseEvent): void {
		if (this._moveCameraWithMouse) {
			this._yawObject.rotation.y -= event.movementX * 0.004;
			this._pitchObject.rotation.x += event.movementY * 0.004;

            this._updatePosition = true;
		}
	}

	OnTouchStart(event): void {
        if (event.touches.length == 1) {
            this._touchStartPosition = event.touches[0];
        }
	}
	
	OnTouchMove(event): void {
       	let distX = this._touchStartPosition.pageX - event.touches[0].pageX,
       		distY = this._touchStartPosition.pageY - event.touches[0].pageY;

		this._yawObject.rotation.y -= distX * 0.004;
		this._pitchObject.rotation.x -= distY * 0.004;
		
        this._touchStartPosition = event.touches[0];

        this._updatePosition = true;
	}
	
	OnTouchEnd(): void {
        this._touchStartPosition = null;
	}	

	OnKeyDown(event: KeyboardEvent): void {
		switch ( event.keyCode ) {

			case 87: /*W*/ this._moveForward = true; break;

			case 65: /*A*/ this._moveLeft = true; break;

			case 83: /*S*/ this._moveBackward = true; break;

			case 68: /*D*/ this._moveRight = true; break;

			case 82: /*R*/ this._moveUp = true; break;
			case 70: /*F*/ this._moveDown = true; break;

			case 81: /*Q*/ this._rotateLeft = true; break;
			case 69: /*E*/ this._rotateRight = true; break;

			case 90: /*C*/ this._rotateDown = true; break;
			case 88: /*X*/ this._rotateUp = true; break;
		}

        this._updatePosition = true;
        this._keepUpdatingPosition = true;
	}

	OnKeyUp(event: KeyboardEvent): void {
		switch ( event.keyCode ) {
			case 87: /*W*/ 
				this._moveForward = false; 
				break;
			case 65: /*A*/ 
				this._moveLeft = false; 
				break;
			case 83: /*S*/ 
				this._moveBackward = false;
				break;
			case 68: /*D*/ 
				this._moveRight = false;
				break;
			case 82: /*R*/ 
				this._moveUp = false; 
				break;
			case 70: /*F*/ 
				this._moveDown = false; 
				break;
			case 81: /*Q*/ 
				this._rotateLeft = false; 
				break;
			case 69: /*E*/ 
				this._rotateRight = false; 
				break;
			case 90: /*C*/ 
				this._rotateDown = false; 
				break;
			case 88: /*X*/ 
				this._rotateUp = false; 
				break;
		}

        this._keepUpdatingPosition = false;
	}

	SetCameraPosition(x: number, y: number, z: number): void {
		this._yawObject.position.x = x;
		this._yawObject.position.y = y;
		this._yawObject.position.z = z;

        this._updatePosition = true;
	}

	GetCameraPosition(): object {
		return {
			position: {
				x: this._yawObject.position.x,
				y: this._yawObject.position.y,
				z:this._yawObject.position.z
			},
			rotation: {
				x: this._yawObject.rotation.y,
				y: this._pitchObject.rotation.x
			}
		}
	}

    SetCameraLookAt(x: number, y: number, z: number): void {
        // Create a dummy object and position it to where the current yaw object is.
        let dupYawObject = new Object3D();
        dupYawObject.position.x = this._yawObject.position.x;
        dupYawObject.position.y = this._yawObject.position.y;
        dupYawObject.position.z = this._yawObject.position.z;

        dupYawObject.rotation.order = "YXZ";

        // Make our dummy object look at our target. This will give us the y rotation we need for the real yaw object
        dupYawObject.lookAt(new Vector3(x, y, z));

        // Apply the rotations to the pitch and yaw objects the camera is associated to
        this._yawObject.rotation.y = (dupYawObject.rotation.y % 6.28319);

        // This part is complex. Basically, if we rotate more than 180 on the x axis we will end up looking at the scene upside down.
        // In order to combat this we instead rotate on the x axis to wehere it would be on the oposite side and then we spin on the y axis 180 degrees.
        // This gets us to the right looking position but not on our heads. I high fived myself repeatedly after figuring out this code :)
        let xRotation = dupYawObject.rotation.x % 6.28319;

        if (xRotation < 0) xRotation = (3.14159 - (xRotation * -1));

        if (xRotation >= 1.5708) this._pitchObject.rotation.x = (3.14159 - xRotation);
        else this._pitchObject.rotation.x = xRotation;

        this._updatePosition = true;
    }

	Update(): void {
        // Actions to move the camera via keyboard commands
        if (this._moveForward) this._yawObject.translateZ(this._movementSpeed);
        if (this._moveBackward) this._yawObject.translateZ(-this._movementSpeed);
        if (this._moveLeft) this._yawObject.translateX(this._movementSpeed);
        if (this._moveRight) this._yawObject.translateX(-this._movementSpeed);
        if (this._moveUp) this._yawObject.translateY(this._movementSpeed);
        if (this._moveDown) this._yawObject.translateY(-this._movementSpeed);
		if (this._rotateLeft) this._yawObject.rotation.y += 0.04;
		if (this._rotateRight) this._yawObject.rotation.y -= 0.04;
		if (this._rotateUp) this._pitchObject.rotation.x -= 0.04;
		if (this._rotateDown) this._pitchObject.rotation.x += 0.04;

        if (!this._keepUpdatingPosition) this._updatePosition = false;
	}

	CancelMovement(): void {
		this._moveForward = false;
		this._moveBackward = false;
		this._moveLeft = false;
		this._moveRight = false;
		this._moveUp = false;
		this._moveDown = false;
		this._rotateLeft = false;
		this._rotateRight = false;
		this._rotateUp = false;
		this._rotateDown = false;
	}

    BindEvents(domElement: HTMLDivElement): void {
        let _onMouseMove = this.Bind( this, this.OnMouseMove );
        let _onMouseDown = this.Bind( this, this.OnMouseDown );
        let _onMouseUp = this.Bind( this, this.OnMouseUp );
    
        let _onTouchStart = this.Bind( this, this.OnTouchStart );
        let _onTouchMove = this.Bind( this, this.OnTouchMove );
        let _onTouchEnd = this.Bind( this, this.OnTouchEnd );
    
        let _onKeyDown = this.Bind( this, this.OnKeyDown );
        let _onKeyUp = this.Bind( this, this.OnKeyUp );
    
        domElement.addEventListener( 'mousemove', _onMouseMove, false );
        domElement.addEventListener( 'mousedown', _onMouseDown, false );
        domElement.addEventListener( 'mouseup', _onMouseUp, false );
        domElement.addEventListener( 'mouseleave',_onMouseUp, false );
    
        domElement.addEventListener("touchstart", _onTouchStart, false );
        domElement.addEventListener( "touchmove", _onTouchMove, false );
        domElement.addEventListener( "touchend", _onTouchEnd, false );
        domElement.addEventListener( "touchcancel", _onTouchEnd, false );
    
        document.addEventListener( 'keydown', _onKeyDown, false );
        document.addEventListener( 'keyup', _onKeyUp, false );   
    }

	Bind(scope: FirstPersonControls, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
}

export { FirstPersonControls }