# Pandemic Simulation - Research Project at SUNY Korea

This is a personal project that I am doing under supervision of Alex Kuhn and is a part of CSE487 research project.

## Simulation topic and purpose

I decided to stick with a pandemic simulation on a small city, like Songdo. The main purpose of the project is to display how immunization, social distancing, and other measures affect the spread of the pandemic in an interactive way. However, I do not intend to make future predictions, it will be made solely for educational/entertaining purposes.

## Simulation type & Complexity

To make the project more feasible it's important to start with as little variables as possible and incrementally increase complexity on the go.
As a starting point, the population will be homogeneous with only one characteristic: whether one has a mask or not. Simulation type will be based on the SIR model. Here are some great examples I found on the web:

- [Kevin Simpler - Playable Simulations](https://meltingasphalt.com/interactive/outbreak/)
- [Primer - Epidemic Simulations](https://www.youtube.com/watch?v=7OLpKqTriio&)

## What I have tried so far:

- [Harp.gl (WebGL, Three.js)](https://janarosmonaliev.github.io/research-simulations/harp.gl-test/) - It transforms maps into 3D objects and has a tilt camera if you move your mouse while pressing right click. Unfortunately, it does not have Songdo's map; it also doesn't accept other map data sources. Framework is relatively new, so there is no way to interact with buildings. However, it has great data visualization capabilities.

- [Tangram.js (WebGL)](https://janarosmonaliev.github.io/research-simulations/tangram.js-test/) - This framework is less fancier and does not have 3D functions. But, I have access to buildings that are displayed on the map. Plus, it has good documentation. However, it's not suitable for simulations because open-sourced maps are not reliable for route finding.

## Starting everything from scratch...

I decided to start everything from scratch using [Three.js](https://threejs.org/). I will be implementing a city in a 3D space. So far, I managed to understand how 3D space works in Three.js, along with lighting and shadows. My next goal is to automate city generation with roads. After, I will proceed to simulation process by adding synthetic blobs.

![Image of a Box in 3D Space](https://janarosmonaliev.github.io/research-simulations/src/images/initial-space.png)

### [Live demo](https://janarosmonaliev.github.io/research-simulations/dist/)

## Usage

To be able to run Three.js project as a static website (e.g. on Github Pages), I have used [Webpack](https://webpack.js.org/) and configured development and production bundles:

```bash
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --config=webpack.prod.js",
    "build-dev": "webpack --config=webpack.dev.js",
    "start": "webpack-dev-server --open --config=webpack.dev.js"
  },
```

```cmd
  npm start        # development build (live on localhost)
  npm run build    # static production build
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
