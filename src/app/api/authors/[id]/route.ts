import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

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
            publishedYear: "desc",
          },
        },
        _count: {
          select: { books: true },
        },
      },
    });
    if (!author) {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json(author);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error al obtener el autor" },
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
    const { name, email, bio, nationality, birthYear } = body;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "El correo electrónico no es válido" },
          { status: 400 },
        );
      }
    }
    const author = await prisma.author.update({
      where: { id },
      data: {
        name,
        email,
        bio,
        nationality,
        birthYear: birthYear ? parseInt(birthYear, 10) : null,
      },
      include: {
        books: true,
      },
    });
    return NextResponse.json(author);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 },
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el autor" },
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
    await prisma.author.delete({
      where: { id },
    });
    return NextResponse.json({
      message: "Autor eliminado correctamente",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Autor no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Error al eliminar el autor" },
      { status: 500 },
    );
  }
}
