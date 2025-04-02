import {
  Engine,
  Render,
  Runner,
  Common,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
} from "matter-js";
import { letters } from "./letters";

const engine = Engine.create();
const render = Render.create({
  element: document.body,
  engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: "rgb(0 4 21)",
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

const width = window.innerWidth < 831 ? 300 : 700;
const height = width / (window.innerWidth / window.innerHeight);

const resize = () => {
  render.options.width = render.canvas.width = window.innerWidth;
  render.options.height = render.canvas.height = window.innerHeight;
  Render.lookAt(render, {
    min: { x: 0, y: height - width / (window.innerWidth / window.innerHeight) },
    max: { x: width, y: height },
  });
};
resize();
window.addEventListener("resize", resize);

const mouse = Mouse.create(render.canvas);
for (const event of ["wheel", "DOMMouseScroll"]) {
  // @ts-expect-error -- types don't want you to know this exists, but we do
  render.canvas.removeEventListener(event, mouse.mousewheel);
}
render.mouse = mouse;

// @ts-expect-error -- _seed is internal, but we still use it for randomization
Common._seed = Math.random();
Composite.add(engine.world, [
  MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  }),
  ...[
    [width / 2, height * 1.5, height],
    [width * 1.5, 0, height * 4],
    [-width * 0.5, 0, height * 4],
  ].map(([x, y, height]) =>
    Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: { visible: false },
      restitution: 0.6,
    })
  ),
  ...letters.map(({ vertices, texture }) =>
    Bodies.fromVertices(
      Common.random(0, width),
      Common.random(-height, 0),
      [vertices],
      {
        restitution: 0.6,
        render: { sprite: { texture, xScale: 0.25, yScale: 0.25 } },
      }
    )
  ),
  ...Array.from({ length: 10 }, () =>
    Bodies.circle(
      Common.random(0, width),
      Common.random(0, -height),
      Common.random(20, 50),
      { render: { fillStyle: "white" }, restitution: 0.6 }
    )
  ),
]);
