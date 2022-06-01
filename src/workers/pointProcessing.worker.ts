import { Logging } from "../modules/Logging";
import { CloudDimensions } from "../modules/Models/CloudDimensions";
import CloudPoint from "../modules/Models/CloudPoint";
import { PointRange } from "../modules/Models/PointRange";

function _processCloudDimensions(sceneSize: number, pointRanges: Array<PointRange>) {
    new Promise<CloudDimensions>((resolve) => {
        let minX = null;
        let maxX = null;
        let minY = null;
        let maxY = null;
        let minZ = null;
        let maxZ = null;

        pointRanges.forEach((pointRange: PointRange) => {
            if ((minX === null) || (pointRange.minX < minX)) minX = pointRange.minX;
            if ((maxX === null) || (pointRange.maxX > maxX)) maxX = pointRange.maxX;
            if ((minX === null) || (pointRange.minY < minY)) minY = pointRange.minY;
            if ((maxY === null) || (pointRange.maxY > maxY)) maxY = pointRange.maxY;
            if ((minX === null) || (pointRange.minZ < minZ)) minZ = pointRange.minZ;
            if ((maxZ === null) || (pointRange.maxZ > maxZ)) maxZ = pointRange.maxZ;
        });

        const cloudDimensions = new CloudDimensions();
        
        const xSize = (maxX-minX);
        const ySize = (maxY-minY);
        const zSize = (maxZ-minZ);

        if (xSize !== 0) cloudDimensions.xRatio = sceneSize/xSize;
        else cloudDimensions.xRatio = 1;

        if (ySize !== 0) cloudDimensions.yRatio = sceneSize/ySize;
        else cloudDimensions.yRatio = 1;
    
        if (zSize !== 0) cloudDimensions.zRatio = sceneSize/zSize;
        else cloudDimensions.zRatio = 1;

        cloudDimensions.xOffset = (maxX+minX)/2;
        cloudDimensions.yOffset = (maxY+minY)/2;
        cloudDimensions.zOffset = (maxZ+minZ)/2;

        Logging.log("completed processing " + Date.now());

        resolve(cloudDimensions);
    }).then((cloudDimensions) => {
        postMessage({
            action: "cloudDimensions",
            cloudDimensions: cloudDimensions
        });
    });
}

function _processPointRange(cloudPoints: Array<CloudPoint>) {
    new Promise<PointRange>((resolve) => {
        let minX = null;
        let maxX = null;
        let minY = null;
        let maxY = null;
        let minZ = null;
        let maxZ = null;
    
        cloudPoints.forEach((cloudPoint: CloudPoint) => {
            if ((minX === null) || (cloudPoint.x < minX)) minX = cloudPoint.x;
            if ((maxX === null) || (cloudPoint.x > maxX)) maxX = cloudPoint.x;
            if ((minY === null) || (cloudPoint.y < minY)) minY = cloudPoint.y;
            if ((maxY === null) || (cloudPoint.y > maxY)) maxY = cloudPoint.y;
            if ((minZ === null) || (cloudPoint.z < minZ)) minZ = cloudPoint.z;
            if ((maxZ === null) || (cloudPoint.z > maxZ)) maxZ = cloudPoint.z;
        });
    
        const pointRange = new PointRange();
        pointRange.minX = minX;
        pointRange.maxX = maxX;
        pointRange.minY = minY;
        pointRange.maxY = maxY;
        pointRange.minZ = minZ;
        pointRange.maxZ = maxZ;
    
        Logging.log("completed processing " + Date.now());

        resolve(pointRange);
    }).then((pointRange) => {
        postMessage({
            action: "processPoints",
            ranges: pointRange
        });
    });
}

addEventListener('message', ({ data }) => {
    if (data.action == "cloudDimensions") {
        const sceneSize = data.sceneSize as number;
        const pointRanges = data.pointRanges as Array<PointRange>;

        _processCloudDimensions(sceneSize, pointRanges);
    }
    else if (data.action == "processPoints") {
        const cloudPoints = data.cloudPoints as Array<CloudPoint>;

        _processPointRange(cloudPoints);
    }
  });