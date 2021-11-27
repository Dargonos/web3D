import {View} from "./view";
import {
    PMREMGenerator, Raycaster,
    UnsignedByteType, Vector2,
    WebGLRenderer
} from "three";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";


export default class ProductView extends View {
    controls: OrbitControls;
    raycaster: Raycaster;
    mouse: Vector2;

    constructor(renderer: WebGLRenderer, gltfPath: string) {
        super(renderer);

        this.raycaster = new Raycaster();
        this.mouse = new Vector2(0,0);

        //TODO remove
        gltfPath = 'assets/models/LittlestTokyo.glb';

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'lib/draco/' );

        const loaderGLTF = new GLTFLoader();
        loaderGLTF.setDRACOLoader(dracoLoader);
        loaderGLTF.load(
            gltfPath,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(0,0,0)
                model.scale.set( 0.01, 0.01, 0.01 )
                this._scene.add(model)
            },
            undefined,
            (err) => console.error(err)
        );

        this.controls = new OrbitControls(this._cam, this._renderer.domElement) as OrbitControls;

        const pmremGenerator = new PMREMGenerator(this._renderer);
        pmremGenerator.compileEquirectangularShader();
        const hdrTexture = new RGBELoader()
            .setDataType(UnsignedByteType)
            .load('assets/env/market.hdr', () => {
                const target = pmremGenerator.fromEquirectangular(hdrTexture);
                this._scene.environment = target.texture;
                this._scene.background = target.texture;
            });
    }

    public initialize() {
        super.initialize()

        this._renderer.domElement.addEventListener( 'dblclick', (event) => {
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2.0 - 1.0;
            this.mouse.y = ( event.clientY / window.innerHeight ) * 2.0 - 1.0;

            this.raycaster.setFromCamera(this.mouse, this._cam);
            const intersection = this.raycaster.intersectObject(this._scene, true);
            if (intersection && intersection.length > 0) {
                //TODO zoom
            }
        });

        this._gui.hide()
    }

    public destroy() {
        super.destroy();

    }

    public update(delta: number, elapsed: number) {


        this.controls.update();
    }
}
