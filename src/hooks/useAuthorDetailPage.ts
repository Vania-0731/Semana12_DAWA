'use client';

import { FormEvent, useCallback, useEffect, useState } from "react";

import { AuthorFormValues } from "@/components/AuthorForm";
import { BookFormValues } from "@/components/BookForm";

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

export function useAuthorDetailPage(authorId: string | undefined) {
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

  const fetchData = useCallback(async () => {
    if (!authorId) return;
    setLoading(true);
    setMessage(null);
    try {
      const [authorRes, statsRes] = await Promise.all([
        fetch(`/api/authors/${authorId}`),
        fetch(`/api/authors/${authorId}/stats`),
      ]);

      if (!authorRes.ok) {
        const body = await authorRes.json().catch(() => null);
        throw new Error(body?.error ?? "Autor no encontrado");
      }
      const authorData: AuthorDetail = await authorRes.json();
      setAuthor(authorData);
      setAuthorForm({
        name: authorData.name,
        email: authorData.email,
        bio: authorData.bio ?? "",
        nationality: authorData.nationality ?? "",
        birthYear: authorData.birthYear ? String(authorData.birthYear) : "",
      });

      if (!statsRes.ok) {
        throw new Error("No se pudieron obtener las estadísticas");
      }
      const statsData: AuthorStats = await statsRes.json();
      setStats(statsData);
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al cargar la información");
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAuthorChange = (field: keyof AuthorFormValues, value: string) => {
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(body?.error ?? "No se pudo actualizar el autor");
      }
      setMessage("Autor actualizado");
      closeAuthorModal();
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? "Error al actualizar el autor");
      setSavingAuthor(false);
    }
  };

  const handleAddBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!author) return;

    setSavingBook(true);
    setMessage(null);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookForm.title.trim(),
          description: bookForm.description.trim() || null,
          isbn: bookForm.isbn.trim(),
          publishedYear: bookForm.publishedYear
            ? Number(bookForm.publishedYear)
            : null,
          genre: bookForm.genre.trim() || null,
          pages: bookForm.pages ? Number(bookForm.pages) : null,
          authorId: author.id,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo crear el libro");
      }
      setMessage("Libro agregado");
      closeBookModal();
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? "Error al crear el libro");
      setSavingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("¿Eliminar este libro?")) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo eliminar el libro");
      }
      setMessage("Libro eliminado");
      await fetchData();
    } catch (error: any) {
      setMessage(error.message ?? "Error al eliminar el libro");
    }
  };

  return {
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
  };
}

