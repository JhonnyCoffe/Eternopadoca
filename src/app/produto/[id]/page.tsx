import { getProductById } from "@/app/actions/get-product";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/storefront/ProductDetailPage";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductDetailPage product={product} />;
}
