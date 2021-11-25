function Recipe() {
  this.name = "";
  this.ingredients = [];
  this.instructions = [];
  this.tags = [];
  this.time = {
    prep: "",
    cook: "",
    active: "",
    inactive: "",
    ready: "",
    total: "",
  };
  this.servings = "";
  this.image = "";
  this.slug = "";
}

module.exports = Recipe;
