# web-terminal


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Development setup

### With a real Shard

1. Create a Shard
2. Enter its domain as the proxy target in `vue.config.js`
3. Make sure that the `pathRewrite` option is disabled
4. Start the proxy together with the hot-reloading server with `npm run serve`

### Using shard_core on dev machine

1. Start shard_core, look for instructions in its readme on how to do that
2. Make sure that `http://127.0.0.1:8000` is the proxy target in `vue.config.js`
3. Make sure that the `pathRewrite` option is enabled
4. Start the proxy together with the hot-reloading server with `npm run serve`
5. Get a pairing code at http://127.0.0.1:8000/protected/terminals/pairing-code
