'use client';

import { FormEvent } from "react";

export type BookFormValues = {
  title: string;
  description: string;
  isbn: string;
  publishedYear: string;
  genre: string;
  pages: string;
  authorId?: string;
};

interface BookFormProps {
  values: BookFormValues;
  authors?: Array<{ id: string; name: string }>;
  requireAuthor?: boolean;
  submitting: boolean;
  submitLabel: string;
  onChange: (field: keyof BookFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export function BookForm({
  values,
  authors,
  requireAuthor = false,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: BookFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      {authors && (
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Autor
          <select
            name="authorId"
            value={values.authorId ?? ''}
            onChange={(event) => onChange("authorId", event.target.value)}
            required={requireAuthor}
            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
          >
            <option value="">Selecciona un autor</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Título
        <input
          name="title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        ISBN
        <input
          name="isbn"
          value={values.isbn}
          onChange={(event) => onChange("isbn", event.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Año de publicación
        <input
          name="publishedYear"
          type="number"
          value={values.publishedYear}
          onChange={(event) => onChange("publishedYear", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Género
        <input
          name="genre"
          value={values.genre}
          onChange={(event) => onChange("genre", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Páginas
        <input
          name="pages"
          type="number"
          value={values.pages}
          onChange={(event) => onChange("pages", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-700">
        Descripción
        <textarea
          name="description"
          rows={3}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
