"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStockItem(formData: FormData) {
  try {
    const price = formData.get("purchasePrice") as string;
    const drinkFrom = formData.get("drinkFrom") as string;
    const drinkUntil = formData.get("drinkUntil") as string;
    const data = await prisma.stockItem.create({
      data: {
        wineId: formData.get("wineId") as string,
        cellarId: formData.get("cellarId") as string,
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
  } catch (error) {
    return { data: null, error: "Failed to add stock" };
  }
}

export async function updateStockItem(id: string, formData: FormData) {
  try {
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
  } catch (error) {
    return { data: null, error: "Failed to update stock" };
  }
}

export async function removeStockItem(id: string, _formData: FormData): Promise<void> {
  await deleteStockItem(id);
}

export async function deleteStockItem(id: string) {
  try {
    const item = await prisma.stockItem.findUnique({ where: { id } });
    await prisma.stockItem.delete({ where: { id } });
    if (item) {
      revalidatePath("/");
      revalidatePath(`/cellars/${item.cellarId}`);
      revalidatePath(`/wines/${item.wineId}`);
    }
    return { error: null };
  } catch (error) {
    return { error: "Failed to delete stock item" };
  }
}
