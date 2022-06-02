
(()=>{

'use strict';



const isInstanceOf = (value, className) => {
  const C = globalThis[className];
  return C != null && value instanceof C;
}
const getTransferables = (value) => {
  if (value != null) {
  if (
    isInstanceOf(value, "ArrayBuffer") ||
    isInstanceOf(value, "MessagePort") ||
    isInstanceOf(value, "ImageBitmap") ||
    isInstanceOf(value, "OffscreenCanvas")
  ) {
    return [value];
  }
  if (typeof value === "object") {
    if (value.constructor === Object) {
    value = Object.values(value);
    }
    if (Array.isArray(value)) {
    return value.flatMap(getTransferables);
    }
    return getTransferables(value.buffer);
  }
  }
  return [];
};
const exports = {};
const workerMsgId = 'stencil.pointProcessing.worker';
const workerMsgCallbackId = workerMsgId + '.cb';
addEventListener('message', async ({data}) => {
  if (data && data[0] === workerMsgId) {
  let id = data[1];
  let method = data[2];
  let args = data[3];
  let i = 0;
  let argsLen = args.length;
  let value;
  let err;

  try {
    for (; i < argsLen; i++) {
    if (Array.isArray(args[i]) && args[i][0] === workerMsgCallbackId) {
      const callbackId = args[i][1];
      args[i] = (...cbArgs) => {
      postMessage(
        [workerMsgCallbackId, callbackId, cbArgs]
      );
      };
    }
    }
    
    value = exports[method](...args);
    if (!value || !value.then) {
    throw new Error('The exported method "' + method + '" does not return a Promise, make sure it is an "async" function');
    }
    value = await value;
    

  } catch (e) {
    value = null;
    if (e instanceof Error) {
    err = {
      isError: true,
      value: {
      message: e.message,
      name: e.name,
      stack: e.stack,
      }
    };
    } else {
    err = {
      isError: false,
      value: e
    };
    }
    value = undefined;
  }

  const transferables = getTransferables(value);
  if (transferables.length > 0) console.debug('Transfering', transferables);

  postMessage(
    [workerMsgId, id, value, err],
    transferables
  );
  }
});


class Logging {
  static log(message) {
    if (this.enabled)
      console.log(message);
  }
}
Logging.enabled = false;

class CloudDimensions {
}

class PointRange {
}

function _processCloudDimensions(sceneSize, pointRanges) {
  new Promise((resolve) => {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    let minZ = null;
    let maxZ = null;
    pointRanges.forEach((pointRange) => {
      if ((minX === null) || (pointRange.minX < minX))
        minX = pointRange.minX;
      if ((maxX === null) || (pointRange.maxX > maxX))
        maxX = pointRange.maxX;
      if ((minX === null) || (pointRange.minY < minY))
        minY = pointRange.minY;
      if ((maxY === null) || (pointRange.maxY > maxY))
        maxY = pointRange.maxY;
      if ((minX === null) || (pointRange.minZ < minZ))
        minZ = pointRange.minZ;
      if ((maxZ === null) || (pointRange.maxZ > maxZ))
        maxZ = pointRange.maxZ;
    });
    const cloudDimensions = new CloudDimensions();
    const xSize = (maxX - minX);
    const ySize = (maxY - minY);
    const zSize = (maxZ - minZ);
    if (xSize !== 0)
      cloudDimensions.xRatio = sceneSize / xSize;
    else
      cloudDimensions.xRatio = 1;
    if (ySize !== 0)
      cloudDimensions.yRatio = sceneSize / ySize;
    else
      cloudDimensions.yRatio = 1;
    if (zSize !== 0)
      cloudDimensions.zRatio = sceneSize / zSize;
    else
      cloudDimensions.zRatio = 1;
    cloudDimensions.xOffset = (maxX + minX) / 2;
    cloudDimensions.yOffset = (maxY + minY) / 2;
    cloudDimensions.zOffset = (maxZ + minZ) / 2;
    Logging.log("completed processing " + Date.now());
    resolve(cloudDimensions);
  }).then((cloudDimensions) => {
    postMessage({
      action: "cloudDimensions",
      cloudDimensions: cloudDimensions
    });
  });
}
function _processPointRange(cloudPoints) {
  new Promise((resolve) => {
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;
    let minZ = null;
    let maxZ = null;
    cloudPoints.forEach((cloudPoint) => {
      if ((minX === null) || (cloudPoint.x < minX))
        minX = cloudPoint.x;
      if ((maxX === null) || (cloudPoint.x > maxX))
        maxX = cloudPoint.x;
      if ((minY === null) || (cloudPoint.y < minY))
        minY = cloudPoint.y;
      if ((maxY === null) || (cloudPoint.y > maxY))
        maxY = cloudPoint.y;
      if ((minZ === null) || (cloudPoint.z < minZ))
        minZ = cloudPoint.z;
      if ((maxZ === null) || (cloudPoint.z > maxZ))
        maxZ = cloudPoint.z;
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
    const sceneSize = data.sceneSize;
    const pointRanges = data.pointRanges;
    _processCloudDimensions(sceneSize, pointRanges);
  }
  else if (data.action == "processPoints") {
    const cloudPoints = data.cloudPoints;
    _processPointRange(cloudPoints);
  }
});
})();
