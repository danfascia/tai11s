const fs = require("fs");
const readline = require("readline");
const path = require("path");
const recipeScraper = require("./recipe-scraper/scrapers/");

const inputFilepath = path.join(__dirname, "urls.txt");
const tmpFilepath = path.join(__dirname, "recipes.json");
const outputFilepath = path.join(
  __dirname,
  "..",
  "src",
  "_data",
  "recipes.json"
);
const errorFilepath = path.join(__dirname, "errors.json");
const userEnteredFilepath = path.join(
  __dirname,
  "..",
  "src",
  "_data",
  "user-uploaded"
);
const recipes = [];
const errors = [];

async function init() {
  // get the URLs from the urls.txt file
  const fileStream = fs.createReadStream(inputFilepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // loop through the URLs and fetch the content
  for await (const line of rl) {
    let recipe;
    try {
      recipe = await recipeScraper(line);
    } catch (e) {
      console.log(`error scraping recipe for ${line}`, e);
      recipe = null;
      errors.push(line);
    }
    if (recipe) {
      recipes.push(recipe);
    }
  }

  console.log(`fetched ${recipes.length} recipes from URLs`)

  // merge with any user entered recipes
  console.log('combining all recipes');
  const allRecipes = combineFiles(recipes);

  // sort and store everything to be used by 11ty
  console.log('storing data');
  storeData(
    allRecipes.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }
      return 0;
    }),
    outputFilepath
  );
  console.log(`Found ${recipes.length} Recipes`);
  if (errors.length) {
    console.log(`Errors: `, JSON.stringify(errors));
    storeData(errors, errorFilepath);
  }
}

const getUserEnteredFilenames = () => {
  const filenames = [];
  fs.readdirSync(userEnteredFilepath).forEach((file) => {
    filenames.push(`${userEnteredFilepath}/${file}`);
  });
  return filenames;
};

const combineFiles = (fetchedRecipes) => {
  console.log('beginning combine process');
  const userEntered = getUserEnteredFilenames();
  console.log(`Found ${userEntered.length} user-entered recipes`)
  const filepaths = userEntered;
  const arr = fetchedRecipes;

  for (let i = 0; i < filepaths.length; i++) {
    const recipe = fs.readFileSync(filepaths[i])
    fetchedRecipes.push(JSON.parse(recipe));
  }
  console.log('ending combine process');
  return arr;
};

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

init();
