(function () {
    var PointCloudScene = function() {
    	// ----- Private Properties

    	var that = this;

        this._clock = null;

    	this._containerElement = null;
    	this._containerWidth = null;
    	this._containerHeight = null;

    	this._scene = null;

		this._raycaster = null;
		this._mouse = null;

    	this._camera = null;
        this._controls = null;

    	this._renderer = null;

        this._skyboxColor = 0xefefef;
        this._skyboxOpacity = 1;

        this._chuncksAdded = 0;
        this._chuncksProcessed = 0;

        this._startingMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: THREE.VertexColors
        });

        this._pointCloud = null;

        this._currentPoint = 0;

        // ----- Constructor

    	this.init = function(container, ready) {
            that._clock = new THREE.Clock();

			that._containerElement = document.getElementById(container);
            that._containerWidth = document.body.clientWidth;
            that._containerHeight = document.body.clientHeight;

            that._scene = new THREE.Scene();

			that._raycaster = new THREE.Raycaster();
			that._mouse = new THREE.Vector2();

            that._camera = that.getCamera(that._containerWidth, that._containerHeight);
            that._scene.add(that._camera);

            that._renderer = that.getRenderer(that._containerWidth, that._containerHeight, that._skyboxColor, that._skyboxOpacity);
            that._containerElement.appendChild(that._renderer.domElement);

            that._controls = that.getControls(that._scene, that._camera, that._renderer.domElement);

            that.render();

            that.bindWindowEvents();

            if (ready) ready(that);
    	};

        // ----- Scene methods

        this.getCamera = function(containerWidth, containerHeight) {
        	var fov = 75,
        		aspect = (containerWidth/containerHeight),
        		far = 1000;

            return new THREE.PerspectiveCamera(fov, aspect, 0.1, far);
        };

       	this.getControls = function(scene, camera, domElement) {
			return new THREE.FirstPersonControls(scene, camera, (that._basePlaneWidth*1.5), domElement);
       	};

        // ----- Rendering functions

        this.getRenderer = function(containerWidth, containerHeight, skyboxColor, skyboxOpacity) {
            var renderer = new THREE.WebGLRenderer();
            renderer.setSize(containerWidth, containerHeight);
            renderer.setClearColor(skyboxColor, skyboxOpacity);

            return renderer;
        };

        this.render = function() {
            function renderScene() {
                setTimeout( function() {
                    requestAnimationFrame( renderScene );
                    
                }, 1000 / 30 );

                if (that._controls.renderScene()) {
                    that._controls.update(that._clock.getDelta());

                    that._renderer.render(that._scene, that._camera);
                }
            };

            renderScene();
        };

        // ----- Mouse binding events

        this.bindWindowEvents = function() {
			window.addEventListener('resize', function(e) {
	            that._containerWidth = document.body.clientWidth;
	            that._containerHeight = document.body.clientHeight;

			    that._camera.aspect = (that._containerWidth / that._containerHeight);
			    that._camera.updateProjectionMatrix();

				that._renderer.setSize(that._containerWidth, that._containerHeight);
			}, false );

			that._containerElement.addEventListener('mousedown', that.mouseDown, false);

			that._containerElement.addEventListener('mouseup', that.mouseUp, false);
        };

        this.degToRad = function(degrees) {
          return degrees * Math.PI / 180;
        };

        this.initializeCloud = function(size) {
            if (!that._pointCloud) {
                var positions = new Float32Array( size * 3 ); 
                var colors = new Float32Array( size * 3 ); 
                
                var geometry = new THREE.BufferGeometry();
                geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
                geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

                that._pointCloud = new THREE.Points(geometry, that._startingMaterial);

                if (that._controls) that._controls.setSceneNeedsRendering();
            }
        };

        this.addPoints = function(points) {
            function rgbToHex(r, g, b) {
                var rgb = b | (g << 8) | (r << 16);

                return "#" + (0x1000000 | rgb).toString(16).substring(1);
            }

            if (that._pointCloud) {
                setTimeout(function() {
                    var positions = that._pointCloud.geometry.attributes.position.array;
                    var colors = that._pointCloud.geometry.attributes.color.array;

                    for (var i=0; i<points.length; i++) {
                        var thisPosition = that._currentPoint;

                        that._currentPoint += 3;

                        positions[thisPosition] = points[i].x;
                        positions[thisPosition+1] = points[i].y;
                        positions[thisPosition+2] = points[i].z;

                        var newColor = new THREE.Color(rgbToHex(points[i].r, points[i].g, points[i].b));

                        colors[thisPosition] = newColor.r;
                        colors[thisPosition+1] = newColor.g;
                        colors[thisPosition+2] = newColor.b;
                    }

                    that._chuncksProcessed++;   
                }, 0);
            }
        }

        this.addCloud = function() {
            function toRadians(degrees) {
                return degrees * Math.PI / 180;
            }

            var renderScene = setInterval(function() {
                if (that._chuncksAdded == that._chuncksProcessed) {
                    that._pointCloud.geometry.attributes.position.needsUpdate = true;
                    that._pointCloud.geometry.attributes.color.needsUpdate = true;

                    that._pointCloud.rotation.x = that.degToRad(90);
                    that._pointCloud.rotation.y = that.degToRad(180);

                    that._pointCloud.geometry.computeBoundingSphere();

                    var cloudCenter = that._pointCloud.geometry.center();
                    var cloudRadius = that._pointCloud.geometry.boundingSphere.radius;

                    that._pointCloud.position.x = (cloudCenter.x*-1);
                    that._pointCloud.position.y = (cloudCenter.y*-1);
                    that._pointCloud.position.z = (cloudCenter.z*-1);

                    that._controls.setCameraPosition(cloudRadius, cloudRadius, cloudRadius);
                    that._controls.setCameraLookAt(0,0,0);

                    that._scene.add(that._pointCloud);

                    console.log("loaded");

                    clearInterval(renderScene);   
                }
            }, 10);
        }


        this.loadPointCloud = function(cloudFile) {
            this._socket = eio("http://localhost:8080/");

            // Handle socket actions

            this._socket.on("open", function() {
                try
                {
                    console.log("Connected to websocket");
                }
                catch (er) {}

                that._socket.send(JSON.stringify({ 
                    action: "EstablishingConnection" 
                }));

                that._socket.send(JSON.stringify({ 
                    action: "GetData",
                    cloudFile: cloudFile
                }));

                that._socket.on("message", function(package) {
                    if (package) {
                        var socketPackage = JSON.parse(package);

                        if (socketPackage.action != null) {
                            switch(socketPackage.action.toLowerCase()) {
                                case "clouddata":
                                    if (socketPackage.data) {
                                        var lines = socketPackage.data.split("\n");

                                        var firstLine = lines[0].trim().split(" ");

                                        if (firstLine.length === 1) that.initializeCloud(parseInt(firstLine[0]));

                                        setTimeout(function() {
                                            var points = [];

                                            for (var i=0; i<lines.length; i++) {
                                                var pointData = lines[i].trim().split(" ");

                                                if (pointData.length == 1) {
                                                    that.initializeCloud(parseInt(pointData[0]));
                                                }
                                                else if (pointData.length == 7) {
                                                    points.push({
                                                        x: parseFloat(pointData[0]),
                                                        y: parseFloat(pointData[1]),
                                                        z: parseFloat(pointData[2]),
                                                        r: parseFloat(pointData[4]),
                                                        g: parseFloat(pointData[5]),
                                                        b: parseFloat(pointData[6]),
                                                        a: parseFloat(pointData[3])
                                                    });
                                                }
                                            }

                                            that.addPoints(points);
                                        }, 0);

                                        that._chuncksAdded++;
                                    }
                                    break;
                                case "clouddatacomplete":
                                    that.addCloud();
                                    break;
                            }
                        }
                    }
                });
            });
        };

    	return {
    		start: function(container, ready) {
    			that.init(container, ready);
    		}
    	};
    };

    if(!window.PointCloudScene) window.PointCloudScene = PointCloudScene;
})();