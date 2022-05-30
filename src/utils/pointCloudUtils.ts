import { CloudDimensions } from "../modules/Models/CloudDimensions";
import CloudPoint from "../modules/Models/CloudPoint";

export const GetCloudDimensions = (sceneSize: number, cloudPoints: Array<CloudPoint>): Promise<CloudDimensions> => {
    return new Promise((resolve) => {
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

        const cloudDimensions = new CloudDimensions();

        cloudDimensions.xRatio = sceneSize/(maxX-minX);
        cloudDimensions.yRatio = sceneSize/(maxY-minY);
        cloudDimensions.zRatio = sceneSize/(maxZ-minZ);

        cloudDimensions.xOffset = (maxX+minX)/2;
        cloudDimensions.yOffset = (maxY+minY)/2;
        cloudDimensions.zOffset = (maxZ+minZ)/2;

        resolve(cloudDimensions);
    });    
};