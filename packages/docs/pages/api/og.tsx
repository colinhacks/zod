import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function (request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic params
    const title = searchParams.get("title") || "Zod Documentation";
    const description =
      searchParams.get("description") || "TypeScript-first schema validation with static type inference";
    const path = "zod.dev/" + (searchParams.get("path") || "packages/core");

    // Format breadcrumbs from path
    // const breadcrumbs = path.split("/").map((crumb) => crumb.toUpperCase());

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0F1117",
          padding: "60px",
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo in upper right corner */}
        <div
          tw="absolute top-12 right-12 w-28 h-28"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img alt="Zod logo" src="http://localhost:3000/logo/logo.png" />
        </div>

        {/* Main content */}
        <div tw="flex flex-col w-full pr-24">
          {" "}
          {/* Added right padding to avoid text overlapping with logo */}
          <h1 tw="text-6xl font-bold tracking-tight text-white m-0 leading-none">{title}</h1>
          <p tw="text-2xl text-gray-300 mt-6 max-w-4xl">{description}</p>
        </div>

        {/* Bottom section with divider */}
        <div tw="flex flex-col w-full">
          {/* Divider line */}
          <div tw="w-full h-px bg-gray-700 my-8" />

          {/* Bottom row with breadcrumbs and project info */}
          <div tw="flex justify-between items-center w-full">
            {/* Breadcrumbs */}
            <div tw="flex items-center gap-3">
              <div tw="flex items-center font-mono">
                <span tw="text-gray-300 text-xl font-mono">{path}</span>
              </div>
            </div>

            {/* Project name */}
            <div tw="flex items-center">
              <img alt="GitHub logo" src="http://localhost:3000/github-white.png" tw="h-6 w-6 mr-2" />
              <span tw="text-xl font-semibold text-gray-300">colinhacks/zod</span>
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
