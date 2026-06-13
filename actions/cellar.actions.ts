"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCellars() {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.cellar.findMany({
      where: { OR: [{ userId }, { userId: "" }] },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { stockItems: true } },
        stockItems: { select: { quantity: true } },
      },
    });
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch cellars" };
  }
}

export async function getCellar(id: string) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
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
  } catch {
    return { data: null, error: "Failed to fetch cellar" };
  }
}

export async function createCellar(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.cellar.create({
      data: {
        userId,
        name: formData.get("name") as string,
        location: (formData.get("location") as string) || null,
      },
    });
    revalidatePath("/cellars");
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to create cellar" };
  }
}

export async function updateCellar(id: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.cellar.update({
      where: { id, userId },
      data: {
        name: formData.get("name") as string,
        location: (formData.get("location") as string) || null,
      },
    });
    revalidatePath("/cellars");
    revalidatePath(`/cellars/${id}`);
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to update cellar" };
  }
}

export async function deleteCellar(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };
  try {
    await prisma.cellar.delete({ where: { id, userId } });
    revalidatePath("/cellars");
    return { error: null };
  } catch {
    return { error: "Failed to delete cellar" };
  }
}
