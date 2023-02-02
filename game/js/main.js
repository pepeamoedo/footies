class Canvas {
  constructor(parent = document.body, width = 400, height = 400) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
  }
  drawCircle(actor) {
    this.ctx.beginPath();
    this.ctx.arc(
      actor.position.x,
      actor.position.y,
      actor.radius,
      0,
      Math.PI * 2
    );
    this.ctx.closePath();
    this.ctx.fillStyle = actor.color;
    this.ctx.fill();
  }

  sync(state) {
    this.clearDisplay();
    this.drawActors(state.actors);
  }

  clearDisplay() {
    /**
     * If the rgba opacity is set to 1, there
     * will be no trail. The lower the opacity,
     * the longer the trail.
     **/
    this.ctx.fillStyle = "rgba(255, 255, 255, .5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawActors(actors) {
    for (let actor of actors) {
      if (actor.type === "circle") {
        this.drawCircle(actor);
      }
    }
  }
};

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  };

  /**
   * Returning a new Vector creates immutability
   * and allows chaining. These properties are
   * extremely useful with the complex formulas
   * we'll be using.
   **/
  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  };

  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  };

  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  };

  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y;
  };

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  };

  get direction() {
    return Math.atan2(this.x, this.y);
  };
};

class State {
  constructor(display, actors) {
    this.display = display;
    this.actors = actors;
  }

  update(time) {

    /**
     * Provide an update ID to let actors
     * update other actors only once.
     **/
    const updateId = Math.floor(Math.random() * 1000000);
    const actors = this.actors.map(actor => {
      return actor.update(this, time, updateId);
    });
    return new State(this.display, actors);
  }
}

class Ball {
  constructor(config) {
    Object.assign(
      this,
      {
        type: "circle",
        position: new Vector(20, 20),
        velocity: new Vector(5, 3),
        radius: 10,
        color: "red",
      },
      config
    );
  }

  update(state, time, updateId) {
    // Check if hitting left or right of display
    if (this.position.x >= state.display.canvas.width || this.position.x <= 0) {
      this.velocity = new Vector(-this.velocity.x, this.velocity.y);
    }

    // Check if hitting top or bottom of display
    if (
      this.position.y >= state.display.canvas.height ||
      this.position.y <= 0
    ) {
      this.velocity = new Vector(this.velocity.x, -this.velocity.y);
    }

    return new Ball({
      ...this,
      position: this.position.add(this.velocity),
    });
  }
}

const runAnimation = (animation) => {
  let lastTime = null;
  const frame = (time) => {
    if (lastTime !== null) {
      const timeStep = Math.min(100, time - lastTime) / 1000;

      // return false from animation to stop
      if (animation(timeStep) === false) {
        return;
      }
    }
    lastTime = time;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

const display = new Canvas();
const ball = new Ball();
const actors = [ball];
let state = new State(display, actors);
runAnimation((time) => {
  state = state.update(time);
  display.sync(state);
});