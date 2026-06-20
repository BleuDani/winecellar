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

export async function uploadCellarBackground(cellarId: string, formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { data: null, error: "Unauthorized" };
  try {
    const file = formData.get("backgroundImage") as File;
    if (!file || file.size === 0) return { error: "No file provided" };

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "avif"];
    if (!allowed.includes(ext)) return { error: "Only jpg, png, webp or avif allowed" };

    const cellar = await prisma.cellar.findUnique({ where: { id: cellarId, userId } });
    if (!cellar) return { data: null, error: "Cellar not found" };

    const supabase = createStorageClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const filename = `${cellarId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("cellar-backgrounds")
      .upload(filename, file, { upsert: true, contentType: file.type });

    if (uploadError) return { data: null, error: "Failed to upload background image" };

    const { data: { publicUrl } } = supabase.storage
      .from("cellar-backgrounds")
      .getPublicUrl(filename);

    await prisma.cellar.update({ where: { id: cellarId }, data: { backgroundImage: publicUrl } });

    revalidatePath("/cellars");
    revalidatePath(`/cellars/${cellarId}`);
    return { data: publicUrl, error: null };
  } catch {
    return { data: null, error: "Failed to upload background image" };
  }
}
