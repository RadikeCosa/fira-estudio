import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

describe("legacy category redirects", () => {
  it("permanently redirects to a clean category URL and keeps valid pagination", () => {
    const response = proxy(
      new NextRequest(
        "https://fira.example/productos?categoria=manteles&page=3&utm_source=mail",
      ),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://fira.example/productos/categoria/manteles?page=3",
    );
  });

  it("drops invalid pagination parameters", () => {
    const response = proxy(
      new NextRequest(
        "https://fira.example/productos?categoria=manteles&page=0",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://fira.example/productos/categoria/manteles",
    );
  });

  it("does not redirect malformed category values", () => {
    const response = proxy(
      new NextRequest("https://fira.example/productos?categoria=../manteles"),
    );

    expect(response.status).toBe(200);
  });
});
