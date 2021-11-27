import { Clock, Color, WebGLRenderer } from 'three';
import { View } from './view';

// @ts-ignore
const modules = import.meta.glob('./*-view.ts');

/**
 * Extracts the modules found in `modules`, and instantiate
 * each view
 *
 * @param renderer - The renderer used to instantiate each view
 *
 * @return An array of view
 */
async function loadViews(renderer: WebGLRenderer): Promise<View[]> {
  const promises = [];
  for (const path in modules) {
    const name = path.split('/').pop()?.replace('.ts', '');
    const p = modules[path]().then((mod: any) => {
      const view = new mod.default(renderer);
      view['_name'] = name;
      return view;
    })
    promises.push(p);
  }
  return Promise.all(promises);
}

/**
 * Start on correct view
 * the lifecycle methods `destroy()` and `initialize()`
 *
 * @param view - View to run
 */
function initView(view: View): void {
  view.initialize();
  view.resize(canvas.width, canvas.height);

  const title = document.getElementById('title');
  if (title) {
    // Not optimized to look it up each time, but I am lazy :)
    title.innerText = view.name;
  }
}

/**
 * Renderer Initialization.
 */

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(new Color('#464646'));

/**
 * View Initialization.
 */

const views = await loadViews(renderer);
const params = new URLSearchParams(window.location.search);
const viewId = params.get('tp') ?? params.get('view') ?? 'product-view';
let viewIndex = views.findIndex((e) => e.name === viewId);
viewIndex = viewIndex === -1 ? 0 : viewIndex;

/**
 * Lifecycle: Initialization.
 */

const clock = new Clock();

initView(views[viewIndex]);

/**
 * Lifecycle: Update & Render.
 */

function animate() {
  const view = views[viewIndex];
  if (view) {
    view.update(clock.getDelta(), clock.getElapsedTime());
    view.render();
  }
  window.requestAnimationFrame(animate);
}
animate();

/**
 * Lifecycle: Resize.
 */

const resizeObserver = new ResizeObserver(entries => {
  const view = views[viewIndex];
  if (entries.length > 0) {
    const entry = entries[0];
    canvas.width = window.devicePixelRatio * entry.contentRect.width;
    canvas.height = window.devicePixelRatio * entry.contentRect.height;
    renderer.setSize(canvas.width, canvas.height, false);
    if (view) {
      view.resize(canvas.width, canvas.height);
    }
  }
});

resizeObserver.observe(canvas);
