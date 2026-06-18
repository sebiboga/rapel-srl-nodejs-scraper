import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOWS_DIR = path.resolve(__dirname, "../../.github/workflows");

describe("Consistency: Workflow File Naming", () => {
  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith(".yml"));

  it("should have scrape.yml (scheduled scraper)", () => {
    expect(files).toContain("scrape.yml");
  });

  it("should have test.yml (CI/automation tests)", () => {
    expect(files).toContain("test.yml");
  });

  it("should have descriptive workflow names", () => {
    for (const f of files) {
      expect(f).toMatch(/^[a-z0-9-]+\.yml$/);
      expect(f === "scrape.yml" || f === "test.yml").toBe(true);
    }
  });
});
