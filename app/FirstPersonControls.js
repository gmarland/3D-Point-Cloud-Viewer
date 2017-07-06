THREE.FirstPersonControls = function (scene, camera, maxDistance, domElement) {
	this._movementSpeed = 10;

    this._scene = scene;

    this._sceneNeedsRendering = false;
    this._keepRenderingScene = false;

	this._camera = camera;
    this._camera.rotation.y += 3.14159;

	this._maxDistance = maxDistance;	

	this._domElement = domElement;

	this._pitchObject = new THREE.Object3D();
	this._pitchObject.add(this._camera);

	this._yawObject = new THREE.Object3D();
	this._yawObject.add( this._pitchObject );

	this._scene.add(this._yawObject);

	this.onMouseDown = function ( event ) {
		if (this.getIsLeftMouseButton(event)) this.moveCamera = true;
	};

	this.onMouseUp = function ( event ) {
		if (this.getIsLeftMouseButton(event)) this.moveCamera = false;
	};

    this.getIsMiddleMouseButton = function(event) {
        event = event || window.event;

        var button = event.which || event.button;

        return button == 2;
    }

    this.getIsLeftMouseButton = function(event) {
        event = event || window.event;

        var button = event.which || event.button;

        return button == 1;
    };

    this.getIsRightMouseButton = function(event) {
        event = event || window.event;

        var button = event.which || event.button;

        return button == 3;
    };

	this.onMouseMove = function ( event ) {
		if (this.moveCamera) {
			var PI_2 = Math.PI / 2;

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0,
				movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			this._yawObject.rotation.y -= movementX * 0.004;
			this._pitchObject.rotation.x += movementY * 0.004;

            this._sceneNeedsRendering = true;
		}
	};

	this.onTouchStart = function ( e ) {
        if (e.touches.length == 1) {
            this.touchStartPosition = e.touches[0];
        }
	};
	
	this.onTouchMove = function ( e ) {
       	var distX = this.touchStartPosition.pageX - e.touches[0].pageX,
       		distY = this.touchStartPosition.pageY - e.touches[0].pageY;

		this._yawObject.rotation.y -= distX * 0.004;
		this._pitchObject.rotation.x -= distY * 0.004;
		
        this.touchStartPosition = e.touches[0];
	};
	
	this.onTouchEnd = function ( e ) {
            this.touchStartPosition = null;
	};	

	this.onKeyDown = function ( event ) {
		switch ( event.keyCode ) {

			case 87: /*W*/ this.moveForward = true; break;

			case 65: /*A*/ this.moveLeft = true; break;

			case 83: /*S*/ this.moveBackward = true; break;

			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.rotateLeft = true; break;
			case 69: /*E*/ this.rotateRight = true; break;

			case 90: /*C*/ this.rotateDown = true; break;
			case 88: /*X*/ this.rotateUp = true; break;
		}

        this._sceneNeedsRendering = true;
        this._keepRenderingScene = true;
	};

	this.onKeyUp = function ( event ) {
		var movementCancelled = false;

		switch ( event.keyCode ) {
			case 87: /*W*/ 
				this.moveForward = false; 
				movementCancelled = true; 
				break;
			case 65: /*A*/ 
				this.moveLeft = false; 
				movementCancelled = true; 
				break;
			case 83: /*S*/ 
				this.moveBackward = false;
				movementCancelled = true;
				break;
			case 68: /*D*/ 
				this.moveRight = false; 
				movementCancelled = true;
				break;
			case 82: /*R*/ 
				this.moveUp = false; 
				movementCancelled = true;
				break;
			case 70: /*F*/ 
				this.moveDown = false; 
				movementCancelled = true;
				break;
			case 81: /*Q*/ 
				this.rotateLeft = false; 
				movementCancelled = true;
				break;
			case 69: /*E*/ 
				this.rotateRight = false; 
				movementCancelled = true;
				break;
			case 90: /*C*/ 
				this.rotateDown = false; 
				movementCancelled = true;
				break;
			case 88: /*X*/ 
				this.rotateUp = false; 
				movementCancelled = true;
				break;
		}

        if (movementCancelled) {
            this._sceneNeedsRendering = false;
            this._keepRenderingScene = false;
        }
	};

	this.setCameraPosition = function(x, y, z) {
		this._yawObject.position.x = x;
		this._yawObject.position.y = y;
		this._yawObject.position.z = z;

        this._sceneNeedsRendering = true;
	};

	this.getCameraPosition = function() {
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
	};

    this.setCameraLookAt = function (x, y, z) {
        // Create a dummy object and position it to where the current yaw object is.
        var dupYawObject = new THREE.Object3D();
        dupYawObject.position.x = this._yawObject.position.x;
        dupYawObject.position.y = this._yawObject.position.y;
        dupYawObject.position.z = this._yawObject.position.z;

        dupYawObject.rotation.order = "YXZ";

        // Make our dummy object look at our target. This will give us the y rotation we need for the real yaw object
        dupYawObject.lookAt(new THREE.Vector3(x, y, z));

        // Apply the rotations to the pitch and yaw objects the camera is associated to
        this._yawObject.rotation.y = (dupYawObject.rotation.y % 6.28319);

        // This part is complex. Basically, if we rotate more than 180 on the x axis we will end up looking at the scene upside down.
        // In order to combat this we instead rotate on the x axis to wehere it would be on the oposite side and then we spin on the y axis 180 degrees.
        // This gets us to the right looking position but not on our heads. I high fived myself repeatedly after figuring out this code :)
        var xRotation = dupYawObject.rotation.x % 6.28319;

        if (xRotation < 0) xRotation = (3.14159 - (xRotation * -1));

        if (xRotation >= 1.5708) this._pitchObject.rotation.x = (3.14159 - xRotation);
        else this._pitchObject.rotation.x = xRotation;

        this._sceneNeedsRendering = true;
    };

	this.update = function( delta ) {
        // Actions to move the camera via keyboard commands
        if (this.moveForward) this._yawObject.translateZ(this._movementSpeed);
        if (this.moveBackward) this._yawObject.translateZ(-this._movementSpeed);
        if (this.moveLeft) this._yawObject.translateX(this._movementSpeed);
        if (this.moveRight) this._yawObject.translateX(-this._movementSpeed);
        if (this.moveUp) this._yawObject.translateY(this._movementSpeed);
        if (this.moveDown) this._yawObject.translateY(-this._movementSpeed);
		if (this.rotateLeft) this._yawObject.rotation.y += 0.04;
		if (this.rotateRight) this._yawObject.rotation.y -= 0.04;
		if (this.rotateUp) this._pitchObject.rotation.x -= 0.04;
		if (this.rotateDown) this._pitchObject.rotation.x += 0.04;
	};

    this.renderScene = function () {
        if (this._sceneNeedsRendering) {
            if (!this._keepRenderingScene) this._sceneNeedsRendering = false;

            return true;
        }
        else return false;
    };

    this.setSceneNeedsRendering = function () {
        this._sceneNeedsRendering = true;
    };

	this.cancelMovement = function() {
		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.rotateLeft = false;
		this.rotateRight = false;
		this.rotateUp = false;
		this.rotateDown = false;
	};

	var _onMouseMove = bind( this, this.onMouseMove );
	var _onMouseDown = bind( this, this.onMouseDown );
	var _onMouseUp = bind( this, this.onMouseUp );

	var _onTouchStart = bind( this, this.onTouchStart );
	var _onTouchMove = bind( this, this.onTouchMove );
	var _onTouchEnd = bind( this, this.onTouchEnd );

	var _onKeyDown = bind( this, this.onKeyDown );
	var _onKeyUp = bind( this, this.onKeyUp );

	this._domElement.addEventListener( 'mousemove', _onMouseMove, false );
	this._domElement.addEventListener( 'mousedown', _onMouseDown, false );
	this._domElement.addEventListener( 'mouseup', _onMouseUp, false );
	this._domElement.addEventListener( 'mouseleave',_onMouseUp, false );

    this._domElement.addEventListener("touchstart", _onTouchStart, false );
    this._domElement.addEventListener( "touchmove", _onTouchMove, false );
    this._domElement.addEventListener( "touchend", _onTouchEnd, false );
    this._domElement.addEventListener( "touchcancel", _onTouchEnd, false );

	document.addEventListener( 'keydown', _onKeyDown, false );
	document.addEventListener( 'keyup', _onKeyUp, false );

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};