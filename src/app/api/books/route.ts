import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre") ?? undefined;
    const authorId = searchParams.get("authorId") ?? undefined;

    const books = await prisma.book.findMany({
      where: {
        ...(genre ? { genre } : {}),
        ...(authorId ? { authorId } : {}),
      },
      orderBy: [
        {
          publishedYear: "desc",
        },
        {
          title: "asc",
        },
      ],
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

    return NextResponse.json(books);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al obtener los libros" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (!title || !isbn || !authorId) {
      return NextResponse.json(
        { error: "Título, ISBN y authorId son obligatorios" },
        { status: 400 },
      );
    }

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

    const parsedPublishedYear =
      typeof publishedYear === "number"
        ? publishedYear
        : publishedYear
        ? parseInt(publishedYear, 10)
        : null;

    const parsedPages =
      typeof pages === "number" ? pages : pages ? parseInt(pages, 10) : null;

    const book = await prisma.book.create({
      data: {
        title,
        description,
        isbn,
        publishedYear: Number.isNaN(parsedPublishedYear)
          ? null
          : parsedPublishedYear,
        genre,
        pages: Number.isNaN(parsedPages) ? null : parsedPages,
        authorId,
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

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El ISBN ya está registrado" },
        { status: 409 },
      );
    }

    console.log(error);
    return NextResponse.json(
      { error: "Error al crear el libro" },
      { status: 500 },
    );
  }
}
