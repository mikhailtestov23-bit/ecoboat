import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const targetUrl = process.env.ECOBOAT_URL ?? "http://127.0.0.1:5173";
const viewports = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

await mkdir("artifacts", { recursive: true });

const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
    });
    const page = await context.newPage();

    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Начать раунд" }).click();
    await page.waitForSelector("canvas");
    await page.waitForTimeout(1200);

    const stats = await page.locator("canvas").first().evaluate((canvas) => {
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");

      if (!gl) {
        return { ok: false, reason: "no-webgl", width: canvas.width, height: canvas.height };
      }

      const context = gl;
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      context.readPixels(0, 0, canvas.width, canvas.height, context.RGBA, context.UNSIGNED_BYTE, pixels);

      let bright = 0;
      let changes = 0;
      let samples = 0;
      let previous = -1;
      const stride = 4 * 97;

      for (let index = 0; index < pixels.length; index += stride) {
        const sum = pixels[index] + pixels[index + 1] + pixels[index + 2];
        if (pixels[index + 3] > 0 && sum > 30) {
          bright += 1;
        }
        if (previous >= 0 && Math.abs(sum - previous) > 10) {
          changes += 1;
        }
        previous = sum;
        samples += 1;
      }

      return {
        ok: bright > samples * 0.6 && changes > samples * 0.08,
        width: canvas.width,
        height: canvas.height,
        samples,
        bright,
        changes,
      };
    });

    await page.screenshot({ path: `artifacts/ecoboat-${viewport.name}.png`, fullPage: true });
    await context.close();

    if (!stats.ok) {
      throw new Error(`Canvas check failed for ${viewport.name}: ${JSON.stringify(stats)}`);
    }

    console.log(`${viewport.name}: ${JSON.stringify(stats)}`);
  }
} finally {
  await browser.close();
}
