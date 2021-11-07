class RecipeError extends Error {
  constructor(
    message,
    recipeName,
    recipeIngredients,
    recipeInstructions,
    ...params
  ) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecipeError);
    }

    this.name = "RecipeError";
    this.message = message;
    // Custom debugging information
    this.recipeName = recipeName;
    this.recipeIngredients = recipeIngredients;
    this.recipeInstructions = recipeInstructions;
    this.date = new Date();
  }
}

module.exports = RecipeError;
