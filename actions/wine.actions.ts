"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function getWines() {
  try {
    const data = await prisma.wine.findMany({
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
  try {
    const data = await prisma.wine.findUnique({
      where: { id },
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
  try {
    const vintage = formData.get("vintage") as string;
    const grapeIds = formData.getAll("grapeId") as string[];
    const data = await prisma.wine.create({
      data: {
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
  try {
    const vintage = formData.get("vintage") as string;
    const grapeIds = formData.getAll("grapeId") as string[];
    const data = await prisma.wine.update({
      where: { id },
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
  try {
    const file = formData.get("labelImage") as File;
    if (!file || file.size === 0) return { error: "No file provided" };

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "avif"];
    if (!allowed.includes(ext)) return { error: "Only jpg, png, webp or avif allowed" };

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${wineId}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const labelImage = `/uploads/${filename}`;
    await prisma.wine.update({ where: { id: wineId }, data: { labelImage } });

    revalidatePath("/wines");
    revalidatePath(`/wines/${wineId}`);
    return { data: labelImage, error: null };
  } catch {
    return { data: null, error: "Failed to upload label image" };
  }
}

export async function deleteWine(id: string) {
  try {
    await prisma.wine.delete({ where: { id } });
    revalidatePath("/wines");
    return { error: null };
  } catch {
    return { error: "Failed to delete wine" };
  }
}

export async function getWinesByGrape() {
  try {
    const rows = await prisma.wineGrape.findMany({
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
  try {
    const wines = await prisma.wine.findMany({
      where: { country: { not: null } },
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
