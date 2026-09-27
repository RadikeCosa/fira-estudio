import { NextRequest, NextResponse } from "next/server";

const CATEGORY_SLUG_PATTERN = /^[a-z0-9-]+$/;

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/productos") return NextResponse.next();

  const category = request.nextUrl.searchParams.get("categoria");
  if (!category || !CATEGORY_SLUG_PATTERN.test(category)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = `/productos/categoria/${category}`;
  destination.search = "";

  const page = request.nextUrl.searchParams.get("page");
  if (page && /^[1-9]\d*$/.test(page)) destination.searchParams.set("page", page);

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: "/productos",
};
