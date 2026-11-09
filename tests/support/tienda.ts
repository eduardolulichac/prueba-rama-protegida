import { expect, type Page } from "@playwright/test";

/**
 * Abre una ruta y espera a que la barra de escenario de la Arena esté lista.
 * Así, con un escenario activo, los elementos ya tienen su forma final (módulo 1.2, paso 9).
 */
export async function abrir(page: Page, ruta: string) {
  await page.goto(ruta);
  await expect(page.getByTestId("arena-ready")).toBeAttached();
}

/** Entra con una cuenta de práctica. Por defecto: Ana. */
export async function iniciarSesion(page: Page, correo = "ana@arena.test", clave = "Cliente123!") {
  await abrir(page, "/login");
  await page.getByLabel("Correo").fill(correo);
  await page.getByLabel("Contrasena").fill(clave);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByTestId("user-name")).toBeVisible();
}

/** Agrega un producto al carrito desde su ficha. Por defecto: 1 unidad de Auriculares BT (id 1). */
export async function agregarProducto(page: Page, cantidad = 1, productoId = 1) {
  await abrir(page, `/products/${productoId}`);
  await page.getByLabel("Cantidad").fill(String(cantidad));
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByRole("status")).toHaveText("Agregado al carrito");
}

/**
 * Paga desde /checkout con la tarjeta precargada (aprobada).
 * Pasa `tarjeta` para usar otra, por ejemplo la rechazada "4000 0000 0000 0002".
 */
export async function pagar(page: Page, direccion = "Calle Falsa 123", tarjeta?: string) {
  await abrir(page, "/checkout");
  await page.getByLabel("Direccion de envio").fill(direccion);
  if (tarjeta) await page.getByLabel("Numero de tarjeta").fill(tarjeta);
  await page.getByRole("button", { name: "Pagar ahora" }).click();
}

/**
 * Deja vacío el carrito de la persona que ya inició sesión: quita el cupón y cada línea
 * desde la página /cart, como lo haría una persona.
 */
export async function vaciarCarrito(page: Page): Promise<void> {
  await abrir(page, "/cart");
  const quitarCupon = page.getByRole("button", { name: "Quitar cupon" });
  const quitarLinea = page.getByRole("button", { name: "Quitar", exact: true });

  // Espera a que el carrito cargue (con líneas o vacío) antes de contar nada.
  await expect(quitarLinea.first().or(page.getByTestId("cart-empty"))).toBeVisible();

  if (await quitarCupon.isVisible()) {
    await quitarCupon.click();
    await expect(quitarCupon).toHaveCount(0);
  }

  const lineas = await quitarLinea.count();
  for (let i = 0; i < lineas; i++) {
    await quitarLinea.first().click();
    await expect(quitarLinea).toHaveCount(lineas - i - 1);
  }
  await expect(page.getByTestId("cart-empty")).toBeVisible();
}
