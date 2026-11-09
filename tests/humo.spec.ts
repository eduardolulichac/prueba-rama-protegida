import { expect, test } from "@playwright/test";
import { abrir, iniciarSesion, vaciarCarrito } from "./support/tienda";

test("el catálogo carga @smoke", async ({ page }) => {
  await abrir(page, "/");
  await expect(page.getByRole("heading", { name: "Catalogo" })).toBeVisible();
  await expect(page.getByTestId("product-list")).toBeVisible();
});

test("iniciar sesión funciona @smoke", async ({ page }) => {
  await iniciarSesion(page);
  await expect(page.getByRole("link", { name: "Mis pedidos" })).toBeVisible();
});

test("compra completa de un producto @smoke", async ({ page }) => {
  await iniciarSesion(page);
  await vaciarCarrito(page);

  await abrir(page, "/products/1");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByRole("status")).toHaveText("Agregado al carrito");

  await abrir(page, "/checkout");
  await page.getByLabel("Direccion de envio").fill("Calle Falsa 123");
  await page.getByRole("button", { name: "Pagar ahora" }).click();

  await expect(page.getByRole("status")).toHaveText("Pago aprobado. Gracias por tu compra.");
  await expect(page.getByTestId("order-status")).toHaveText("Pagado");
});
