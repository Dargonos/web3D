import {View} from "./view";
import {CircleGeometry, Mesh, MeshBasicMaterial, PointLight} from "three";

export default class CatalogView extends View {
    public initialize() {
        super.initialize();

        const sun = new Mesh(new CircleGeometry(0.15, 32), new MeshBasicMaterial());
        sun.material.color.set('#FFFF00');
        sun.scale.set(0.5, 0.5, 0.5);
        this._scene.add(sun);

        const sunLight = new PointLight('#FFFFFF', 10, 0);
        sunLight.decay = 0;
        sunLight.position.set(0,0,0);
        this._scene.add(sunLight);
    }

    public destroy() {
        super.destroy();
    }

    public update(delta: number, elapsed: number) {
    }
}