import type { Metadata } from "next";
import { FilterApp } from "@/components/FilterApp";

export const metadata: Metadata = {
  title: "Filter",
  description: "Paste rough writing, choose a tone and remove obvious AI tells."
};

export default function FilterPage() {
  return <FilterApp />;
}
