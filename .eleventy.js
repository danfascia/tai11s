module.exports = function (eleventyConfig) {
  /* Pass through - stop eleventy touching */
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addShortcode(
    "recipeList",
    require("./.eleventy/shortcodes/recipeList")
  );

  return {
    dir: { input: "src", output: "dist", data: "_data" },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", "css", "html", "yml"],
    htmlTemplateEngine: "njk",
  };
};
