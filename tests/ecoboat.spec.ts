import { expect, test } from "@playwright/test";

async function canvasStats(page: import("@playwright/test").Page) {
  return page.locator("canvas").first().evaluate((canvas) => {
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    if (!gl) {
      return { ok: false, width: canvas.width, height: canvas.height, bright: 0, changes: 0 };
    }

    const context = gl as WebGLRenderingContext;
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
      bright,
      changes,
    };
  });
}

test("starts a playable round and renders a nonblank 3D scene", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ecoboat" })).toBeVisible();

  await page.getByRole("button", { name: "Начать раунд" }).click();
  await expect(page.getByText("Очки")).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();

  await page.keyboard.down("w");
  await page.waitForTimeout(500);
  await page.keyboard.up("w");
  await page.waitForTimeout(700);

  await expect.poll(async () => (await canvasStats(page)).ok).toBe(true);
});
