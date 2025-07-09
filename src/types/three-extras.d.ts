declare module "three/examples/jsm/exporters/GLTFExporter" {
    export class GLTFExporter {
        parse(
            input: unknown,
            onCompleted: (result: ArrayBuffer | object) => void,
            onError?: (error: unknown) => void,
            options?: object
        ): void;
    }
}

declare module "three/examples/jsm/loaders/STLLoader" {
    import { BufferGeometry } from "three";
    export class STLLoader {
        parse(data: ArrayBuffer): BufferGeometry;
    }
}

declare module "three/examples/jsm/loaders/OBJLoader" {
    export class OBJLoader {
        parse(data: string): unknown;
    }
} 