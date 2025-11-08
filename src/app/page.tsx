'use client';

import Link from "next/link";

import { AuthorForm } from "@/components/AuthorForm";
import { Modal } from "@/components/Modal";
import { useAuthorsPage } from "@/hooks/useAuthorsPage";

export default function HomePage() {
  const {
    filteredAuthors,
    statistics,
    loading,
    saving,
    message,
    form,
    searchTerm,
    modalOpen,
    modalMode,
    openCreateModal,
    openEditModal,
    closeModal,
    handleFieldChange,
    handleSubmit,
    handleDelete,
    setSearchTerm,
  } = useAuthorsPage();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 bg-slate-50 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Biblioteca - Autores</h1>
          <p className="text-slate-600">Gestiona autores y consulta sus libros.</p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Ir a libros
        </Link>
      </header>

      {message && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Estadísticas generales</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total de autores</p>
            <p className="text-2xl font-semibold text-slate-900">{statistics.totalAuthors}</p>
          </article>
          <article className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total de libros</p>
            <p className="text-2xl font-semibold text-slate-900">{statistics.totalBooks}</p>
          </article>
          <article className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Promedio por autor</p>
            <p className="text-2xl font-semibold text-slate-900">{statistics.averageBooks}</p>
          </article>
          <article className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Autor con más libros</p>
            <p className="text-lg font-semibold text-slate-900">{statistics.topAuthor}</p>
          </article>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Autores registrados</h2>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, correo o nacionalidad"
              className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            />
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Nuevo autor
            </button>
          </div>
        </div>
        {filteredAuthors.length === 0 ? (
          <p className="text-sm text-slate-600">
            {loading ? "Cargando autores..." : "No se encontraron autores con esa búsqueda"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-slate-700">
                <tr>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Correo</th>
                  <th className="px-3 py-2 font-medium">Libros</th>
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredAuthors.map((author) => (
                  <tr key={author.id}>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-900">{author.name}</span>
                      {author.bio && (
                        <p className="text-xs text-slate-500">{author.bio}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{author.email}</td>
                    <td className="px-3 py-3 text-slate-700">{author._count.books}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(author)}
                          className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(author.id)}
                          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                        <Link
                          href={`/authors/${author.id}`}
                          className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Registrar autor" : "Editar autor"}
      >
        <AuthorForm
          values={form}
          submitting={saving}
          submitLabel={modalMode === "create" ? "Crear autor" : "Actualizar autor"}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </main>
  );
}
