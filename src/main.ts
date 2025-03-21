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
  Events,
} from "matter-js";

// @ts-expect-error -- _seed is internal, but we still use it for randomization
Common._seed = Math.random();
const width = 700;
const height = 1000;

const init = async () => {
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

  const letters = [
    ...new window.DOMParser()
      .parseFromString(await (await fetch("/logo.svg")).text(), "image/svg+xml")
      .querySelectorAll("path"),
  ].map((path, i) => ({
    vertices: Svg.pathToVertices(path, 2),
    texture: `/${["P", "l", "u", "s", "O", "n", "e", "R"][i]}.png`,
  }));

  const letterBodies = [...letters].map(({ vertices, texture }) => {
    return Bodies.fromVertices(
      Common.random(0, width),
      Common.random(-height, 0),
      [vertices],
      {
        render: {
          sprite: {
            texture,
            xScale: 0.5,
            yScale: 0.5,
          },
        },
      }
    );
  });
  Composite.add(engine.world, letterBodies);

  const circles = [];
  for (let i = 0; i < 10; i++) {
    circles.push(
      Bodies.circle(
        Common.random(0, width),
        Common.random(0, -height),
        Common.random(10, 50),
        {
          render: { fillStyle: "white" },
        }
      )
    );
  }
  Composite.add(engine.world, circles);

  const bodies = [...letterBodies, ...circles];

  const floor = Bodies.rectangle(width / 2, height * 1.5, width, height, {
    isStatic: true,
    render: { visible: false },
    angularSpeed: 0,
    inertia: Infinity,
  });

  Composite.add(engine.world, [
    floor,
    Bodies.rectangle(width * 1.5, 0, width, height * 4, {
      isStatic: true,
      render: { visible: false },
      friction: 0,
    }),
    Bodies.rectangle(-width * 0.5, 0, width, height * 4, {
      isStatic: true,
      render: { visible: false },
      friction: 0,
    }),
  ]);

  Events.on(engine, "beforeUpdate", function () {
    bodies.forEach((body) => {
      if (body.position.y > height * 4) {
        Body.setPosition(body, { x: body.position.x, y: -height });
      }
      if (body.position.x < 0 || body.position.x > width) {
        Body.setPosition(body, {
          x: width / 2,
          y: body.position.y,
        });
      }
    });

    const bounceAmount = Math.sin(engine.timing.timestamp * 0.0005) * 0.5 + 0.5;
    const bouncePhase = Math.sin(engine.timing.timestamp * 0.002);

    Body.setPosition(
      floor,
      {
        x: width / 2,
        y: height * 1.5 + bounceAmount * (height * (bouncePhase + 1)),
      },
      // @ts-expect-error -- types don't want you to know this exists, but it's essential
      true
    );
  });

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Render.lookAt(render, {
    min: { x: 0, y: height / 2 },
    max: { x: width, y: height },
  });
};

init();
