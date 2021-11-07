const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../helpers/recipe-schema");
const RecipeError = require("../helpers/RecipeError");

const myRecipes = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes("myrecipes.com/recipe")) {
      reject(
        new RecipeError("url provided must include 'myrecipes.com/recipe'")
      );
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);

          Recipe.image = $("meta[property='og:image']").attr("content");
          Recipe.name = $("h1.headline").text().trim();

          $(".ingredients-item").each((i, el) => {
            const ingredient = $(el).text().replace(/\s\s+/g, " ").trim();
            Recipe.ingredients.push(ingredient);
          });
          $($(".instructions-section-item").find("p")).each((i, el) => {
            Recipe.instructions.push($(el).text());
          });

          let metaBody = $(".recipe-meta-item-body");

          Recipe.time.active = metaBody.first().text().trim();
          Recipe.time.total = $(metaBody.get(1)).text().trim();

          Recipe.servings = metaBody.last().text().trim();

          if (
            !Recipe.name ||
            !Recipe.ingredients.length ||
            !Recipe.instructions.length
          ) {
            reject(new RecipeError("No recipe found on page"));
          } else {
            resolve(Recipe);
          }
        } else {
          reject(new RecipeError("No recipe found on page"));
        }
      });
    }
  });
};

module.exports = myRecipes;
