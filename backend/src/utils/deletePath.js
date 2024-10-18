import fs from "fs-extra";
export async function deletesFiles(rutas) {
  for (const ruta of rutas) {
    await fs.unlink(ruta);
  }
}
