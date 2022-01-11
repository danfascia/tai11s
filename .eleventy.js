module.exports = function (eleventyConfig) {
  require("dotenv").config();

  const { initializeApp, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  initializeApp({
    credential: cert({
      privateKey: process.env.GOOGLE_API_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.GOOGLE_EMAIL,
      projectId: process.env.GOOGLE_PROJECT_ID,
    }),
  });

  const db = getFirestore();

  /* Pass through - stop eleventy touching */
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addShortcode(
    "recipeList",
    require("./.eleventy/shortcodes/recipeList")
  );

  eleventyConfig.addGlobalData("recipes", async () => {
    const ref = db.collection("recipes");
    const snapshot = await ref.get();
    const recipes = [];
    snapshot.forEach((doc) => {
      recipes.push(doc.data());
    });
    return Promise.resolve(recipes);
  });

  return {
    dir: { input: "src", output: "dist", data: "_data" },
    passthroughFileCopy: true,
    templateFormats: ["njk", "md", "css", "html", "yml"],
    htmlTemplateEngine: "njk",
  };
};
