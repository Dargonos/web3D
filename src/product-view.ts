import {View} from "./view";
import {
    Color,
    DirectionalLight, Group, Mesh, MeshPhysicalMaterial, PlaneBufferGeometry,
    PMREMGenerator, Raycaster, ShadowMaterial, SphereBufferGeometry,
    UnsignedByteType,
    Vector2,
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
    light: DirectionalLight;

    itemId: number
    nextItemId: number
    loadedItem?: Group
    isAppearing: boolean = false
    isDisappearing: boolean = false

    shadowPlaneGeometry: PlaneBufferGeometry;
    shadowPlaneMaterial: ShadowMaterial;
    shadowPlaneMesh: Mesh;

    colors : Color[] = [
        new Color("rgb(255,255,255)"),
        new Color("rgb(255,0,0)"),
        new Color("rgb(242,122,16)"),
        new Color( "rgb(255,235,0)"),
        new Color("rgb(0,255,0)"),
        new Color("rgb(0,0,255)"),
        new Color("rgb(94,15,215)"),
        new Color( "rgb(224,109,231)")];
    colorPickerGeometry: SphereBufferGeometry;

    constructor(renderer: WebGLRenderer, itemID: number) {
        super(renderer);

        this._renderer.shadowMap.enabled = true;

        this.raycaster = new Raycaster();
        this.mouse = new Vector2(0,0);

        this.light = new DirectionalLight(0xffffff);
        this.light.add(this.light.target);
        this.light.position.set(0, 0, 0);
        this.light.target.position.set(10, -12, -12);

        this.light.shadow.mapSize.set(1024,1024);
        this.light.shadow.camera.near = -5;
        this.light.shadow.camera.far = 8;
        this.light.castShadow = true;

        this.shadowPlaneGeometry = new PlaneBufferGeometry(100,100);
        this.shadowPlaneMaterial = new ShadowMaterial();
        this.shadowPlaneMesh = new Mesh(this.shadowPlaneGeometry, new ShadowMaterial());
        this.shadowPlaneMesh.position.set(0, -2,0);
        this.shadowPlaneMesh.rotation.x =  - Math.PI / 2;
        this.shadowPlaneMesh.name = "Shadow"
        this.shadowPlaneMesh.receiveShadow = true;

        this.colorPickerGeometry = new SphereBufferGeometry(0.4)

        for (let idx = 0; idx < this.colors.length; idx++) {
            let mesh = new Mesh(this.colorPickerGeometry, new MeshPhysicalMaterial({metalness: 0.2, roughness: 0.1}))
            mesh.position.set(5, idx, 0)
            mesh.material.color.set(this.colors[idx])
            mesh.name = "Picker"
            this._scene.add(mesh)
        }

        //TODO remove
        itemID = 0

        this.itemId = itemID
        this.nextItemId = this.itemId
        this.loadItem(this.itemId)

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

        this._scene.add( this.shadowPlaneMesh, this.light)

        //TODO arrow left tight to change mesh

    }

    public loadItem(itemId: number) {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'lib/draco/' );

        const loaderGLTF = new GLTFLoader();
        loaderGLTF.setDRACOLoader(dracoLoader);
        loaderGLTF.load(
            this._gltfPaths[itemId].path,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(0,0,0)
                model.scale.set(0, 0, 0)
                model.castShadow = true

                model.traverse((child) => {
                    if (child instanceof Mesh) {
                        child.material.color = this.colors[0];
                        child.castShadow = true;
                    }
                });

                this.loadedItem = model
                this._scene.add(this.loadedItem)
                this.isAppearing = true
            },
            undefined,
            (err) => console.error(err)
        );
    }

    public unloadItem() {
        this.isDisappearing = true
    }

    public initialize() {
        super.initialize()

        const catalogButton = document.getElementById('catalog');
        if (catalogButton) {
            catalogButton.style.visibility = 'visible'
        }

        this.initPreviousButton()
        this.initNextButton()

        this._renderer.domElement.addEventListener( 'click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this._cam)
            const intersection = this.raycaster.intersectObject(this._scene, true)
            if (intersection && intersection.length > 0) {
                if (intersection[0].object instanceof Mesh && intersection[0].object.name == "Picker") {
                    const newColor = intersection[0].object.material.color;
                    this.traverseScene(newColor);
                }
            }
        });

        const itemTitle = document.getElementById('item_title');
        if (itemTitle) {
            itemTitle.style.visibility = 'hidden'
        }

        this._gui.hide()
    }

    public initPreviousButton() {
        const previousButton = document.getElementById('previous');
        if (previousButton) {
            previousButton.style.visibility = 'visible'

            previousButton.addEventListener('click', () => {
                this.nextItemId = this.itemId != 0 ? (this.itemId - 1) : this._gltfPaths.length - 1
                this.unloadItem()
            })
        }
    }

    public initNextButton() {
        const nextButton = document.getElementById('next');
        if (nextButton) {
            nextButton.style.visibility = 'visible'

            nextButton.addEventListener('click', () => {
                this.nextItemId = (this.itemId + 1) % this._gltfPaths.length
                this.unloadItem()
            })
        }
    }

    public destroy() {
        super.destroy();

        this.light.dispose()
        this.shadowPlaneGeometry.dispose()
        this.shadowPlaneMaterial.dispose()

        this.colorPickerGeometry.dispose()
    }

    public update(delta: number, elapsed: number) {
        this.controls.update();

        if (this.loadedItem) {
            this.loadedItem.rotateY(this._rotationSpeed)

            if (this.isAppearing) {
                if (this.loadedItem.scale.x <= this._gltfPaths[this.nextItemId].scale * 10) {
                    let newScale = this.loadedItem.scale.x + (0.1 * this._gltfPaths[this.nextItemId].scale)
                    this.loadedItem.scale.set(newScale, newScale, newScale)
                } else {
                    this.isAppearing = false
                    this.itemId = this.nextItemId
                }
            }

            if (this.isDisappearing) {
                if (this.loadedItem.scale.x >= 0) {
                    let newScale = this.loadedItem.scale.x - (1.2 * this._gltfPaths[this.itemId].scale)
                    this.loadedItem.scale.set(newScale, newScale, newScale)
                } else {
                    this.isDisappearing = false
                    this._scene.remove(this.loadedItem)
                    this.loadItem(this.nextItemId)
                }
            }
        }
    }

    public traverseScene(color: Color) {
        this._scene.traverse((object) => {
            if (object instanceof Mesh && object.name != "Picker" && object.name != "Shadow") {
                object.material.color = color;
            }
        });
    }
}
