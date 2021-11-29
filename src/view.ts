import { GUI } from 'dat.gui';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from 'three';

/**
 * A view contains its own scene and camera.
 *
 * This is used to create different assignment / experience.\
 *
 * Later, we can cycle through all our examples in a small
 * application.
 */
export class View {

  /**
   * Renderer used to render this example. This is obtained
   * on instantiation.
   *
   * @hidden
   */
  protected _renderer: WebGLRenderer;

  /**
   * Scene to use for this example
   *
   * @hidden
   */
  protected _scene: Scene;

  /**
   * Camera to use for this example
   *
   * @hidden
   */
  protected _cam: PerspectiveCamera;

  /**
   * GUI of this example. Please have a look at what dat.gui
   * is and how to use it. It's really useful to create quickly
   * UI for testing purposes
   *
   * @hidden
   */
  protected _gui: GUI;

  protected _gltfPaths: {id: number, path: string, name: string, scale: number}[]

  protected  _rotationSpeed

  private readonly _name: string;

  public destinationItemId: number = 0

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
    this._scene = new Scene();
    this._cam = new PerspectiveCamera(110);
    this._cam.position.set(0, 0.25, 7);
    this._rotationSpeed = 0.001

    this._gui = new GUI();
    this._gui.hide();

    this._gltfPaths = []
    this.initGLTFPaths()

    this._name = '';
  }

  public initGLTFPaths() {
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/animal_cell.glb', name: 'Animal Cell', scale: 3})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/banana_plant.glb', name: 'Banana Plant', scale: 0.2})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/elephant.glb', name: 'Elephant', scale: 0.5})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/Fox.glb', name: 'Fox', scale: 0.005})
    //this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/LittlestTokyo.glb', name: 'Littlest Tokyo', scale: 0.002})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/meat.glb', name: 'Meat', scale: 0.2})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/rabbit_plush.glb', name: 'Rabbit Plush', scale: 0.05})
    this._gltfPaths.push({id: this._gltfPaths.length, path: 'assets/models/spirit_of_nature.glb', name: 'Spirit of Nature', scale: 0.5})
  }

  /**
   * Called when the example is initialized.
   *
   * This is called each time you switch example
   */
  public initialize(itemId: number = 0) {
    this._gui.show();
  }

  /**
   * Called when the example is getting destroyed.
   *
   * This is called each time you switch example
   */
  public destroy() {
    this._gui.hide();
  }

  /**
   * Called every animation frame, ~60 times a second.
   *
   * This method is called before `render()`
   */
  public update(delta: number, elapsed: number) {
    // Empty.
  }

  /**
   * Called every animation frame, ~60 times a second.
   *
   * This method is called after `update()`
   */
  public render() {
    this._renderer.render(this._scene, this._cam);
  }

  /**
   * Called each time the canvas is resized
   */
  public resize(w: number, h: number) {
    this._cam.aspect = w / h;
    this._cam.updateProjectionMatrix();
  }

  public get name() {
    return this._name;
  }

}
