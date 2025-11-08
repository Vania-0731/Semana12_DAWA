import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

const SORTABLE_FIELDS = new Set<"title" | "publishedYear" | "createdAt">([
  "title",
  "publishedYear",
  "createdAt",
]);

const ORDER_OPTIONS = new Set<"asc" | "desc">(["asc", "desc"]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") ?? undefined;
    const genre = searchParams.get("genre") ?? undefined;
    const authorName = searchParams.get("authorName") ?? undefined;
    const authorId = searchParams.get("authorId") ?? undefined;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const sortByParam = searchParams.get("sortBy") as
      | "title"
      | "publishedYear"
      | "createdAt"
      | null;
    const orderParam = searchParams.get("order") as "asc" | "desc" | null;

    const pageNumber = Math.max(parseInt(pageParam ?? "1", 10), 1);
    const parsedLimit = Math.max(parseInt(limitParam ?? "10", 10), 1);
    const limit = Math.min(parsedLimit, 50);
    const skip = (pageNumber - 1) * limit;

    const sortBy = SORTABLE_FIELDS.has(sortByParam ?? "createdAt")
      ? (sortByParam ?? "createdAt")
      : "createdAt";
    const order = ORDER_OPTIONS.has(orderParam ?? "desc")
      ? (orderParam ?? "desc")
      : "desc";

    const filters = {
      ...(search
        ? {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(genre ? { genre } : {}),
      ...(authorId ? { authorId } : {}),
      ...(authorName
        ? {
            author: {
              name: {
                contains: authorName,
                mode: "insensitive" as const,
              },
            },
          }
        : {}),
    };

    const [total, books] = await Promise.all([
      prisma.book.count({
        where: filters,
      }),
      prisma.book.findMany({
        where: filters,
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json({
      data: books,
      pagination: {
        page: pageNumber,
        limit,
        total,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al buscar los libros" },
      { status: 500 },
    );
  }
}
