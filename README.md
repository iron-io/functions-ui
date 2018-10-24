# UI for [IronFunctions](https://github.com/iron-io/functions)

# Usage

Just run the container.
`API_URL` is IronFunctions API URL
__NOTE: latest version is broken, please use 0.0.2__

```
docker run --rm -it --link functions:api -p 4000:4000 -e "API_URL=http://api:8080" iron/functions-ui:0.0.2
```

# Screenshots

![ScreenShot routes](https://raw.githubusercontent.com/iron-io/functions-ui/master/docs/screenshots/routes.png)
![ScreenShot run command](https://raw.githubusercontent.com/iron-io/functions-ui/master/docs/screenshots/run.png)

# Development

1) Install dependencies:
```
npm install && npm install -g webpack
```

2) Start Functions API
```
docker run --rm -it --name functions --privileged -v $PWD/data:/app/data -p 8080:8080 iron/functions
```

3) Start web server:
```
PORT=4000 API_URL=http://localhost:8080 npm start
```

* `PORT` - port to run UI on. Optional, 4000 by default
* `API_URL` - Functions API URL. Required

4) Launch automatic asset recompilation:
```
webpack --watch
```

Example:
```
# Launch Functions API
docker run --rm -it --name functions --privileged -v $PWD/data:/app/data -p 8080:8080 iron/functions

# Launch FunctionsUI (use `docker-machine ip` instead of localhost if needed - mac only)
API_URL=http://localhost:8080 npm start

# Launch launch automatic asset recompilation:
webpack --watch

# Open http://localhost:4000/ in browser
```

