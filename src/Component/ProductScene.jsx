import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ProductScene extends Component {
    componentDidMount() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.scene = new THREE.Scene();

        //Add Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor("#263238");
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement);

        //add Camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 20;
        this.camera.position.y = 5;

        //Camera Controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);

        //LIGHTS
        var lights = [];
        lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);
        lights[0].position.set(0, 200, 0);
        lights[1].position.set(100, 200, 100);
        lights[2].position.set(-100, -200, -100);
        this.scene.add(lights[0]);
        this.scene.add(lights[1]);
        this.scene.add(lights[2]);

        controls.update();

        //Simple Box with WireFrame
        this.addModels();

        this.renderScene();
        //start animation
        this.start();
    }

    addModels() {
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const material = new THREE.MeshBasicMaterial({
            color: "#0F0"
        });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
    }

    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }
    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    };
    stop = () => {
        cancelAnimationFrame(this.frameId);
    };
    animate = () => {

        if (this.cube) this.cube.rotation.y += 0.01;

        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };
    renderScene = () => {
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    };

    render() {
        return (
            <div
                ref={mount => {
                    this.mount = mount;
                }}
            />
        );
    }
}
export default ProductScene;