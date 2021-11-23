const axios = require("axios");
const cheerio = require("cheerio");

const RecipeError = require("../helpers/RecipeError");
const RecipeSchema = require("../helpers/recipe-schema");

const getImage = ($) => {
  const selectors = [".wprm-recipe-image img", ".tasty-recipes-image img"];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if ($(selector).length) {
      return $(selector).eq(0).attr("src");
    }
  }
  return "";
};

const getName = ($) => {
  const selectors = [
    ".recipe-title",
    ".wprm-recipe-name",
    ".ERSName",
    ".tasty-recipes-title",
    ".mv-create-title",
    ".recipeHeader h1",
    // fallback
    "h1",
  ];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if ($(selector).length) {
      return $(selector).eq(0).text().trim();
    }
  }
  return "";
};

const getPrepTime = ($) => {
  const selectors = [
    ".wprm-recipe-prep_time-minutes",
    ".wprm-recipe-prep_timeunit-minutes",
    ".mv-create-time-prep .mv-time-minutes",
    "[itemprop='prepTime'] > strong",
  ];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if ($(selector).length) {
      return $(selector).eq(0).text();
    }
  }
  return "";
};

const getCookTime = ($) => {
  const selectors = [
    ".wprm-recipe-cook_time-minutes",
    ".wprm-recipe-cook_timeunit-minutes",
    ".mv-create-time-active .mv-time-minutes",
    "[itemprop='cookTime'] > strong",
  ];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if ($(selector).length) {
      return $(selector).eq(0).text();
    }
  }
  return "";
};

const getTotalTime = ($) => {
  const selectors = [
    ".wprm-recipe-total_time-minutes",
    ".wprm-recipe-total_timeunit-minutes",
    ".recipe-time + .recipe-yield-value",
    ".tasty-recipes-total-time",
    ".mv-create-time-total .mv-time-minutes",
  ];
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if ($(selector).length) {
      return $(selector).eq(0).text();
    }
  }
  return "";
};

const getTimes = ($) => {
  return {
    prep: getPrepTime($),
    cook: getCookTime($),
    total: getTotalTime($),
  };
};

const getInstructions = ($) => {
  const instructions = [];
  const selectors = [
    ".wprm-recipe-instruction-text",
    ".ERSInstructions > ol > li.instruction",
    "ol.recipe-steps > li",
    ".tasty-recipes-instructions ol > li",
    ".mv-create-instructions > p",
    ".recipeStep p",
    ".directions p",

    // fallback
    "ul > li",
  ];

  for (let i = 0; i < selectors.length; i++) {
    if (instructions.length) break;
    const selector = selectors[i];
    $(selector).each((i, el) => {
      instructions.push($(el).remove("img").text().replace(/\s\s+/g, ""));
    });
  }

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
  const selectors = [
    ".wprm-recipe-ingredients > .wprm-recipe-ingredient",
    ".ERSIngredients > ul > li.ingredient",
    "ul.recipe-ingredients",
    ".wprm-recipe-ingredient-group > .wprm-recipe-ingredient",
    ".tasty-recipes-ingredients ul > li",
    ".mv-create-ingredients ul > li",
    "#recipeIngredients ul > li",
    ".ingredients ul > li",
    // fallback
    "ol > li",
  ];

  for (let i = 0; i < selectors.length; i++) {
    if (ingredients.length) break;
    const selector = selectors[i];
    $(selector).each((i, el) => {
      ingredients.push($(el).text().replace(/▢/g, ""));
    });
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
  let servings = 0;
  const selectors = [
    ".wprm-recipe-servings",
    ".tasty-recipes-yield",
    ".recipe-yield + .recipe-yield-value",
    ".tasty-recipes-yield",
    ".mv-create-yield",
    "[itemprop='recipeYield']",
  ];
  selectors.forEach((selector) => {
    servings = $(selector).text();
  });

  return servings > 0 ? servings : null;
};

const fallback = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
        },
      })
      .then(function (response) {
        // handle success
        const $ = cheerio.load(response.data);

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
      })
      .catch(function (error) {
        // handle error
        console.log("error loading page...", error);
        reject(new RecipeError("Page did not load"));
      });
  });
};

module.exports = fallback;
