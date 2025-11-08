'use client';

import { FormEvent } from "react";

export type AuthorFormValues = {
  name: string;
  email: string;
  bio: string;
  nationality: string;
  birthYear: string;
};

interface AuthorFormProps {
  values: AuthorFormValues;
  submitting: boolean;
  submitLabel: string;
  onChange: (field: keyof AuthorFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export function AuthorForm({
  values,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: AuthorFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Nombre
        <input
          name="name"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Correo
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          required
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Nacionalidad
        <input
          name="nationality"
          value={values.nationality}
          onChange={(event) => onChange("nationality", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Año de nacimiento
        <input
          name="birthYear"
          type="number"
          value={values.birthYear}
          onChange={(event) => onChange("birthYear", event.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
        />
      </label>
      <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-700">
        Biografía
        <textarea
          name="bio"
          rows={3}
          value={values.bio}
          onChange={(event) => onChange("bio", event.target.value)}
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
