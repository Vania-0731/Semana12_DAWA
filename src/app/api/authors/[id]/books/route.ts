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
      select: { id: true },
    });

    if (!author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 },
      );
    }

    const searchParams = new URL(request.url).searchParams;
    const genre = searchParams.get("genre") ?? undefined;

    const books = await prisma.book.findMany({
      where: {
        authorId: id,
        ...(genre ? { genre } : {}),
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
          },
        },
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al obtener los libros del autor" },
      { status: 500 },
    );
  }
}
