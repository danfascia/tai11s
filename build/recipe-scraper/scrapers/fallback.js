const request = require("request");
const cheerio = require("cheerio");

const RecipeError = require("../helpers/RecipeError");
const RecipeSchema = require("../helpers/recipe-schema");

const fallback = url => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        Recipe.image = $(".wprm-recipe-image img").attr("data-pin-media");
        Recipe.name = $(".wprm-recipe-name").eq(0)
          .text()
          .trim();
        
        if ($('.wprm-recipe-ingredients > .wprm-recipe-ingredient').length) {
          $('.wprm-recipe-ingredients > .wprm-recipe-ingredient')
          .each((i, el) => {
          Recipe.ingredients.push($(el).text().replace(/▢/g, ''));
        });
      } else {
        $('.wprm-recipe-ingredient-group > .wprm-recipe-ingredient')
          .each((i, el) => {
          Recipe.ingredients.push($(el).text().replace(/▢/g, ''));
        });
      }

        $(".wprm-recipe-instruction-text").each((i, el) => {
          Recipe.instructions.push(
            $(el)
              .remove('img')
              .text()
              .replace(/\s\s+/g, "")
          );
        });

        Recipe.time.prep = $(".wprm-recipe-prep_time-minutes").text() + ' ' + $(".wprm-recipe-prep_timeunit-minutes").text();
        Recipe.time.cook = $(".wprm-recipe-cook_time-minutes").text() + ' ' + $(".wprm-recipe-cook_timeunit-minutes").text();
        Recipe.time.total = $(".wprm-recipe-total_time-minutes").text() + ' ' + $(".wprm-recipe-total_timeunit-minutes").text();
        Recipe.servings = $(".wprm-recipe-servings").text();

        if (
          !Recipe.name ||
          !Recipe.ingredients.length ||
          !Recipe.instructions.length
        ) {
          reject(new RecipeError(Recipe.name, Recipe.ingredients, Recipe.instructions));
        } else {
          resolve(Recipe);
        }
      } else {
        console.log('error loading page...', error)
        reject(new Error("Page did not load"));
      }
    });
  });
};

module.exports = fallback;
