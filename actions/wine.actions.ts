"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWines() {
  try {
    const data = await prisma.wine.findMany({
      orderBy: [{ producer: "asc" }, { name: "asc" }],
      include: {
        vivinoData: true,
        stockItems: { select: { quantity: true } },
      },
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to fetch wines" };
  }
}

export async function getWine(id: string) {
  try {
    const data = await prisma.wine.findUnique({
      where: { id },
      include: {
        vivinoData: true,
        stockItems: {
          include: { cellar: true },
          orderBy: { cellar: { name: "asc" } },
        },
      },
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to fetch wine" };
  }
}

export async function createWine(formData: FormData) {
  try {
    const vintage = formData.get("vintage") as string;
    const data = await prisma.wine.create({
      data: {
        producer: formData.get("producer") as string,
        name: formData.get("name") as string,
        vintage: vintage ? parseInt(vintage) : null,
        region: (formData.get("region") as string) || null,
        grape: (formData.get("grape") as string) || null,
        vivinoUrl: (formData.get("vivinoUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/wines");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to create wine" };
  }
}

export async function updateWine(id: string, formData: FormData) {
  try {
    const vintage = formData.get("vintage") as string;
    const data = await prisma.wine.update({
      where: { id },
      data: {
        producer: formData.get("producer") as string,
        name: formData.get("name") as string,
        vintage: vintage ? parseInt(vintage) : null,
        region: (formData.get("region") as string) || null,
        grape: (formData.get("grape") as string) || null,
        vivinoUrl: (formData.get("vivinoUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/wines");
    revalidatePath(`/wines/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: "Failed to update wine" };
  }
}

export async function deleteWine(id: string) {
  try {
    await prisma.wine.delete({ where: { id } });
    revalidatePath("/wines");
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete wine" };
  }
}
