
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
const workerMsgId = 'stencil.pointCloud.worker';
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

function _loadCloud(cloudPoints, cloudDimensions) {
  return new Promise((resolve) => {
    let startTime = Date.now();
    new Promise((resolve) => {
      // get the points where we want them if we are normalizing them
      if (cloudDimensions != null) {
        let processed = new Array();
        cloudPoints.forEach((cloudPoint) => {
          cloudPoint.x = (cloudPoint.x - cloudDimensions.xOffset) * cloudDimensions.xRatio;
          cloudPoint.y = (cloudPoint.y - cloudDimensions.yOffset) * cloudDimensions.yRatio;
          cloudPoint.z = (cloudPoint.z - cloudDimensions.zOffset) * cloudDimensions.zRatio;
          processed.push(cloudPoint);
        });
        resolve(processed);
      }
      else {
        resolve(cloudPoints);
      }
    }).then((points) => {
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
function _getPointsVerticies(cloud) {
  return new Promise((resolve) => {
    const currentCloudArray = Array.from(cloud.values());
    let startLooping = Date.now();
    let vertices = [];
    currentCloudArray.forEach((value) => {
      vertices.push(value.x);
      vertices.push(value.y);
      vertices.push(value.z);
    });
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] = vertices[i];
      vertices[i + 1] = vertices[i + 1];
      vertices[i + 2] = vertices[i + 2];
    }
    Logging.log("Time to vertex: " + (Date.now() - startLooping));
    resolve(new Float32Array(vertices));
  });
}
addEventListener('message', ({ data }) => {
  if (data.action == "buildVerticies") {
    const pointCloudData = data.pointCloudData;
    const pointCloudDimensions = data.pointCloudDimensions;
    _loadCloud(pointCloudData, pointCloudDimensions);
  }
});
})();
