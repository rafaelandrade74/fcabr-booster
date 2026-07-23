const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const { version } = require("../package.json");
const distDir = path.join(__dirname, "..", "dist");
const outFile = path.join(__dirname, "..", `release-v${version}.zip`);

if (!fs.existsSync(distDir)) {
    console.error("Pasta dist não encontrada. Rode o build antes.");
    process.exit(1);
}

if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.on("error", (err) => { throw err; });

output.on("close", () => {
    const kb = (archive.pointer() / 1024).toFixed(1);
    console.log(`\n✓ ${path.basename(outFile)} (${kb} KB)`);
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
