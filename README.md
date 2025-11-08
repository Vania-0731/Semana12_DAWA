# Biblioteca con Next.js y Prisma

Aplicación de ejemplo para gestionar autores y libros usando **Next.js (App Router)** y **Prisma ORM**. Incluye CRUD completo de autores y libros, filtros, paginación y estadísticas agregadas.

## Clonar el proyecto

```bash
git clone https://github.com/Vania-0731/Semana12_DAWA.git
cd Semana12_DAWA
```

## Requisitos

- Node.js 20+
- PostgreSQL o base compatible con la cadena de conexión de Prisma
- npm (o el gestor de paquetes de tu preferencia)

## Instalación

```bash
npm install
```

## Configuración de ambiente

1. Copia el archivo `.env.example` y renómbralo a `.env`.
2. Ajusta la variable `DATABASE_URL` con las credenciales de tu base de datos PostgreSQL.

```bash
cp .env.example .env
```

3. Genera el cliente de Prisma:

```bash
npx prisma generate
```

4. Crea o migra la base de datos según tu flujo (por ejemplo, usando `prisma migrate` o importando datos manualmente).

## Scripts disponibles

```bash
npm run dev     # Levanta el servidor en http://localhost:3000
npm run build   # Compila la aplicación para producción
npm run start   # Sirve la versión compilada
npm run lint    # Ejecuta ESLint
```

## Estructura destacada

```
src/
  app/
    page.tsx                 # Dashboard de autores
    books/page.tsx           # Catálogo y filtros de libros
    authors/[id]/page.tsx    # Detalle y estadísticas de autor
    api/                     # API Routes (autores y libros)
  components/
    Modal.tsx                # Componente modal reutilizable
    AuthorForm.tsx           # Formulario de autores
    BookForm.tsx             # Formulario de libros
```

Las API Routes usan Prisma para acceder a las entidades `Author` y `Book`. El cliente se importa desde `@/generated/prisma/client`, generado a partir de `prisma/schema.prisma`.

## Endpoints principales

- `GET /api/authors` — Lista todos los autores (incluye conteo de libros).
- `POST /api/authors` — Crea un autor.
- `GET /api/authors/:id` — Recupera un autor con sus libros.
- `PUT /api/authors/:id` — Actualiza un autor.
- `DELETE /api/authors/:id` — Elimina un autor.
- `GET /api/authors/:id/books` — Lista los libros de un autor (acepta filtro por género).
- `GET /api/authors/:id/stats` — Estadísticas de libros por autor.
- `GET /api/books` — Lista libros (filtros simples por autor o género).
- `POST /api/books` — Crea un libro.
- `GET /api/books/:id` — Recupera un libro con su autor.
- `PUT /api/books/:id` — Actualiza un libro.
- `DELETE /api/books/:id` — Elimina un libro.
- `GET /api/books/search` — Búsqueda paginada con filtros, ordenamiento y conteo total.

## Flujos de la interfaz

- **Dashboard de autores (`/`)**: muestra estadísticas, tabla filtrable y modales para crear/editar autores.
- **Catálogo de libros (`/books`)**: filtros en vivo (título, género, autor, orden), paginación y modal para CRUD de libros.
- **Detalle de autor (`/authors/[id]`)**: información principal, estadísticas agregadas y gestión de libros asociados desde modal.

## Notas

- Los modales y formularios se implementan como componentes reutilizables.
- `src/generated/prisma` permanece ignorado en Git; ejecuta `npx prisma generate` para reconstruirlo localmente.
- Asegúrate de correr `npm run lint` antes de entregar para mantener un estilo consistente.
