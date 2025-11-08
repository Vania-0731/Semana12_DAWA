'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AuthorFormValues } from "@/components/AuthorForm";

export type AuthorSummary = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  nationality: string | null;
  birthYear: number | null;
  _count: { books: number };
};

type ModalMode = "create" | "edit";

const emptyAuthorForm: AuthorFormValues = {
  name: "",
  email: "",
  bio: "",
  nationality: "",
  birthYear: "",
};

export function useAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [form, setForm] = useState<AuthorFormValues>(emptyAuthorForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/authors");
      if (!response.ok) {
        throw new Error("No se pudieron cargar los autores");
      }
      const data: AuthorSummary[] = await response.json();
      setAuthors(data);
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al cargar autores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const statistics = useMemo(() => {
    if (authors.length === 0) {
      return {
        totalAuthors: 0,
        totalBooks: 0,
        averageBooks: 0,
        topAuthor: "-",
      };
    }

    const totalBooks = authors.reduce(
      (sum, author) => sum + author._count.books,
      0,
    );
    const averageBooks =
      authors.length === 0
        ? 0
        : Math.round((totalBooks / authors.length) * 10) / 10;
    const most = authors.slice().sort((a, b) => b._count.books - a._count.books)[0];

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

  const handleFieldChange = (field: keyof AuthorFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyAuthorForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (author: AuthorSummary) => {
    setForm({
      name: author.name,
      email: author.email,
      bio: author.bio ?? "",
      nationality: author.nationality ?? "",
      birthYear: author.birthYear ? String(author.birthYear) : "",
    });
    setEditingId(author.id);
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
      const url = isEdit ? `/api/authors/${editingId}` : "/api/authors";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo guardar");
      }
      await fetchAuthors();
      setMessage(
        isEdit ? "Autor actualizado correctamente" : "Autor creado correctamente",
      );
      closeModal();
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al guardar");
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este autor?")) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "No se pudo eliminar");
      }
      await fetchAuthors();
      setMessage("Autor eliminado");
    } catch (error: any) {
      setMessage(error.message ?? "Ocurrió un error al eliminar");
    }
  };

  return {
    authors,
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
  };
}

