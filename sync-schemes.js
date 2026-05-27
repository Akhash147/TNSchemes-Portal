import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";

const src  = join("src", "data", "schemes.json");
const dest = join("public", "schemes.json");

try {
  mkdirSync("public", { recursive: true });
  copyFileSync(src, dest);
  console.log("✓ schemes.json synced to public/");
} catch (e) {
  console.warn("⚠ Could not sync schemes.json:", e.message);
}