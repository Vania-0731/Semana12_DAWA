'use client';

import Link from "next/link";
import { useParams } from "next/navigation";

import { AuthorForm } from "@/components/AuthorForm";
import { BookForm } from "@/components/BookForm";
import { Modal } from "@/components/Modal";
import { useAuthorDetailPage } from "@/hooks/useAuthorDetailPage";

export default function AuthorDetailPage() {
  const params = useParams<{ id: string }>();
  const authorId = params?.id ?? '';

  const {
    author,
    stats,
    loading,
    message,
    authorForm,
    bookForm,
    authorModalOpen,
    bookModalOpen,
    savingAuthor,
    savingBook,
    openAuthorModal,
    closeAuthorModal,
    openBookModal,
    closeBookModal,
    handleAuthorChange,
    handleBookChange,
    handleUpdateAuthor,
    handleAddBook,
    handleDeleteBook,
  } = useAuthorDetailPage(authorId);

  if (!authorId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-start justify-center gap-4 bg-slate-50 px-4 py-10 text-slate-700">
        <p>No se proporcionó un autor válido.</p>
        <Link
          href="/"
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Volver al panel
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 bg-slate-50 px-4 py-10 text-slate-800 sm:px-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Detalle del autor</h1>
          <p className="text-slate-600">Consulta la información del autor y administra sus libros.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Panel
          </Link>
          <Link
            href="/books"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Libros
          </Link>
        </div>
      </header>

      {message && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Cargando información...
        </div>
      ) : !author ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No se encontró el autor.
        </div>
      ) : (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Información del autor</h2>
              <button
                type="button"
                onClick={openAuthorModal}
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Editar autor
              </button>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-slate-500">Nombre</dt>
                <dd className="text-base font-semibold text-slate-900">{author.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Correo</dt>
                <dd className="text-base text-slate-700">{author.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Nacionalidad</dt>
                <dd className="text-base text-slate-700">{author.nationality ?? 'Sin datos'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Año de nacimiento</dt>
                <dd className="text-base text-slate-700">{author.birthYear ?? 'Sin datos'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase text-slate-500">Biografía</dt>
                <dd className="text-sm text-slate-700">{author.bio ?? 'Sin biografía registrada'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-800">Estadísticas</h2>
            {stats ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Total de libros</p>
                  <p className="text-2xl font-semibold text-slate-900">{stats.totalBooks}</p>
                </article>
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Promedio de páginas</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats.averagePages ?? 'Sin datos'}
                  </p>
                </article>
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Primer libro</p>
                  <p className="text-slate-900">
                    {stats.firstBook
                      ? `${stats.firstBook.title} (${stats.firstBook.year})`
                      : 'Sin datos'}
                  </p>
                </article>
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Último libro</p>
                  <p className="text-slate-900">
                    {stats.latestBook
                      ? `${stats.latestBook.title} (${stats.latestBook.year})`
                      : 'Sin datos'}
                  </p>
                </article>
                <article className="sm:col-span-2 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Géneros</p>
                  <p className="text-slate-900">
                    {stats.genres.length > 0 ? stats.genres.join(', ') : 'Sin géneros'}
                  </p>
                </article>
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Libro más extenso</p>
                  <p className="text-slate-900">
                    {stats.longestBook
                      ? `${stats.longestBook.title} (${stats.longestBook.pages} páginas)`
                      : 'Sin datos'}
                  </p>
                </article>
                <article className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-slate-500">Libro más corto</p>
                  <p className="text-slate-900">
                    {stats.shortestBook
                      ? `${stats.shortestBook.title} (${stats.shortestBook.pages} páginas)`
                      : 'Sin datos'}
                  </p>
                </article>
              </div>
            ) : (
              <p className="text-sm text-slate-600">No hay estadísticas disponibles.</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Libros del autor</h2>
              <button
                type="button"
                onClick={openBookModal}
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Agregar libro
              </button>
            </div>
            {author.books.length === 0 ? (
              <p className="text-sm text-slate-600">No hay libros registrados.</p>
            ) : (
              <ul className="grid gap-4">
                {author.books.map((book) => (
                  <li
                    key={book.id}
                    className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {book.title}{' '}
                          {book.publishedYear ? `(${book.publishedYear})` : ''}
                        </p>
                        <p className="text-xs text-slate-500">
                          ISBN: {book.isbn} • Páginas: {book.pages ?? 'Sin datos'}
                        </p>
                        {book.genre && (
                          <p className="text-xs text-slate-500">Género: {book.genre}</p>
                        )}
                        {book.description && (
                          <p className="mt-1 text-xs text-slate-500">{book.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="shrink-0 rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <Modal
        open={authorModalOpen}
        onClose={closeAuthorModal}
        title="Editar autor"
      >
        <AuthorForm
          values={authorForm}
          submitting={savingAuthor}
          submitLabel="Guardar cambios"
          onChange={handleAuthorChange}
          onSubmit={handleUpdateAuthor}
          onCancel={closeAuthorModal}
        />
      </Modal>

      <Modal
        open={bookModalOpen}
        onClose={closeBookModal}
        title="Agregar libro"
      >
        <BookForm
          values={bookForm}
          submitting={savingBook}
          submitLabel="Agregar libro"
          onChange={handleBookChange}
          onSubmit={handleAddBook}
          onCancel={closeBookModal}
        />
      </Modal>
    </main>
  );
}

