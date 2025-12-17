import puppeteer from "puppeteer";
import crypto from "crypto";

export async function importRecipeFromUrl(url) {
  const browser = await puppeteer.launch({ headless: true });
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

    await page.waitForSelector("img", { timeout: 15000 }).catch(() => null);

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

          if (value) {
            return `${label} ${value} ${unit}`.trim();
          }
          return container.innerText.replace(/\s+/g, " ").trim();
        };

        const nutrientsToScrape = [
          "calories",
          "carbohydrates",
          "protein",
          "fat",
          "saturated_fat",
          "sodium",
          "fiber",
          "sugar",
        ];

        nutrientsToScrape.forEach((slug) => {
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

    return {
      id: crypto.randomUUID(),
      sourceUrl: url,
      ...recipe,
    };
  } catch (err) {
    await browser.close();
    throw new Error("Failed to import recipe: " + err.message);
  }
}
