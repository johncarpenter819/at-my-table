import "dotenv/config";
import puppeteer from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

console.log("--- ENV CHECK ---");
console.log(
  "Browserless Key:",
  process.env.BROWSERLESS_API_KEY ? "FOUND" : "MISSING"
);
console.log("Supabase URL:", process.env.SUPABASE_URL ? "FOUND" : "MISSING");
console.log("-----------------");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function importRecipeFromUrl(url, userId) {
  const { data: existingRecipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("source_url", url)
    .single();

  if (existingRecipe) {
    console.log("Recipe found in DB. Returning cached version.");
    return existingRecipe;
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
  });

  const page = await browser.newPage();

  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle2" });

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
    });

    await page.waitForSelector("img", { timeout: 20000 }).catch(() => null);

    const recipe = await page.evaluate(() => {
      const title =
        document.querySelector("h1")?.innerText || "Untitled Recipe";

      const ingredients = [];
      const ingredientGroups = document.querySelectorAll(
        ".wprm-recipe-ingredient-group"
      );

      if (ingredientGroups.length > 0) {
        ingredientGroups.forEach((group) => {
          const groupName = group
            .querySelector(".wprm-recipe-group-name")
            ?.innerText.trim();
          if (groupName) {
            ingredients.push(`**${groupName}**`);
          }
          const items = Array.from(
            group.querySelectorAll(".wprm-recipe-ingredient")
          )
            .map((el) => el.innerText.trim())
            .filter(Boolean);
          ingredients.push(...items);
        });
      } else {
        const items = Array.from(
          document.querySelectorAll(".wprm-recipe-ingredients li")
        )
          .map((el) => el.innerText.trim())
          .filter(Boolean);
        ingredients.push(...items);
      }

      const instructions =
        Array.from(document.querySelectorAll(".wprm-recipe-instructions li"))
          .map((el) => el.innerText)
          .filter(Boolean) || [];

      const ogImage = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content");
      const imgEl =
        document.querySelector(".wprm-recipe-image img") ||
        document.querySelector("img");

      let image = ogImage || null;
      if (!image && imgEl) {
        image =
          imgEl.getAttribute("src") ||
          imgEl.getAttribute("data-lazy-src") ||
          imgEl
            .getAttribute("data-lazy-srcset")
            ?.split(",")[0]
            .trim()
            .split(" ")[0] ||
          imgEl.getAttribute("data-src") ||
          imgEl.getAttribute("srcset")?.split(",")[0].trim().split(" ")[0] ||
          null;
      }

      const servings =
        document.querySelector(".wprm-recipe-servings")?.innerText || null;
      const time =
        document.querySelector(".wprm-recipe-time")?.innerText || null;

      const nutrition = {};
      const nutritionContainer = document.querySelector(
        ".wprm-nutrition-label-container"
      );

      if (nutritionContainer) {
        const getNutrient = (slug) => {
          const container = nutritionContainer.querySelector(
            `.wprm-nutrition-label-text-nutrition-container-${slug}`
          );
          if (!container) return null;
          const label =
            container
              .querySelector(".wprm-nutrition-label-label")
              ?.innerText.trim() || "";
          const value =
            container
              .querySelector(".wprm-nutrition-label-value")
              ?.innerText.trim() || "";
          const unit =
            container
              .querySelector(".wprm-nutrition-label-unit")
              ?.innerText.trim() || "";
          if (value) return `${label} ${value} ${unit}`.trim();
          return container.innerText.replace(/\s+/g, " ").trim();
        };

        [
          "calories",
          "carbohydrates",
          "protein",
          "fat",
          "saturated_fat",
          "sodium",
          "fiber",
          "sugar",
        ].forEach((slug) => {
          const val = getNutrient(slug);
          if (val) nutrition[slug] = val;
        });
      }

      return {
        title,
        ingredients,
        instructions,
        image,
        servings,
        time,
        nutrition,
      };
    });

    if (!recipe.image || recipe.image.includes("<svg")) {
      const firstImg = await page.evaluate(() => {
        const imgEl = document.querySelector("img");
        return imgEl?.src || null;
      });
      if (firstImg) recipe.image = firstImg;
    }

    await browser.close();

    // const scrapedData = await page.evaluate(() => {
    //   const title =
    //     document.querySelector("h1")?.innerText || "Untitled Recipe";
    //   return {
    //     title,
    //     ingredients: [],
    //     image: null,
    //     servings: null,
    //     time: null,
    //     nutrition: {},
    //   };
    // });

    const { data: newRecipe, error: saveError } = await supabase
      .from("recipes")
      .insert([
        {
          user_id: userId,
          title: recipe.title,
          source_url: url,
          image_url: recipe.image,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          servings: recipe.servings,
          prep_time: recipe.time,
          nutrition: recipe.nutrition,
        },
      ])
      .select()
      .single();

    if (saveError) throw new Error("Supabase Save Error: " + saveError.message);

    return newRecipe;
  } catch (err) {
    if (browser) await browser.close();
    throw new Error("Failed to import recipe: " + err.message);
  }
}
