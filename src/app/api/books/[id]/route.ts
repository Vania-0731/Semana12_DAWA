import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            nationality: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al obtener el libro" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      title,
      description,
      isbn,
      publishedYear,
      genre,
      pages,
      authorId,
    } = body;

    if (authorId) {
      const author = await prisma.author.findUnique({
        where: { id: authorId },
        select: { id: true },
      });

      if (!author) {
        return NextResponse.json(
          { error: "Autor no encontrado" },
          { status: 404 },
        );
      }
    }

    const parsedPublishedYear =
      typeof publishedYear === "number"
        ? publishedYear
        : publishedYear
        ? parseInt(publishedYear, 10)
        : undefined;

    const parsedPages =
      typeof pages === "number" ? pages : pages ? parseInt(pages, 10) : undefined;

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        description,
        isbn,
        genre,
        authorId,
        ...(parsedPublishedYear !== undefined
          ? {
              publishedYear: Number.isNaN(parsedPublishedYear)
                ? null
                : parsedPublishedYear,
            }
          : {}),
        ...(parsedPages !== undefined
          ? {
              pages: Number.isNaN(parsedPages) ? null : parsedPages,
            }
          : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(book);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 },
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El ISBN ya está registrado" },
        { status: 409 },
      );
    }

    console.log(error);
    return NextResponse.json(
      { error: "Error al actualizar el libro" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Libro eliminado correctamente",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 },
      );
    }

    console.log(error);
    return NextResponse.json(
      { error: "Error al eliminar el libro" },
      { status: 500 },
    );
  }
}
