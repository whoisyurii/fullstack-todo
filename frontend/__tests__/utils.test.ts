import { cn } from "@/lib/utils";

describe("cn helper", () => {
  it("drops falsy values and merges tailwind classes", () => {
    const result = cn("px-2", false && "hidden", "px-4", "text-sm");
    expect(result).toBe("px-4 text-sm");
  });
});
