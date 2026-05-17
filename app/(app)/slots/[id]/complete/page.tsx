import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy URL — ratings live at /rate */
export default function CompleteSlotRedirect({ params }: { params: { id: string } }) {
  redirect(`/slots/${params.id}/rate`);
}
