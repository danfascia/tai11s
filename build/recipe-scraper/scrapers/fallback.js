const request = require("request");
const cheerio = require("cheerio");

const RecipeError = require("../helpers/RecipeError");
const RecipeSchema = require("../helpers/recipe-schema");

const getImage = ($) => {
  let image;
  image = $(".wprm-recipe-image img").attr("data-pin-media");
  if ($(".tasty-recipes-image").length) {
    image = $(".tasty-recipes-image img").attr("src");
  }
  return image;
};

const getName = ($) => {
  let name = "";
  name = $(".wprm-recipe-name").eq(0).text().trim();
  if ($(".tasty-recipes-title").length) {
    name = $(".tasty-recipes-title").eq(0).text().trim();
  }
  if ($(".ERSName").length) {
    name = $(".ERSName").eq(0).text().trim();
  }
  return name;
};

const getTimes = ($) => {
  const time = {
    prep: "",
    cook: "",
    total: "",
  };

  time.prep =
    $(".wprm-recipe-prep_time-minutes").text() +
    " " +
    $(".wprm-recipe-prep_timeunit-minutes").text();
  time.cook =
    $(".wprm-recipe-cook_time-minutes").text() +
    " " +
    $(".wprm-recipe-cook_timeunit-minutes").text();
  time.total =
    $(".wprm-recipe-total_time-minutes").text() +
    " " +
    $(".wprm-recipe-total_timeunit-minutes").text();

  return time;
};

const getInstructions = ($) => {
  const instructions = [];

  $(".wprm-recipe-instruction-text").each((i, el) => {
    instructions.push($(el).remove("img").text().replace(/\s\s+/g, ""));
  });
  $(".ERSInstructions > ol > li.instruction").each((i, el) => {
    instructions.push($(el).remove("img").text().replace(/\s\s+/g, ""));
  });
  $(".tasty-recipes-instructions > ol").each((i, el) => {
    // get header
    instructions.push($(el).prev().text());
    // steps
    const steps = $(el)
      .find("li")
      .each((j, step) => {
        instructions.push($(step).text().replace(/▢/g, ""));
      });
  });

  return instructions;
};

const getIngredients = ($) => {
  const ingredients = [];

  if ($(".wprm-recipe-ingredients > .wprm-recipe-ingredient").length) {
    $(".wprm-recipe-ingredients > .wprm-recipe-ingredient").each((i, el) => {
      ingredients.push($(el).text().replace(/▢/g, ""));
    });
  } else if ($(".ERSIngredients > ul > li.ingredient").length) {
    $(".ERSIngredients > ul > li.ingredient").each((i, el) => {
      ingredients.push($(el).text().replace(/▢/g, ""));
    });
  } else {
    $(".wprm-recipe-ingredient-group > .wprm-recipe-ingredient").each(
      (i, el) => {
        ingredients.push($(el).text().replace(/▢/g, ""));
      }
    );
  }
  if ($(".tasty-recipes-ingredients-detail > ul")) {
    $(".tasty-recipes-ingredients-detail > ul").each((i, el) => {
      // get header
      ingredients.push($(el).prev().text());
      // steps
      const steps = $(el)
        .find("li")
        .each((j, step) => {
          ingredients.push($(step).text().replace(/▢/g, ""));
        });
    });
  }

  return ingredients;
};

const getServings = ($) => {
  let servings =
    $(".wprm-recipe-servings").text() || $(".tasty-recipes-yield").text();
  return servings > 0 ? servings : null;
};

const fallback = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        Recipe.Image = getImage($);
        Recipe.name = getName($);
        Recipe.ingredients = getIngredients($);
        Recipe.instructions = getInstructions($);
        Recipe.time = getTimes($);
        Recipe.servings = getServings($);

        // verification
        if (
          !Recipe.name ||
          !Recipe.ingredients.length ||
          !Recipe.instructions.length
        ) {
          reject(
            new RecipeError(
              "Failed to gather important details",
              Recipe.name,
              Recipe.ingredients,
              Recipe.instructions
            )
          );
        } else {
          resolve(Recipe);
        }
      } else {
        console.log("error loading page...", error);
        reject(new RecipeError("Page did not load"));
      }
    });
  });
};

module.exports = fallback;
