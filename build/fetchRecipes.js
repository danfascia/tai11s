const fs = require("fs");
const axios = require("axios");
const path = require("path");
const recipeScraper = require("./recipe-scraper/scrapers/");

const inputFilepath = path.join(__dirname, "urls.json");
const outputFilepath = path.join(
  __dirname,
  "..",
  "src",
  "_data",
  "recipes.json"
);
const errorFilepath = path.join(__dirname, "..", "src", "_data", "errors.json");
const cachedFilepath = path.join(__dirname, "..", "src", "_data", "recipes");
const recipes = [];
const errors = [];

async function init() {
  const cached = getCachedFilenames();
  const urls = JSON.parse(fs.readFileSync(inputFilepath, { encoding: "utf8" }));
  const formUrls = await getFormSubmittedUrls();
  const allUrls = urls.concat(formUrls);

  const uniqueUrls = [...new Set(allUrls)];
  // loop through the URLs and fetch the content
  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    let recipe;
    try {
      recipe = await recipeScraper(url);
      recipe.url = url;
    } catch (e) {
      console.log(`error scraping recipe for ${url}`, e);
      errors.push({
        url: url,
        error: e,
      });
    }
    if (recipe) {
      let slug = recipe.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      slug += ".json";
      console.log("slug", slug);
      if (!cached.includes(`${cachedFilepath}/${slug}`)) {
        console.log("adding");
        storeData(recipe, `${cachedFilepath}/${slug}`);
        recipes.push(recipe);
      }
    }
  }

  console.log(`fetched ${recipes.length} recipes from URLs`);

  // merge with any user entered recipes
  console.log("combining all recipes");
  const allRecipes = combineFiles(recipes, cached);

  // sort and store everything to be used by 11ty
  console.log("storing data");
  storeData(allRecipes.sort(alphaSort), outputFilepath);
  console.log(`Found ${recipes.length} Recipes`);
  if (errors.length) {
    console.log(`Errors: `, JSON.stringify(errors));
    storeData(errors, errorFilepath);
  }
}

const getCachedFilenames = () => {
  const filenames = [];
  fs.readdirSync(cachedFilepath).forEach((file) => {
    filenames.push(`${cachedFilepath}/${file}`);
  });
  return filenames;
};

const combineFiles = (fetchedRecipes, cached) => {
  console.log("beginning combine process");
  console.log(`Found ${cached.length} cached recipes`);
  const filepaths = cached;
  const arr = fetchedRecipes;

  for (let i = 0; i < filepaths.length; i++) {
    const recipe = fs.readFileSync(filepaths[i]);
    fetchedRecipes.push(JSON.parse(recipe));
  }
  console.log("ending combine process");
  return arr;
};

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const alphaSort = (a, b) => {
  if (a.name > b.name) {
    return 1;
  } else if (a.name < b.name) {
    return -1;
  }
  return 0;
};

const getFormSubmittedUrls = () => {
  return new Promise((resolve, reject) => {
    var config = {
      method: "get",
      url: "https://api.netlify.com/api/v1/forms/617441271a8d270007b8418c/submissions",
      headers: {
        Authorization: "Bearer 9QbGFwiHp8nmCVxUxSE4L-ajtdeO90vXHaY6Pugjtuw",
      },
    };

    axios(config)
      .then((response) => {
        const result = response.data;

        const urls = [];
        for (let i = 0; i < result.length; i++) {
          urls.push(result[i].data.href);
        }
        resolve(urls);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

init();
