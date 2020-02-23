# Multiplayer Version of Conway's Game of Life

This is Conway's Game of Life but many players can join and place their cells. Each player is given a random color and each reborn cell will be given the average color of its live neighbours. Every 2 seconds a generation is passed and your cells will live, die or get reborn depending on the following 4 rules listed here: 

1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
2. Any live cell with two or three live neighbours lives on to the next generation.
3. Any live cell with more than three live neighbours dies, as if by overpopulation.
4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

More information can be found here: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

Deployed on Heroku at: https://blooming-beach-14889.herokuapp.com/

TODOs: More advanced testing with Mocha

## Project setup
Clone the git repository and cd into the project folder then execute `npm install`
If you do not have npm yet, please install node here: https://nodejs.org/en/download/
Node comes bundled with npm
```
npm install
```

Then deploy it locally by running deploy.sh and going to `localhost:4000`

## Other commands for development

### Compiles and hot-reloads for development
Serves the VueJs frontend
```
npm run serve
```

### Starts the server locally
Starts the server at port 4000 with Express
```
npm run dev
```

### Compiles and minifies for production
Builds the VueJs files into /dist
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run tests
```
npm run test
```
