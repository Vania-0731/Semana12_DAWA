'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";

import { BookFormValues } from "@/components/BookForm";

type AuthorOption = {
  id: string;
  name: string;
};

export type BookSummary = {
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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type SearchState = {
  search: string;
  genre: string;
  authorId: string;
  sortBy: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
};

type ModalMode = "create" | "edit";

const emptyForm: BookFormValues = {
  title: "",
  description: "",
  isbn: "",
  publishedYear: "",
  genre: "",
  pages: "",
  authorId: "",
};

const initialFilters: SearchState = {
  search: "",
  genre: "",
  authorId: "",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 10,
};

export function useBooksPage() {
  const [authors, setAuthors] = useState<AuthorOption[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState<SearchState>(initialFilters);
  const [form, setForm] = useState<BookFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const loadAuthors = async () => {
    try {
      const response = await fetch("/api/authors");
      if (!response.ok) return;
      const data = await response.json();
      setAuthors(
        data.map((author: any) => ({ id: author.id, name: author.name })),
      );
    } catch (_error) {
      /* omitir */
    }
  };

  const loadGenres = async () => {
    try {
      const response = await fetch("/api/books");
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
      params.set("page", String(state.page));
      params.set("limit", String(state.limit));
      params.set("sortBy", state.sortBy);
      params.set("order", state.order);
      if (state.search) params.set("search", state.search);
      if (state.genre) params.set("genre", state.genre);
      if (state.authorId) params.set("authorId", state.authorId);

      const response = await fetch(`/api/books/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudieron obtener los libros");
      }
      const data = await response.json();
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (error: any) {
      setMessage(error.message ?? "Error al buscar libros");
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

  useEffect(() => {
    loadAuthors();
    loadGenres();
    searchBooks(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handlePage = (direction: "next" | "prev") => {
    applyFilters((prev) => ({
      ...prev,
      page: direction === "next" ? prev.page + 1 : prev.page - 1,
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
    setModalMode("create");
    setMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (book: BookSummary) => {
    setForm({
      title: book.title,
      description: book.description ?? "",
      isbn: book.isbn,
      publishedYear: book.publishedYear ? String(book.publishedYear) : "",
      genre: book.genre ?? "",
      pages: book.pages ? String(book.pages) : "",
      authorId: book.authorId,
    });
    setEditingId(book.id);
    setModalMode("edit");
    setMessage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    resetForm();
    setModalMode("create");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.authorId) {
      setMessage("Selecciona un autor");
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
      const url = isEdit ? `/api/books/${editingId}` : "/api/books";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar el libro");
      }
      await searchBooks(filters);
      await loadGenres();
      setMessage(isEdit ? "Libro actualizado" : "Libro creado");
      closeModal();
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al guardar");
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este libro?")) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo eliminar el libro");
      }
      await searchBooks(filters);
      await loadGenres();
      setMessage("Libro eliminado");
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al eliminar");
    }
  };

  const summary = useMemo(() => {
    if (loading) return "Buscando libros...";
    if (pagination.total === 0) return "No se encontraron libros";
    return `${pagination.total} resultados`;
  }, [loading, pagination.total]);

  return {
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
  };
}

