"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getGrapes() {
  try {
    const data = await prisma.grape.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { wines: true } } },
    });
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to load grapes" };
  }
}

export async function createGrape(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { data: null, error: "Name is required" };
  try {
    const data = await prisma.grape.create({ data: { name } });
    revalidatePath("/grapes");
    return { data, error: null };
  } catch {
    return { data: null, error: "A grape with that name already exists" };
  }
}

export async function updateGrape(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { data: null, error: "Name is required" };
  try {
    const data = await prisma.grape.update({ where: { id }, data: { name } });
    revalidatePath("/grapes");
    return { data, error: null };
  } catch {
    return { data: null, error: "A grape with that name already exists" };
  }
}

export async function deleteGrape(id: string) {
  try {
    const grape = await prisma.grape.findUnique({
      where: { id },
      include: { _count: { select: { wines: true } } },
    });
    if (!grape) return { error: "Grape not found" };
    if (grape._count.wines > 0) {
      return { error: `Cannot delete: grape is used by ${grape._count.wines} wine(s)` };
    }
    await prisma.grape.delete({ where: { id } });
    revalidatePath("/grapes");
    return { error: null };
  } catch {
    return { error: "Failed to delete grape" };
  }
}
