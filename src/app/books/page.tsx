'use client';

import Link from "next/link";

import { BookForm } from "@/components/BookForm";
import { Modal } from "@/components/Modal";
import { useBooksPage } from "@/hooks/useBooksPage";

export default function BooksPage() {
  const {
    authors,
    genres,
    books,
    pagination,
    filters,
    form,
    loading,
    saving,
    message,
    modalOpen,
    modalMode,
    summary,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFieldChange,
    handleSubmit,
    handleDelete,
    handleFilterChange,
    handleLimitChange,
    handlePage,
  } = useBooksPage();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 bg-slate-50 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Biblioteca - Libros</h1>
          <p className="text-slate-600">Registra libros y aplica filtros sencillos.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Volver a autores
        </Link>
      </header>

      {message && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Catálogo de libros</h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-600">{summary}</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Nuevo libro
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Búsqueda por título
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Ejemplo: soledad"
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Género
            <select
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="">Todos</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Autor
            <select
              name="authorId"
              value={filters.authorId}
              onChange={handleFilterChange}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="">Todos</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Ordenar por
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="createdAt">Fecha de creación</option>
              <option value="title">Título</option>
              <option value="publishedYear">Año de publicación</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Orden
            <select
              name="order"
              value={filters.order}
              onChange={handleFilterChange}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Resultados por página
            <select
              value={filters.limit}
              onChange={handleLimitChange}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            >
              {[5, 10, 20, 30, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {books.length === 0 ? (
          <p className="text-sm text-slate-600">
            {loading ? "Cargando libros..." : "No hay libros para mostrar"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Título</th>
                  <th className="px-3 py-2 font-medium">Autor</th>
                  <th className="px-3 py-2 font-medium">Género</th>
                  <th className="px-3 py-2 font-medium">Año / Páginas</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-900">{book.title}</span>
                      {book.description && (
                        <p className="text-xs text-slate-500">{book.description}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{book.author?.name ?? "Sin autor"}</td>
                    <td className="px-3 py-3 text-slate-700">{book.genre ?? "-"}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <div>{book.publishedYear ?? "-"}</div>
                      <div className="text-xs text-slate-500">
                        {book.pages ? `${book.pages} páginas` : "Sin páginas"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => handlePage("prev")}
            disabled={!pagination.hasPrev}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePage("next")}
            disabled={!pagination.hasNext}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Registrar libro" : "Editar libro"}
      >
        <BookForm
          values={form}
          authors={authors}
          requireAuthor
          submitting={saving}
          submitLabel={modalMode === "create" ? "Crear libro" : "Actualizar libro"}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </main>
  );
}

