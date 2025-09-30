import { chromium } from "playwright";
import waitOn from "wait-on";
import { spawn } from "child_process";

async function run() {
  const server = spawn("npm", ["run", "preview", "--", "--port", "4173"], {
    stdio: "inherit"
  });

  try {
    await waitOn({ resources: ["http://127.0.0.1:4173"], timeout: 30000 });

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("http://127.0.0.1:4173/");
    const learningBiteVisible = await page.locator("text=Learning Bite").isVisible();
    const hebrewVisible = await page.locator("text=בְּרֵאשִׁית").isVisible();

    if (!learningBiteVisible || !hebrewVisible) {
      throw new Error("Today screen did not render expected content");
    }

    await page.locator('[role="tab"]', { hasText: "Texts" }).click();
    await page.locator("text=Genesis 1:1").waitFor();
    await page.locator('[role="tab"]', { hasText: "Practice" }).click();
    await page.locator("text=Alef-Bet & Reading Lab").waitFor();

    await browser.close();
  } finally {
    server.kill();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
