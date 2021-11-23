const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')

const plugins = [
  autoprefixer,
  tailwindcss(),
]

module.exports = {
  plugins
}