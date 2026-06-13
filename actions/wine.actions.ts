"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient as createStorageClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getWines() {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.wine.findMany({
      where: { userId },
      orderBy: [{ producer: "asc" }, { name: "asc" }],
      include: {
        vivinoData: true,
        stockItems: { select: { quantity: true } },
        grapes: { include: { grape: true } },
      },
    });
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch wines" };
  }
}

export async function getWine(id: string) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const data = await prisma.wine.findUnique({
      where: { id, userId },
      include: {
        vivinoData: true,
        grapes: { include: { grape: true } },
        stockItems: {
          include: { cellar: true },
          orderBy: { cellar: { name: "asc" } },
        },
      },
    });
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch wine" };
  }
}

export async function createWine(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const vintage = formData.get("vintage") as string;
    const grapeIds = formData.getAll("grapeId") as string[];
    const data = await prisma.wine.create({
      data: {
        userId,
        producer: formData.get("producer") as string,
        name: formData.get("name") as string,
        vintage: vintage ? parseInt(vintage) : null,
        region: (formData.get("region") as string) || null,
        country: (formData.get("country") as string) || null,
        vivinoUrl: (formData.get("vivinoUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
        grapes: {
          create: grapeIds.map((grapeId) => ({ grapeId })),
        },
      },
    });
    revalidatePath("/wines");
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to create wine" };
  }
}

export async function updateWine(id: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const vintage = formData.get("vintage") as string;
    const grapeIds = formData.getAll("grapeId") as string[];
    const data = await prisma.wine.update({
      where: { id, userId },
      data: {
        producer: formData.get("producer") as string,
        name: formData.get("name") as string,
        vintage: vintage ? parseInt(vintage) : null,
        region: (formData.get("region") as string) || null,
        country: (formData.get("country") as string) || null,
        vivinoUrl: (formData.get("vivinoUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
        grapes: {
          deleteMany: {},
          create: grapeIds.map((grapeId) => ({ grapeId })),
        },
      },
    });
    revalidatePath("/wines");
    revalidatePath(`/wines/${id}`);
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to update wine" };
  }
}

export async function uploadWineLabel(wineId: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const file = formData.get("labelImage") as File;
    if (!file || file.size === 0) return { error: "No file provided" };

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "avif"];
    if (!allowed.includes(ext)) return { error: "Only jpg, png, webp or avif allowed" };

    // Verify the wine belongs to the current user
    const wine = await prisma.wine.findUnique({ where: { id: wineId, userId } });
    if (!wine) return { data: null, error: "Wine not found" };

    const supabase = createStorageClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const filename = `${wineId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("wine-labels")
      .upload(filename, file, { upsert: true, contentType: file.type });

    if (uploadError) return { data: null, error: "Failed to upload label image" };

    const { data: { publicUrl } } = supabase.storage
      .from("wine-labels")
      .getPublicUrl(filename);

    await prisma.wine.update({ where: { id: wineId }, data: { labelImage: publicUrl } });

    revalidatePath("/wines");
    revalidatePath(`/wines/${wineId}`);
    return { data: publicUrl, error: null };
  } catch {
    return { data: null, error: "Failed to upload label image" };
  }
}

export async function deleteWine(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };
  try {
    await prisma.wine.delete({ where: { id, userId } });
    revalidatePath("/wines");
    return { error: null };
  } catch {
    return { error: "Failed to delete wine" };
  }
}

export async function getWinesByGrape() {
  const userId = await getUserId();
  if (!userId) return [];
  try {
    const rows = await prisma.wineGrape.findMany({
      where: { wine: { userId } },
      include: { grape: { select: { name: true } } },
    });
    const counts: Record<string, number> = {};
    for (const r of rows) {
      counts[r.grape.name] = (counts[r.grape.name] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  } catch {
    return [];
  }
}

export async function getWinesByCountry() {
  const userId = await getUserId();
  if (!userId) return [];
  try {
    const wines = await prisma.wine.findMany({
      where: { userId, country: { not: null } },
      select: { country: true },
    });
    const counts: Record<string, number> = {};
    for (const w of wines) {
      if (w.country) counts[w.country] = (counts[w.country] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  } catch {
    return [];
  }
}
