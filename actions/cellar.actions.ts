"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCellars() {
  try {
    const data = await prisma.cellar.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { stockItems: true } },
        stockItems: { select: { quantity: true } },
      },
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to fetch cellars" };
  }
}

export async function getCellar(id: string) {
  try {
    const data = await prisma.cellar.findUnique({
      where: { id },
      include: {
        stockItems: {
          include: { wine: { include: { vivinoData: true } } },
          orderBy: [{ wine: { producer: "asc" } }, { wine: { name: "asc" } }],
        },
      },
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to fetch cellar" };
  }
}

export async function createCellar(formData: FormData) {
  try {
    const data = await prisma.cellar.create({
      data: {
        name: formData.get("name") as string,
        location: (formData.get("location") as string) || null,
      },
    });
    revalidatePath("/cellars");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to create cellar" };
  }
}

export async function updateCellar(id: string, formData: FormData) {
  try {
    const data = await prisma.cellar.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        location: (formData.get("location") as string) || null,
      },
    });
    revalidatePath("/cellars");
    revalidatePath(`/cellars/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to update cellar" };
  }
}

export async function deleteCellar(id: string) {
  try {
    await prisma.cellar.delete({ where: { id } });
    revalidatePath("/cellars");
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete cellar" };
  }
}
