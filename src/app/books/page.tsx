'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { BookForm, BookFormValues } from "@/components/BookForm";
import { Modal } from "@/components/Modal";

type AuthorOption = {
  id: string;
  name: string;
};

type Book = {
  id: string;
  title: string;
  description: string | null;
  isbn: string;
  publishedYear: number | null;
  genre: string | null;
  pages: number | null;
  authorId: string;
  author: { id: string; name: string } | null;
};

type SearchState = {
  search: string;
  genre: string;
  authorId: string;
  sortBy: string;
  order: 'asc' | 'desc';
  page: number;
  limit: number;
};

const emptyForm: BookFormValues = {
  title: "",
  description: "",
  isbn: "",
  publishedYear: "",
  genre: "",
  pages: "",
  authorId: "",
};

const initialSearch: SearchState = {
  search: "",
  genre: "",
  authorId: "",
  sortBy: "createdAt",
  order: 'desc',
  page: 1,
  limit: 10,
};

export default function BooksPage() {
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [form, setForm] = useState<BookFormValues>(emptyForm);
  const [filters, setFilters] = useState<SearchState>(initialSearch);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadAuthors();
    loadGenres();
    searchBooks(initialSearch);
  }, []);

  const loadAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      if (!response.ok) return;
      const data = await response.json();
      setAuthors(
        data.map((author: any) => ({ id: author.id, name: author.name })),
      );
    } catch (_error) {
    }
  };

  const loadGenres = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) return;
      const data = await response.json();
      const unique = Array.from(
        new Set<string>(
          data
            .map((book: any) => book.genre)
            .filter((genre: string | null): genre is string => Boolean(genre)),
        ),
      );
      unique.sort();
      setGenres(unique);
    } catch (_error) {
      /* omitir */
    }
  };

  const searchBooks = async (state: SearchState) => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(state.page));
      params.set('limit', String(state.limit));
      params.set('sortBy', state.sortBy);
      params.set('order', state.order);
      if (state.search) params.set('search', state.search);
      if (state.genre) params.set('genre', state.genre);
      if (state.authorId) params.set('authorId', state.authorId);

      const response = await fetch(`/api/books/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('No se pudieron obtener los libros');
      }
      const data = await response.json();
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (error: any) {
      setMessage(error.message ?? 'Error al buscar libros');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (updater: (prev: SearchState) => SearchState) => {
    setFilters((prev) => {
      const next = updater(prev);
      searchBooks(next);
      return next;
    });
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    applyFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    applyFilters((prev) => ({ ...prev, limit: value, page: 1 }));
  };

  const handlePage = (direction: 'next' | 'prev') => {
    applyFilters((prev) => ({
      ...prev,
      page: direction === 'next' ? prev.page + 1 : prev.page - 1,
    }));
  };

  const handleFieldChange = (field: keyof BookFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setForm({
      title: book.title,
      description: book.description ?? '',
      isbn: book.isbn,
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      genre: book.genre ?? '',
      pages: book.pages ? String(book.pages) : '',
      authorId: book.authorId,
    });
    setEditingId(book.id);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.authorId) {
      setMessage('Selecciona un autor');
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      isbn: form.isbn.trim(),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      genre: form.genre.trim() || null,
      pages: form.pages ? Number(form.pages) : null,
      authorId: form.authorId,
    };

    const isEdit = Boolean(editingId);

    try {
      const url = isEdit ? `/api/books/${editingId}` : '/api/books';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo guardar el libro');
      }
      await searchBooks(filters);
      await loadGenres();
      setMessage(isEdit ? 'Libro actualizado correctamente' : 'Libro creado correctamente');
      closeModal();
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al guardar');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo eliminar el libro');
      }
      await searchBooks(filters);
      await loadGenres();
      setMessage('Libro eliminado');
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al eliminar');
    }
  };

  const summary = useMemo(() => {
    if (loading) return 'Buscando libros...';
    if (pagination.total === 0) return 'No se encontraron libros';
    return `${pagination.total} resultados`;
  }, [loading, pagination.total]);

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
            {loading ? 'Cargando libros...' : 'No hay libros para mostrar'}
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
                    <td className="px-3 py-3 text-slate-700">{book.author?.name ?? 'Sin autor'}</td>
                    <td className="px-3 py-3 text-slate-700">{book.genre ?? '-'}</td>
                    <td className="px-3 py-3 text-slate-700">
                      <div>{book.publishedYear ?? '-'}</div>
                      <div className="text-xs text-slate-500">
                        {book.pages ? `${book.pages} páginas` : 'Sin páginas'}
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
            onClick={() => handlePage('prev')}
            disabled={!pagination.hasPrev}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePage('next')}
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
        title={modalMode === 'create' ? 'Registrar libro' : 'Editar libro'}
      >
        <BookForm
          values={form}
          authors={authors}
          requireAuthor
          submitting={saving}
          submitLabel={modalMode === 'create' ? 'Crear libro' : 'Actualizar libro'}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </main>
  );
}

