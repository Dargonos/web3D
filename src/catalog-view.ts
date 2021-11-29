import {View} from "./view";
import {
    DirectionalLight, Group,
    Mesh, PMREMGenerator,
    Raycaster, UnsignedByteType, Vector2, Vector3, WebGLRenderer,
} from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {BokehPass} from "three/examples/jsm/postprocessing/BokehPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

export default class CatalogView extends View {
    meshList: {model: Group, destination: Vector3}[] = []
    spawnRange = 2
    itemMargin = 1
    movementSpeed = 0.1
    displayedMeshName: string = ""
    raycaster: Raycaster
    mouse: Vector2
    itemTitle: HTMLElement | null


    composer: EffectComposer;
    bokehPass: BokehPass;

    constructor(renderer: WebGLRenderer) {
        super(renderer);

        this._cam.fov = 45
        this._cam.position.set(0, 0.25, 1.75)
        this.raycaster = new Raycaster()
        this.mouse = new Vector2(0, 0)
        this.itemTitle = document.getElementById('item_title')

        const renderPass = new RenderPass( this._scene, this._cam );
        this.bokehPass = new BokehPass( this._scene, this._cam, {
            focus: 10,
            aperture: 0.0003,
            maxblur: 0.008,
        });

        this.composer = new EffectComposer(this._renderer);
        this.composer.addPass(renderPass)
        this.composer.addPass(this.bokehPass);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    public initialize() {
        super.initialize();
        this._gui.hide()

        const catalogButton = document.getElementById('catalog');
        if (catalogButton) {
            catalogButton.style.visibility = 'hidden'
        }
        const previousButton = document.getElementById('previous');
        if (previousButton) {
            previousButton.style.visibility = 'hidden'
        }
        const nextButton = document.getElementById('next');
        if (nextButton) {
            nextButton.style.visibility = 'hidden'
        }

        if (this.itemTitle) {
            this.itemTitle.style.visibility = 'visible'
        }

        this.initMeshes()

        const dirLight1 = new DirectionalLight(0xffc0cb, 1);
        dirLight1.add(dirLight1.target);
        dirLight1.position.set(0, 0, 0);
        dirLight1.target.position.set(8, -8, -12);
        dirLight1.castShadow = true;

        const dirLight2 = new DirectionalLight(0xffc0cb, 1);
        dirLight2.add(dirLight2.target);
        dirLight2.position.set(0, 0, 0);
        dirLight2.target.position.set(-8, -8, -12);
        dirLight2.castShadow = true;

        this._scene.add(dirLight1, dirLight2)

        const pmremGenerator = new PMREMGenerator(this._renderer);
        pmremGenerator.compileEquirectangularShader();
        const hdrTexture = new RGBELoader()
            .setDataType(UnsignedByteType)
            .load('assets/env/market.hdr', () => {
                const target = pmremGenerator.fromEquirectangular(hdrTexture);
                this._scene.environment = target.texture;
                this._scene.background = target.texture;
            });

        window.addEventListener('wheel', (event) => {
            event.preventDefault()
            this.updateMeshPositions(event.deltaY * 0.001)
        }, { passive: false })

        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

            this.raycaster.setFromCamera(this.mouse, this._cam)
            const intersection = this.raycaster.intersectObject(this._scene, true)
            if (intersection && intersection.length > 0) {
                let intersectionObject = intersection[0].object

                for (let i = 0; i < this.meshList.length; i++) {
                    let item = this._gltfPaths[i]
                    if (item.name == intersectionObject.name) {
                        console.log("item name: " + item.name)
                        this.destinationItemId = item.id

                        const productDetailButton = document.getElementById('product-detail');
                        if (productDetailButton)
                            productDetailButton.click()
                    }
                }
            }
        })
    }

    public initMeshes() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'lib/draco/' );
        const loaderGLTF = new GLTFLoader();
        loaderGLTF.setDRACOLoader(dracoLoader);

        let limit = this._gltfPaths.length
        for (let i = 0; i < limit; i++) {
            let item = this._gltfPaths[i]
            loaderGLTF.load(
                item.path,
                (gltf) => {
                    console.log("Started loading " + item.name)
                    const model = gltf.scene;
                    if (i === limit - 1)
                        model.position.set(-1 * this.itemMargin,0,0)
                    else
                        model.position.set(i * this.itemMargin,0,0)
                    model.position.z = - Math.abs(model.position.x) / 5

                    let scale = item.scale
                    model.scale.set( scale, scale, scale )
                    model.castShadow = true
                    model.name = item.name

                    model.traverse((child) => {
                        if (child instanceof Mesh) {
                            child.castShadow = true;
                            child.name = item.name
                        }
                    });

                    model.name = item.name
                    this.meshList.push({model: model, destination: new Vector3(model.position.x,0,model.position.z)})

                    if (- this.spawnRange <= model.position.x && model.position.x <= this.spawnRange)
                        this._scene.add(model)

                    console.log("Finished loading " + item.name)
                },
                undefined,
                (err) => console.error(err)
            );
        }

        this.updateItemTitle(this._gltfPaths[0].name)
    }

    public displayMeshes() {
        for (let i = 0; i < this.meshList.length; i++) {
            let currentModel = this.meshList[i].model

            if (- this.spawnRange <= currentModel.position.x && currentModel.position.x <= this.spawnRange)
                this._scene.add(currentModel)
            else
                this._scene.remove(currentModel)
        }
    }

    public updateItemTitle(newTitle: string) {
        this.displayedMeshName = newTitle
        if (this.itemTitle) {
            this.itemTitle.innerText = this.displayedMeshName
        }
        console.log("Displayed mesh: " + this.displayedMeshName)
    }

    public updateMeshPositions(value: number) {
        let limit = (this.meshList.length - 2) * this.itemMargin
        for (let i = 0; i < this.meshList.length; i++) {
            let currentItem = this.meshList[i]
            let newPos = new Vector3(currentItem.destination.x - value, 0, 0)

            if (newPos.x >= limit) {
                newPos.x = -this.itemMargin * 2
                currentItem.model.position.x = newPos.x
            }
            else if (newPos.x <= -limit) {
                newPos.x = this.itemMargin * 2
                currentItem.model.position.x = newPos.x
            }
            currentItem.model.position.z = - Math.abs(newPos.x) / 5

            this.meshList[i].destination = newPos
            if (this.meshList[i].model.name != this.displayedMeshName && Math.abs(this.meshList[i].destination.x) < this.itemMargin / 3)
                this.updateItemTitle(this.meshList[i].model.name)
        }
        this.displayMeshes()
    }

    public destroy() {
        super.destroy();

        for (let i = 0; i < this.meshList.length; i++) {
            this.meshList[i].model.clear()
        }
        this.meshList = []
        this._scene.clear()
        console.log("Catalog scene destroyed")
    }

    public resize(w: number, h: number) : void {
        super.resize(w, h);
        this.bokehPass.renderTargetDepth.setSize(w, h);
        this.composer.setSize(w, h);
    }

    public render() {
        this.composer.render();
    }

    public moveMeshes() {
        for (let i = 0; i < this.meshList.length; i++) {
            let currentItem = this.meshList[i]
            currentItem.model.rotateY(this._rotationSpeed)

            if (currentItem.destination !== currentItem.model.position) {
                if (this.movementSpeed * (currentItem.destination.x - currentItem.model.position.x) > Math.abs(currentItem.destination.x - currentItem.model.position.x)) {
                    currentItem.model.position.x += currentItem.destination.x - currentItem.model.position.x
                } else {
                    currentItem.model.position.x += (currentItem.destination.x - currentItem.model.position.x) * this.movementSpeed
                }
            }
        }
    }

    public update(delta: number, elapsed: number) {
        this.moveMeshes()
    }
}