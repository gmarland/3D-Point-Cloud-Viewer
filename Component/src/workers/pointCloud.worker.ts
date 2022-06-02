import { Logging } from "../modules/Logging";
import { CloudDimensions } from "../modules/Models/CloudDimensions";
import CloudPoint from "../modules/Models/CloudPoint";

function _loadCloud(cloudPoints: Array<CloudPoint>, cloudDimensions: CloudDimensions): Promise<void> {
    return new Promise<void>((resolve) => {
        let startTime = Date.now();

        new Promise<Array<CloudPoint>>((resolve) => {
            // get the points where we want them if we are normalizing them
            
            if (cloudDimensions != null) {
                let processed = new Array<CloudPoint>();
                
                cloudPoints.forEach((cloudPoint: CloudPoint) => {
                    cloudPoint.x = (cloudPoint.x-cloudDimensions.xOffset)*cloudDimensions.xRatio;
                    cloudPoint.y = (cloudPoint.y-cloudDimensions.yOffset)*cloudDimensions.yRatio;
                    cloudPoint.z = (cloudPoint.z-cloudDimensions.zOffset)*cloudDimensions.zRatio;
    
                    processed.push(cloudPoint);
                });

                resolve(processed);
            }
            else {
                resolve(cloudPoints);
            }
        }).then((points: Array<CloudPoint>) => {
            _getPointsVerticies(points).then((vertices) => {
                Logging.log("Time to build: " + (Date.now() - startTime));

                postMessage({
                    action: "cloudVerticies",
                    vertices: vertices
                });
            });

            resolve();
        });
    });
}

function _getPointsVerticies(cloud: Array<CloudPoint>): Promise<Float32Array> {
    return new Promise((resolve) => {
        const currentCloudArray = Array.from(cloud.values());

        let startLooping = Date.now();

        let vertices = [];

        currentCloudArray.forEach((value: CloudPoint) => {
            vertices.push(value.x);
            vertices.push(value.y);
            vertices.push(value.z);
        });

        for (let i=0; i<vertices.length; i+=3) {
            vertices[i] = vertices[i];
            vertices[i+1] = vertices[i+1];
            vertices[i+2] = vertices[i+2];
        }

        Logging.log("Time to vertex: " + (Date.now() - startLooping));

        resolve(new Float32Array(vertices));
    });
}

addEventListener('message', ({ data }) => {
    if (data.action == "buildVerticies") {
        const pointCloudData = data.pointCloudData as Array<CloudPoint>;
        const pointCloudDimensions = data.pointCloudDimensions as CloudDimensions;

        _loadCloud(pointCloudData, pointCloudDimensions);
    }
});