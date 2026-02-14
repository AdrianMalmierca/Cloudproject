import db from "../src/db";
import * as fs from "fs";
import { config } from "../src/config";

async function reset(): Promise<void> {
  console.log("🗑️  Eliminando base de datos...");

  // Cerrar conexión si existe
  try {
    await db.close();
  } catch {
    // Ignorar errores de cierre
  }

  // Eliminar archivo de base de datos si existe
  if (fs.existsSync(config.DB_PATH)) {
    fs.unlinkSync(config.DB_PATH);
    console.log(`   Archivo ${config.DB_PATH} eliminado`);
  } else {
    console.log(`   No existía archivo ${config.DB_PATH}`);
  }

  console.log("\n✅ Base de datos reseteada correctamente!");
  console.log("   Ejecuta 'npm run db:seed' para poblar con datos de prueba");
}

reset().catch((error) => {
  console.error("❌ Error al resetear la base de datos:", error);
  process.exit(1);
});

