const tailwindcss = require('tailwindcss')
const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')

const plugins = [
                  autoprefixer,
                  tailwindcss('./tailwind.config.js'),
                  cssnano({ preset: 'default', }),
                ]

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    purgecss({
      content: ['./dist/**/*.html']
    })
  )
}

module.exports = {
  plugins
}