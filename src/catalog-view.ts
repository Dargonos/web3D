import {View} from "./view";
import {
    CircleGeometry,
    DirectionalLight, FontLoader,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial, MeshPhongMaterial,
    OctahedronGeometry, Raycaster, TextGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";

export default class CatalogView extends View {
    meshList: {mesh: Mesh, destination: Vector3, name: string}[] = []
    spawnRange = 2
    itemMargin = 1
    movementSpeed = 0.1
    displayedMeshName: string = ""
    raycaster: Raycaster
    mouse: Vector2

    constructor(renderer: WebGLRenderer) {
        super(renderer);

        this._cam.fov = 45
        this._cam.position.set(0, 0.25, 1.75)
        this.raycaster = new Raycaster()
        this.mouse = new Vector2(0, 0)
    }

    public initialize() {
        super.initialize();

        this.initMeshes()

        this.setMeshPositions()

        this.displayMeshes()

        //this.initTitle()

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
            this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1

            this.raycaster.setFromCamera(this.mouse, this._cam)
            const intersection = this.raycaster.intersectObject(this._scene, true)
            console.log("raycasted")
            if (intersection && intersection.length > 0) {
                console.log(intersection[0].object.name)
            }
        })
    }

    public initTitle() {
        let textMesh: Mesh

        const loader = new FontLoader();
        loader.load('./assets/fonts/alegreya/AlegreyaSansSC_Bold.json', (font) => {
            let textGeometry = new TextGeometry("TEXT", {
                font: font,
                size: 50,
                height: 10,
                curveSegments: 12,
                bevelThickness: 1,
                bevelSize: 1,
                bevelEnabled: true
            })

            let textMaterial = new MeshPhongMaterial( {color: 0xff0000, specular: 0xffffff})

            textMesh = new Mesh(textGeometry, textMaterial)
            this._scene.add(textMesh!)
        });
    }

    public initMeshes() {
        const sun = new Mesh(new CircleGeometry(0.15, 32), new MeshBasicMaterial());
        sun.material.color.set('#FFFF00');
        sun.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: sun, destination: new Vector3(0,0,0), name: "Sun"})

        const earth = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth.material.color.set('#0020FF');
        earth.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth, destination: new Vector3(0,0,0), name: "Earth"})

        const mars = new Mesh(new OctahedronGeometry(0.03, 4), new MeshLambertMaterial());
        mars.material.color.set('#9B7653');
        this.meshList.push({mesh: mars, destination: new Vector3(0,0,0), name: "Mars"})

        const earth2 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth2.material.color.set('#20FF00');
        earth2.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth2, destination: new Vector3(0,0,0), name: "Yellow Earth"})

        const earth3 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth3.material.color.set('#FF0020');
        earth3.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth3, destination: new Vector3(0,0,0), name: "Red Earth"})
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

    public setMeshPositions() {
        this.displayedMeshName = this.meshList[0].name
        console.log("Displayed mesh: " + this.displayedMeshName)

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
            if (this.meshList[i].name != this.displayedMeshName && Math.abs(this.meshList[i].destination.x) < this.itemMargin / 3) {
                this.displayedMeshName = this.meshList[i].name
                console.log("Displayed mesh: " + this.displayedMeshName)
            }
        }
        this.displayMeshes()
    }

    public destroy() {
        super.destroy();
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