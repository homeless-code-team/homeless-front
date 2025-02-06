import { readdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = join(dirname(__dirname), "build");

function removeFiles(dir, pattern) {
  if (existsSync(dir)) {
    readdirSync(dir, { recursive: true }).forEach((file) => {
      const filePath = join(dir, file);
      if (pattern.test(file)) {
        unlinkSync(filePath);
        console.log(`Removed: ${filePath}`);
      }
    });
  }
}

// 맵 파일과 미디어 파일 제거
removeFiles(buildDir, /\.(map|mp4|webm)$/);
