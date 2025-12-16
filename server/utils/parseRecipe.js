import puppeteer from "puppeteer";
import crypto from "crypto";

export async function importRecipeFromUrl(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
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

      const ingredients =
        Array.from(document.querySelectorAll(".wprm-recipe-ingredients li"))
          .map((el) => el.innerText)
          .filter(Boolean) || [];

      const instructions =
        Array.from(document.querySelectorAll(".wprm-recipe-instructions li"))
          .map((el) => el.innerText)
          .filter(Boolean) || [];

      const imgEl =
        document.querySelector(".wprm-recipe-image img") ||
        document.querySelector("img");
      let image = null;
      if (imgEl) {
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

      return { title, ingredients, instructions, image, servings, time };
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
