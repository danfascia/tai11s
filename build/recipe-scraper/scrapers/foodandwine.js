const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../helpers/recipe-schema");
const RecipeError = require("../helpers/RecipeError");

const foodAndWine = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes("foodandwine.com/recipes/")) {
      reject(
        new RecipeError("url provided must include 'foodandwine.com/recipes/'")
      );
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);

          Recipe.image = $("meta[property='og:image']").attr("content");
          Recipe.name = $("h1.headline").text();

          $(".ingredients-section")
            .find(".ingredients-item-name")
            .each((i, el) => {
              Recipe.ingredients.push($(el).text().trim());
            });

          $(".recipe-instructions")
            .find("p")
            .each((i, el) => {
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

module.exports = foodAndWine;
