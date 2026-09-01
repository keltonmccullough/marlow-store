export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({
      products: [],
      message: "Enter a product to search.",
    });
  }

  return Response.json({
    products: [],
    query,
    message:
      "Supplier catalog connections will be added here.",
  });
}
