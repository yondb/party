import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy URL — ratings live at /rate */
export default async function CompleteSlotRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/slots/${id}/rate`);
}
