import { redirect } from "next/navigation";

/** Home always opens the map; auth/setup handled in middleware. */
export default function RootPage() {
  redirect("/map");
}
