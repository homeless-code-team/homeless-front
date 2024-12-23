import { rmSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outDir = join(dirname(__dirname), "out");

function removeDirectory(dir) {
  if (existsSync(dir)) {
    try {
      rmSync(dir, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 1000,
      });
      console.log(`Removed directory: ${dir}`);
    } catch (error) {
      if (error.code === "EBUSY") {
        console.log("파일이 사용 중입니다. 잠시 후 다시 시도합니다...");
        setTimeout(() => {
          try {
            rmSync(dir, { recursive: true, force: true });
            console.log(`Removed directory: ${dir}`);
          } catch (retryError) {
            console.error("디렉토리 삭제 실패:", retryError.message);
          }
        }, 2000);
      } else {
        console.error("오류 발생:", error.message);
      }
    }
  }
}

removeDirectory(outDir);
