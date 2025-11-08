'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AuthorForm, AuthorFormValues } from "@/components/AuthorForm";
import { BookForm, BookFormValues } from "@/components/BookForm";
import { Modal } from "@/components/Modal";

type AuthorDetail = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  nationality: string | null;
  birthYear: number | null;
  books: Array<{
    id: string;
    title: string;
    description: string | null;
    isbn: string;
    publishedYear: number | null;
    genre: string | null;
    pages: number | null;
  }>;
};

type AuthorStats = {
  authorId: string;
  authorName: string;
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number | null;
  genres: string[];
  longestBook: { title: string; pages: number | null } | null;
  shortestBook: { title: string; pages: number | null } | null;
};

const emptyAuthorForm: AuthorFormValues = {
  name: "",
  email: "",
  bio: "",
  nationality: "",
  birthYear: "",
};

const emptyBookForm: BookFormValues = {
  title: "",
  description: "",
  isbn: "",
  publishedYear: "",
  genre: "",
  pages: "",
};

export default function AuthorDetailPage() {
  const params = useParams<{ id: string }>();
  const authorId = params?.id ?? '';

  const [author, setAuthor] = useState<AuthorDetail | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [authorForm, setAuthorForm] = useState<AuthorFormValues>(emptyAuthorForm);
  const [bookForm, setBookForm] = useState<BookFormValues>(emptyBookForm);
  const [loading, setLoading] = useState(true);
  const [savingAuthor, setSavingAuthor] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  useEffect(() => {
    if (!authorId) return;
    fetchData();
  }, [authorId]);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [authorRes, statsRes] = await Promise.all([
        fetch(`/api/authors/${authorId}`),
        fetch(`/api/authors/${authorId}/stats`),
      ]);

      if (!authorRes.ok) {
        const body = await authorRes.json().catch(() => null);
        throw new Error(body?.error ?? 'Autor no encontrado');
      }
      const authorData: AuthorDetail = await authorRes.json();
      setAuthor(authorData);
      setAuthorForm({
        name: authorData.name,
        email: authorData.email,
        bio: authorData.bio ?? '',
        nationality: authorData.nationality ?? '',
        birthYear: authorData.birthYear ? String(authorData.birthYear) : '',
      });

      if (!statsRes.ok) {
        throw new Error('No se pudieron obtener las estadísticas');
      }
      const statsData: AuthorStats = await statsRes.json();
      setStats(statsData);
    } catch (error: any) {
      setMessage(error.message ?? 'Ocurrió un error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorChange = (
    field: keyof AuthorFormValues,
    value: string,
  ) => {
    setAuthorForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookChange = (field: keyof BookFormValues, value: string) => {
    setBookForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAuthorModal = () => {
    setAuthorModalOpen(true);
  };

  const closeAuthorModal = () => {
    setAuthorModalOpen(false);
    setSavingAuthor(false);
  };

  const openBookModal = () => {
    setBookForm(emptyBookForm);
    setBookModalOpen(true);
  };

  const closeBookModal = () => {
    setBookModalOpen(false);
    setSavingBook(false);
    setBookForm(emptyBookForm);
  };

  const handleUpdateAuthor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!author) return;

    setSavingAuthor(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/authors/${author.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authorForm.name.trim(),
          email: authorForm.email.trim(),
          bio: authorForm.bio.trim() || null,
          nationality: authorForm.nationality.trim() || null,
          birthYear: authorForm.birthYear ? Number(authorForm.birthYear) : null,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo actualizar el autor');
      }
      setMessage('Autor actualizado');
      closeAuthorModal();
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? 'Error al actualizar el autor');
      setSavingAuthor(false);
    }
  };

  const handleAddBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!author) return;

    setSavingBook(true);
    setMessage(null);

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookForm.title.trim(),
          description: bookForm.description.trim() || null,
          isbn: bookForm.isbn.trim(),
          publishedYear: bookForm.publishedYear ? Number(bookForm.publishedYear) : null,
          genre: bookForm.genre.trim() || null,
          pages: bookForm.pages ? Number(bookForm.pages) : null,
          authorId: author.id,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo crear el libro');
      }
      setMessage('Libro agregado');
      closeBookModal();
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? 'Error al crear el libro');
      setSavingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No se pudo eliminar el libro');
      }
      setMessage('Libro eliminado');
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? 'Error al eliminar el libro');
    }
  };

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

