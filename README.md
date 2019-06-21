# Tai11s - the Eleventy + Tailwind CSS starter

Tai11s is a minimal starting point for Eleventy projects using

Features:
- [11ty](https://www.11ty.io/)
- [Sass/SCSS](https://github.com/sass/node-sass)
- [Webpack](https://webpack.js.org/)
- [Babel](https://babeljs.io/)
- [light-server](https://github.com/txchen/light-server)
- [PostCSS](https://postcss.org/)
- [CSSnano](https://cssnano.co/)
- [Autoprefixer](https://github.com/postcss/autoprefixer)

## Credit
This is a fork of a starter repo originally created by [Ian Rose](https://github.com/ianrose/deventy/).

I have added

- Tailwind CSS config build chain (NB tailwind.config.js is only compiled at each hard run of the script so you will need to quit and re-run `npm run dev` if you make changes during local development)
- Purge CSS conditionally run at build, but not during local development

## Getting Started

Clone this repo and install all dependencies using npm:

### How to use in development

```
$ npm run dev
```
 And in debug mode:
 
```
$ npm run dev:debug
```

You can view the rendered site at the given access URL served up by light-server:
```
$ light-server is listening at http://localhost:4000
```

The local url is configured in `.lightserverrc`

### To build ready for production

```
npm run build
```

Tai11s will build and optimise your code ready for deployment

- Pack and optimise javascript
- Build tailwind CSS from config, compile your Sass and run PurgeCSS to remove unusued classes based on the output `dist` folder

## BONUS: Travis Github Pages deployment script

`.travis.yml` can be modified to suit your own needs. This simple script will build from a named branch and deploy to Github Pages via your [Travis CI](https://travis-ci.org/) account. 

Store your Github Token securely in the Travis control panel
