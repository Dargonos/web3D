import {View} from "./view";
import {
    CircleGeometry,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    OctahedronGeometry,
} from "three";

export default class CatalogView extends View {
    meshList: {mesh: Mesh}[] = []

    public initialize() {
        super.initialize();

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
            this.updateMeshPositions(event.deltaY * 0.005)
        })
    }

    public initMeshes() {
        const sun = new Mesh(new CircleGeometry(0.15, 32), new MeshBasicMaterial());
        sun.material.color.set('#FFFF00');
        sun.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: sun})

        const earth = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth.material.color.set('#0020FF');
        earth.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth})

        const mars = new Mesh(new OctahedronGeometry(0.03, 4), new MeshLambertMaterial());
        mars.material.color.set('#9B7653');
        this.meshList.push({mesh: mars})
    }

    public displayMeshes() {
        for (let i = 0; i < this.meshList.length; i++) {
            this._scene.add(this.meshList[i].mesh)
        }
    }

    public setMeshPositions() {
        for (let i = 0; i < this.meshList.length; i++) {
            this.meshList[i].mesh.position.set(i, 0, 0)
        }
    }

    public updateMeshPositions(value: number) {
        for (let i = 0; i < this.meshList.length; i++) {
            this.meshList[i].mesh.position.x += value;
        }
    }

    public destroy() {
        super.destroy();
    }

    public update(delta: number, elapsed: number) {
    }
}