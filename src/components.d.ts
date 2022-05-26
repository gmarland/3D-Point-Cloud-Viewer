/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface CloudScene {
        "resize": () => Promise<boolean>;
        "updateCloud": (cloudPoints: Array<any>) => Promise<boolean>;
    }
}
declare global {
    interface HTMLCloudSceneElement extends Components.CloudScene, HTMLStencilElement {
    }
    var HTMLCloudSceneElement: {
        prototype: HTMLCloudSceneElement;
        new (): HTMLCloudSceneElement;
    };
    interface HTMLElementTagNameMap {
        "cloud-scene": HTMLCloudSceneElement;
    }
}
declare namespace LocalJSX {
    interface CloudScene {
    }
    interface IntrinsicElements {
        "cloud-scene": CloudScene;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "cloud-scene": LocalJSX.CloudScene & JSXBase.HTMLAttributes<HTMLCloudSceneElement>;
        }
    }
}
