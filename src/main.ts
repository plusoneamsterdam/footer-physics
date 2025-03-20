import "pathseg";

import {
  Engine,
  Render,
  Runner,
  Svg,
  Common,
  MouseConstraint,
  Mouse,
  Composite,
  Bodies,
  Body,
} from "matter-js";

// @ts-expect-error -- _seed is internal, but we still use it for randomization
Common._seed = Math.random();
const width = 700;
const height = 1000;

const init = (svgBodies: Body[]) => {
  const engine = Engine.create();
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
    },
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);

  Composite.add(engine.world, svgBodies);

  const bodies = [];
  for (let i = 0; i < 20; i++) {
    bodies.push(
      Bodies.circle(
        Common.random(0, width),
        Common.random(0, -height),
        Common.random(10, 50),
        { render: { fillStyle: "white" } }
      )
    );
  }
  Composite.add(engine.world, bodies);

  Composite.add(engine.world, [
    Bodies.rectangle(width / 2, -height, width, 50, {
      isStatic: true,
      render: {
        visible: false,
      },
    }),
    Bodies.rectangle(width, 0, 50, height * 2, {
      isStatic: true,
      render: {
        visible: false,
      },
    }),
    Bodies.rectangle(width / 2, height, width, 50, {
      isStatic: true,
      render: {
        visible: false,
      },
    }),
    Bodies.rectangle(0, 0, 50, height * 2, {
      isStatic: true,
      render: {
        visible: false,
      },
    }),
  ]);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.05,
      render: {
        visible: false,
      },
    },
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  });
};

fetch("/logo.svg")
  .then((res) => res.text())
  .then((raw) => new window.DOMParser().parseFromString(raw, "image/svg+xml"))
  .then((root) => {
    init(
      [...root.querySelectorAll("path")].map((path, i) =>
        Bodies.fromVertices(i * 75, -400, [Svg.pathToVertices(path, 2)], {
          render: {
            sprite: {
              texture: `/${["P", "l", "u", "s", "O", "n", "e", "R"][i]}.png`,
              xScale: 0.5,
              yScale: 0.5,
            },
          },
        })
      )
    );
  });
