# Brecha DI · One-pager Tech Week 2026

Página estática (`index.html`) + función `api/content.js` que guarda los textos editados en Upstash Redis.

## Variables de entorno (Vercel → Settings → Environment Variables)
- `EDIT_PASSWORD`: contraseña para editar textos (se valida en el servidor).
- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`: se crean al conectar Upstash Redis desde Vercel → Storage / Marketplace.

## Despliegue
1. Subir este repo a GitHub.
2. En Vercel: Add New → Project → importar el repo (sin framework, sin build).
3. Conectar Upstash Redis y definir `EDIT_PASSWORD`; redeploy.

Sin las variables, la página se ve igual con los textos originales, pero no aparece el botón de edición.
