import { CloudDimensions } from "../modules/Models/CloudDimensions";
import CloudPoint from "../modules/Models/CloudPoint";
import { PointRange } from "../modules/Models/PointRange";

function processCloudDimensions(sceneSize: number, pointRanges: Array<PointRange>) {
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

    cloudDimensions.xRatio = sceneSize/(maxX-minX);
    cloudDimensions.yRatio = sceneSize/(maxY-minY);
    cloudDimensions.zRatio = sceneSize/(maxZ-minZ);

    cloudDimensions.xOffset = (maxX+minX)/2;
    cloudDimensions.yOffset = (maxY+minY)/2;
    cloudDimensions.zOffset = (maxZ+minZ)/2;

    console.log("completed processing " + Date.now());

    postMessage(cloudDimensions);
}

function processPointRange(cloudPoints: Array<CloudPoint>) {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    let minZ = null;
    let maxZ = null;

    cloudPoints.forEach((cloudPoint: CloudPoint) => {
        if ((minX === null) || (cloudPoint.x < minX)) minX = cloudPoint.x;
        if ((maxX === null) || (cloudPoint.x > maxX)) maxX = cloudPoint.x;
        if ((minX === null) || (cloudPoint.y < minY)) minY = cloudPoint.y;
        if ((maxY === null) || (cloudPoint.y > maxY)) maxY = cloudPoint.y;
        if ((minX === null) || (cloudPoint.z < minZ)) minZ = cloudPoint.z;
        if ((maxZ === null) || (cloudPoint.z > maxZ)) maxZ = cloudPoint.z;
    });

    const pointRange = new PointRange();
    pointRange.minX = minX;
    pointRange.maxX = maxX;
    pointRange.minY = minY;
    pointRange.maxY = maxY;
    pointRange.minZ = minZ;
    pointRange.maxZ = maxZ;

    console.log("completed processing " + Date.now());

    postMessage({
        action: "processPoints",
        ranges: pointRange
    });
}

addEventListener('message', ({ data }) => {
    if (data.action == "cloudDimensions") {
        const sceneSize = data.sceneSize as number;
        const pointRanges = data.pointRanges as Array<PointRange>;

        processCloudDimensions(sceneSize, pointRanges);
    }
    else if (data.action == "processPoints") {
        const cloudPoints = data.cloudPoints as Array<CloudPoint>;

        processPointRange(cloudPoints);
    }
  });