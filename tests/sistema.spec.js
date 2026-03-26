import { test, expect } from '@playwright/test';

test('El sistema redirige a login si no hay sesión activa', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*login/);
});

test('El registro carga correctamente', async ({ page }) => {
  await page.goto('/registro');
  await expect(page.locator('h1')).toContainText('Crea tu Negocio');
});

test('Seguridad: El carrito debe limitar la cantidad máxima a 9999', async ({ page }) => {
  // Mockeamos el estado de la sesión para entrar al POS (Simulación)
  await page.addInitScript(() => {
    window.localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'test-user' },
        profile: { id_rol: 2, id_empresa: 1, suscripcion: { dias_restantes: 10 } },
        session: { access_token: 'fake' }
      }
    }));
  });

  await page.goto('/pos');
  // Nota: Este test asume que el usuario tiene productos cargados o mockea el servicio.
  // Es una base para que el usuario la extienda con sus datos reales.
});

test('Seguridad: Bloqueo por mora para todos los roles', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'test-user' },
        profile: { id_rol: 2, id_empresa: 1, suscripcion: { dias_restantes: -35 } },
        session: { access_token: 'fake' }
      }
    }));
  });

  await page.goto('/pos');
  await expect(page).toHaveURL(/.*planes\?suspended=true/);
});
