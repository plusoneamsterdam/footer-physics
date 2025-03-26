import {
  Engine,
  Render,
  Runner,
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
const isMobile = window.innerWidth < 831;
const width = isMobile ? 300 : 700;
const aspectRatio = window.innerWidth / window.innerHeight;
const height = width / aspectRatio;
const isFloorBouncing = isMobile;

import { letters } from "./letters";

const init = async () => {
  const engine = Engine.create();
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "rgb(0 4 21)",
    },
  });

  Render.run(render);
  Runner.run(Runner.create(), engine);

  const letterBodies = [...letters].map(({ vertices, texture }) => {
    return Bodies.fromVertices(
      Common.random(0, width),
      Common.random(-height, 0),
      [vertices],
      {
        restitution: 0.6,
        render: {
          sprite: {
            texture,
            xScale: 0.25,
            yScale: 0.25,
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
        Common.random(20, 50),
        {
          render: { fillStyle: "white" },
          restitution: 0.6,
        }
      )
    );
  }
  Composite.add(engine.world, circles);

  const bodies = [...letterBodies, ...circles];

  const floor = Bodies.rectangle(width / 2, height * 1.5, width, height, {
    isStatic: true,
    render: { visible: false },
    restitution: 0.6,
  });

  Composite.add(engine.world, [
    floor,
    Bodies.rectangle(width * 1.5, 0, width, height * 4, {
      isStatic: true,
      render: { visible: false },
      friction: 0,
      restitution: 0.6,
    }),
    Bodies.rectangle(-width * 0.5, 0, width, height * 4, {
      isStatic: true,
      render: { visible: false },
      friction: 0,
      restitution: 0.6,
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

    if (isFloorBouncing) {
      const bounceAmount =
        Math.sin(engine.timing.timestamp * 0.0005) * 0.5 + 0.5;
      const bouncePhase = Math.sin(engine.timing.timestamp * 0.002);

      Body.setPosition(
        floor,
        {
          x: width / 2,
          y: height * 1.5 + bounceAmount * (2 * height * (bouncePhase + 1)),
        },
        // @ts-expect-error -- types don't want you to know this exists, but it's essential
        true
      );
    }
  });

  const mouse = Mouse.create(render.canvas);
  // @ts-expect-error -- types don't want you to know this exists, but it's essential
  render.canvas.removeEventListener("wheel", mouse.mousewheel);
  // @ts-expect-error -- types don't want you to know this exists, but it's essential
  render.canvas.removeEventListener("DOMMouseScroll", mouse.mousewheel);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  const aspectRatio = window.innerWidth / window.innerHeight;

  Render.lookAt(render, {
    min: { x: 0, y: height - width / aspectRatio },
    max: { x: width, y: height },
  });

  window.addEventListener("resize", () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    render.options.width = render.canvas.width = window.innerWidth;
    render.options.height = render.canvas.height = window.innerHeight;
    Render.lookAt(render, {
      min: { x: 0, y: height - width / aspectRatio },
      max: { x: width, y: height },
    });
  });
};

init();
