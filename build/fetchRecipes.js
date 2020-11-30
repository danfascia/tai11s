const fs = require('fs');
const readline = require('readline');
const path = require('path');
const recipeScraper = require("recipe-scraper");

const inputFilepath = path.join(__dirname, 'urls.txt');
const outputFilepath = path.join(__dirname, '..', 'src', '_data', 'recipes.json');
const errorFilepath = path.join(__dirname,  'errors.json');
const recipes = [];
const errors = [];

async function processLineByLine() {
  const fileStream = fs.createReadStream(inputFilepath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

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
  storeData(recipes.sort((a,b)=> {
    if (a.name > b.name) {
      return 1;
    } else if (a.name < b.name) {
      return -1;
    }
    return 0;
  }), outputFilepath);
  console.log(`Found ${recipes.length} Recipes`)
  if (errors.length) {
    console.log(`Errors: `, JSON.stringify(errors));
    storeData(errors, errorFilepath);
  }
}

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

processLineByLine();