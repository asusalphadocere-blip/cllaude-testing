# Brecha DI · One-pager Tech Week 2026

Página estática (`index.html`) + función `api/content.js`. Los textos editados se guardan fuera del código, protegidos por contraseña (se valida en el servidor).

## Variables de entorno (Vercel → Settings → Environment Variables)
- `EDIT_PASSWORD`: contraseña para editar.
- Persistencia, elige UNA:
  - **A. Upstash Redis**: `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (Vercel → Storage / Marketplace → Upstash Redis).
  - **B. `content.json` en el repo**: `GITHUB_TOKEN` (fine-grained, solo este repo, Contents: Read and write), `GITHUB_REPO` (`owner/repo`) y opcional `GITHUB_BRANCH` (por defecto `main`). Cada guardado hace un commit en `content.json`, por eso los textos viajan con el repo y se ven en el historial de Git.

Tras definir las variables, haz **Redeploy**. Sin ellas, la página muestra los textos originales y la edición avisa que no está configurada.
