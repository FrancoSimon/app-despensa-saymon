"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parseProductForm, toProductPayload } from "@/lib/products/validation";
import { createClient } from "@/lib/supabase/server";

export async function createProductAction(formData: FormData) {
  await requireAdminProfile();
  const payload = toProductPayload(parseProductForm(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(id: string, formData: FormData) {
  await requireAdminProfile();
  const payload = toProductPayload(parseProductForm(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("productos").update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}/editar`);
  redirect("/admin/productos");
}

export async function deactivateProductAction(formData: FormData) {
  await requireAdminProfile();
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Producto invalido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ activo: false })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
}

