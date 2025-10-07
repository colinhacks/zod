import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextRequest, NextResponse } from "next/server";

const { rewrite: rewriteLLM } = rewritePath("/*path", "/llms.mdx/*path");

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle content negotiation via Accept header
  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
