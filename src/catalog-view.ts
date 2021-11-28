import {View} from "./view";
import {
    CircleGeometry,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    OctahedronGeometry, Raycaster, Vector2, Vector3, WebGLRenderer,
} from "three";
import {BokehPass} from "three/examples/jsm/postprocessing/BokehPass";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";

export default class CatalogView extends View {
    meshList: {mesh: Mesh, destination: Vector3}[] = []
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
            focus: 2,
            aperture: 0.0001,
            maxblur: 0.04,
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

        this.setMeshPositions()

        this.displayMeshes()

        const dirLight = new DirectionalLight(0xffc0cb, 1);
        dirLight.add(dirLight.target);
        dirLight.position.set(0, 0, 0);
        dirLight.target.position.set(8, -8, -12);
        dirLight.castShadow = true;

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
                console.log("item name: " + intersection[0].object.name)
            }
        })
    }

    public initMeshes() {
        const sun = new Mesh(new CircleGeometry(0.15, 32), new MeshBasicMaterial());
        sun.material.color.set('#FFFF00');
        sun.scale.set(0.5, 0.5, 0.5);
        sun.name = "Sun"
        this.meshList.push({mesh: sun, destination: new Vector3(0,0,0)})

        const earth = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth.material.color.set('#0020FF');
        earth.scale.set(0.5, 0.5, 0.5);
        earth.name = "Earth"
        this.meshList.push({mesh: earth, destination: new Vector3(0,0,0)})

        const mars = new Mesh(new OctahedronGeometry(0.03, 4), new MeshLambertMaterial());
        mars.material.color.set('#9B7653');
        mars.name = "Mars"
        this.meshList.push({mesh: mars, destination: new Vector3(0,0,0)})

        const earth2 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth2.material.color.set('#20FF00');
        earth2.scale.set(0.5, 0.5, 0.5);
        earth2.name = "Yellow Earth"
        this.meshList.push({mesh: earth2, destination: new Vector3(0,0,0)})

        const earth3 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth3.material.color.set('#FF0020');
        earth3.scale.set(0.5, 0.5, 0.5);
        earth3.name = "Red Earth"
        this.meshList.push({mesh: earth3, destination: new Vector3(0,0,0)})
    }

    public displayMeshes() {
        for (let i = 0; i < this.meshList.length; i++) {
            let currentMesh = this.meshList[i].mesh

            if (- this.spawnRange <= currentMesh.position.x && currentMesh.position.x <= this.spawnRange)
                this._scene.add(currentMesh)
            else
                this._scene.remove(currentMesh)
        }
    }

    public updateItemTitle(newTitle: string) {
        this.displayedMeshName = newTitle
        if (this.itemTitle) {
            this.itemTitle.innerText = this.displayedMeshName
        }
        console.log("Displayed mesh: " + this.displayedMeshName)
    }

    public setMeshPositions() {
        this.updateItemTitle(this.meshList[0].mesh.name)

        for (let i = 0; i < this.meshList.length - 1; i++) {
            let position = new Vector3(i * this.itemMargin, 0, 0)
            this.meshList[i].mesh.position.set(position.x, position.y, position.z)
            this.meshList[i].destination = position
        }

        let position = new Vector3(-1 * this.itemMargin, 0, 0)
        this.meshList[this.meshList.length - 1].mesh.position.set(position.x, position.y, position.z)
        this.meshList[this.meshList.length - 1].destination = position
    }

    public updateMeshPositions(value: number) {
        let limit = (this.meshList.length - 2) * this.itemMargin
        for (let i = 0; i < this.meshList.length; i++) {
            let currentItem = this.meshList[i]
            let newPos = new Vector3(currentItem.destination.x - value, 0, 0)

            if (newPos.x >= limit) {
                newPos.x = -this.itemMargin * 2
                currentItem.mesh.position.x = newPos.x
            }
            else if (newPos.x <= -limit) {
                newPos.x = this.itemMargin * 2
                currentItem.mesh.position.x = newPos.x
            }

            this.meshList[i].destination = newPos
            if (this.meshList[i].mesh.name != this.displayedMeshName && Math.abs(this.meshList[i].destination.x) < this.itemMargin / 3)
                this.updateItemTitle(this.meshList[i].mesh.name)
        }
        this.displayMeshes()
    }

    public destroy() {
        super.destroy();
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

            if (currentItem.destination != currentItem.mesh.position) {
                if (this.movementSpeed * (currentItem.destination.x - currentItem.mesh.position.x) > Math.abs(currentItem.destination.x - currentItem.mesh.position.x)) {
                    currentItem.mesh.translateX((currentItem.destination.x - currentItem.mesh.position.x))
                } else {
                    currentItem.mesh.translateX((currentItem.destination.x - currentItem.mesh.position.x) * this.movementSpeed)
                }
            }
        }
    }

    public update(delta: number, elapsed: number) {
        this.moveMeshes()
    }
}