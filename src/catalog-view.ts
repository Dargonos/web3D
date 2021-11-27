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
    spawnRange = 2
    itemMargin = 1


    public initialize() {
        super.initialize();

        this._cam.fov = 45;
        this._cam.position.set(0, 0.25, 1.75);

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

        const earth2 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth2.material.color.set('#20FF00');
        earth2.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth2})

        const earth3 = new Mesh(new OctahedronGeometry(0.05, 1), new MeshBasicMaterial());
        earth3.material.color.set('#FF0020');
        earth3.scale.set(0.5, 0.5, 0.5);
        this.meshList.push({mesh: earth3})
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
        for (let i = 0; i < this.meshList.length - 1; i++) {
            this.meshList[i].mesh.position.set(i * this.itemMargin, 0, 0)
        }

        this.meshList[this.meshList.length - 1].mesh.position.set(-1 * this.itemMargin, 0, 0)
    }

    public updateMeshPositions(value: number) {
        let limit = (this.meshList.length - 2) * this.itemMargin
        for (let i = 0; i < this.meshList.length; i++) {
            let newPos = this.meshList[i].mesh.position.x - value

            if (newPos >= limit)
                newPos = -this.itemMargin * 2
            else if (newPos <= -limit)
                newPos = this.itemMargin * 2

            this.meshList[i].mesh.position.x = newPos
        }
        this.displayMeshes()
    }

    public destroy() {
        super.destroy();
    }

    public update(delta: number, elapsed: number) {
    }
}