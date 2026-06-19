"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function verifyCellarOwnership(cellarId: string, userId: string) {
  const cellar = await prisma.cellar.findUnique({ where: { id: cellarId } });
  // Allow shared cellars (userId="") and user-owned cellars
  return cellar !== null && (cellar.userId === userId || cellar.userId === "");
}

export async function createStockItem(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  const cellarId = formData.get("cellarId") as string;
  const owned = await verifyCellarOwnership(cellarId, userId);
  if (!owned) return { data: null, error: "Cellar not found" };
  try {
    const price = formData.get("purchasePrice") as string;
    const drinkFrom = formData.get("drinkFrom") as string;
    const drinkUntil = formData.get("drinkUntil") as string;
    const data = await prisma.stockItem.create({
      data: {
        wineId: formData.get("wineId") as string,
        cellarId,
        quantity: parseInt(formData.get("quantity") as string) || 1,
        purchasePrice: price ? parseFloat(price) : null,
        binLocation: (formData.get("binLocation") as string) || null,
        drinkFrom: drinkFrom ? parseInt(drinkFrom) : null,
        drinkUntil: drinkUntil ? parseInt(drinkUntil) : null,
      },
    });
    revalidatePath("/");
    revalidatePath(`/cellars/${data.cellarId}`);
    revalidatePath(`/wines/${data.wineId}`);
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to add stock" };
  }
}

export async function updateStockItem(id: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const item = await prisma.stockItem.findUnique({
      where: { id },
      include: { cellar: true },
    });
    if (!item || item.cellar.userId !== userId) return { data: null, error: "Not found" };
    const price = formData.get("purchasePrice") as string;
    const drinkFrom = formData.get("drinkFrom") as string;
    const drinkUntil = formData.get("drinkUntil") as string;
    const data = await prisma.stockItem.update({
      where: { id },
      data: {
        quantity: parseInt(formData.get("quantity") as string) || 1,
        purchasePrice: price ? parseFloat(price) : null,
        binLocation: (formData.get("binLocation") as string) || null,
        drinkFrom: drinkFrom ? parseInt(drinkFrom) : null,
        drinkUntil: drinkUntil ? parseInt(drinkUntil) : null,
      },
    });
    revalidatePath("/");
    revalidatePath(`/cellars/${data.cellarId}`);
    revalidatePath(`/wines/${data.wineId}`);
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to update stock" };
  }
}

export async function removeStockItem(id: string, _formData: FormData): Promise<void> {
  await deleteStockItem(id);
}

export async function deleteStockItem(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };
  try {
    const item = await prisma.stockItem.findUnique({
      where: { id },
      include: { cellar: true },
    });
    if (!item || item.cellar.userId !== userId) return { error: "Not found" };
    await prisma.stockItem.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath(`/cellars/${item.cellarId}`);
    revalidatePath(`/wines/${item.wineId}`);
    return { error: null };
  } catch {
    return { error: "Failed to delete stock item" };
  }
}

export async function withdrawStock(stockItemId: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };
  try {
    const item = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
      include: { cellar: true },
    });
    if (!item || !(item.cellar.userId === userId || item.cellar.userId === "")) {
      return { error: "Not found" };
    }

    const quantity = parseInt(formData.get("quantity") as string) || 0;
    if (quantity < 1 || quantity > item.quantity) {
      return { error: "Invalid quantity" };
    }
    const reason = (formData.get("reason") as string) || null;
    const withdrawnAtRaw = formData.get("withdrawnAt") as string;
    const withdrawnAt = withdrawnAtRaw ? new Date(withdrawnAtRaw) : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.create({
        data: {
          wineId: item.wineId,
          cellarId: item.cellarId,
          quantity,
          reason,
          withdrawnAt,
        },
      });
      if (quantity === item.quantity) {
        await tx.stockItem.delete({ where: { id: stockItemId } });
      } else {
        await tx.stockItem.update({
          where: { id: stockItemId },
          data: { quantity: item.quantity - quantity },
        });
      }
    });

    revalidatePath("/");
    revalidatePath(`/cellars/${item.cellarId}`);
    revalidatePath(`/wines/${item.wineId}`);
    return { error: null };
  } catch {
    return { error: "Failed to withdraw stock" };
  }
}

export async function getWithdrawalsForWine(wineId: string) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.withdrawal.findMany({
      where: { wineId },
      include: { cellar: true },
      orderBy: { withdrawnAt: "desc" },
    });
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch withdrawal history" };
  }
}
