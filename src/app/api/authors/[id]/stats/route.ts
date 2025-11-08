import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: {
            publishedYear: "asc",
          },
        },
      },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 },
      );
    }

    const totalBooks = author.books.length;

    if (totalBooks === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks,
        firstBook: null,
        latestBook: null,
        averagePages: null,
        genres: [],
        longestBook: null,
        shortestBook: null,
      });
    }

    const booksWithYear = author.books.filter(
      (book) => typeof book.publishedYear === "number",
    );
    const booksWithPages = author.books.filter(
      (book) => typeof book.pages === "number",
    );

    const firstBook = booksWithYear[0]
      ? {
          title: booksWithYear[0].title,
          year: booksWithYear[0].publishedYear,
        }
      : null;

    const latestBook = booksWithYear.length
      ? (() => {
          const last = booksWithYear[booksWithYear.length - 1];
          return {
            title: last.title,
            year: last.publishedYear,
          };
        })()
      : null;

    const averagePages =
      booksWithPages.length > 0
        ? Math.round(
            booksWithPages.reduce((sum, book) => {
              return sum + (book.pages ?? 0);
            }, 0) / booksWithPages.length,
          )
        : null;

    const genres = Array.from(
      new Set(
        author.books
          .map((book) => book.genre)
          .filter((genre): genre is string => Boolean(genre)),
      ),
    );

    const sortedByPages = booksWithPages
      .slice()
      .sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0));

    const longestBook = sortedByPages.length
      ? (() => {
          const book = sortedByPages[sortedByPages.length - 1];
          return {
            title: book.title,
            pages: book.pages,
          };
        })()
      : null;

    const shortestBook = sortedByPages.length
      ? (() => {
          const book = sortedByPages[0];
          return {
            title: book.title,
            pages: book.pages,
          };
        })()
      : null;

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al obtener las estadísticas del autor" },
      { status: 500 },
    );
  }
}
