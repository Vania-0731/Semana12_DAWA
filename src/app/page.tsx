'use client';

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { AuthorForm, AuthorFormValues } from "@/components/AuthorForm";
import { Modal } from "@/components/Modal";

type Author = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  nationality: string | null;
  birthYear: number | null;
  books: { id: string; title: string }[];
  _count: { books: number };
};

const emptyForm: AuthorFormValues = {
  name: "",
  email: "",
  bio: "",
  nationality: "",
  birthYear: "",
};

export default function HomePage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState<AuthorFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(" ");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchAuthors();
  }, []);

  const statistics = useMemo(() => {
    if (authors.length === 0) {
      return {
        totalAuthors: 0,
        totalBooks: 0,
        averageBooks: 0,
        topAuthor: "-",
      };
    }

    const totalBooks = authors.reduce((sum, author) => sum + author._count.books, 0);
    const averageBooks = Math.round((totalBooks / authors.length) * 10) / 10;
    const most = authors.reduce((prev, current) =>
      current._count.books > prev._count.books ? current : prev,
    );

    return {
      totalAuthors: authors.length,
      totalBooks,
      averageBooks,
      topAuthor: `${most.name} (${most._count.books})`,
    };
  }, [authors]);

  const filteredAuthors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return authors;
    return authors.filter((author) => {
      return (
        author.name.toLowerCase().includes(term) ||
        author.email.toLowerCase().includes(term) ||
        (author.bio ?? "").toLowerCase().includes(term) ||
        (author.nationality ?? "").toLowerCase().includes(term)
      );
    });
  }, [authors, searchTerm]);

  const fetchAuthors = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/authors');
      if (!response.ok) {
        throw new Error('No se pudieron cargar los autores');
      }
      const data: Author[] = await response.json();
      setAuthors(data);
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al cargar autores');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof AuthorFormValues, value: string) => {
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

  const openEditModal = (author: Author) => {
    setForm({
      name: author.name,
      email: author.email,
      bio: author.bio ?? '',
      nationality: author.nationality ?? '',
      birthYear: author.birthYear ? String(author.birthYear) : '',
    });
    setEditingId(author.id);
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
    setSaving(true);
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim() || null,
      nationality: form.nationality.trim() || null,
      birthYear: form.birthYear ? Number(form.birthYear) : null,
    };

    const isEdit = Boolean(editingId);

    try {
      const url = isEdit ? `/api/authors/${editingId}` : '/api/authors';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo guardar');
      }
      await fetchAuthors();
      setMessage(isEdit ? 'Autor actualizado correctamente' : 'Autor creado correctamente');
      closeModal();
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al guardar');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este autor?')) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo eliminar');
      }
      await fetchAuthors();
      setMessage('Autor eliminado');
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al eliminar');
    }
  };

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
            {loading ? 'Cargando autores...' : 'No se encontraron autores con esa búsqueda'}
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
        title={modalMode === 'create' ? 'Registrar autor' : 'Editar autor'}
      >
        <AuthorForm
          values={form}
          submitting={saving}
          submitLabel={modalMode === 'create' ? 'Crear autor' : 'Actualizar autor'}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </main>
  );
}
