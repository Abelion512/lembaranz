import { FileAdapter } from "../storage/FileAdapter";
import { StoredNote } from "../Formula";
import fs from "fs/promises";

async function main() {
  const filePath = "test-db-adapter.json";
  await fs.rm(filePath, { force: true });

  const adapter = new FileAdapter(filePath);

  console.time("Sequential Saves");
  for (let i = 0; i < 100; i++) {
    await adapter.set("notes", `seq-${i}`, {
      id: `seq-${i}`,
      title: "Test",
      content: "Test",
      folderId: null,
      isPinned: false,
      isFavorite: false,
      tags: [],
      createdAt: "",
      updatedAt: "",
    } as unknown as StoredNote);
  }
  console.timeEnd("Sequential Saves");

  await fs.rm(filePath, { force: true });
  const adapter2 = new FileAdapter(filePath);

  console.time("Concurrent Saves");
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      adapter2.set("notes", `conc-${i}`, {
        id: `conc-${i}`,
        title: "Test",
        content: "Test",
        folderId: null,
        isPinned: false,
        isFavorite: false,
        tags: [],
        createdAt: "",
        updatedAt: "",
      } as unknown as StoredNote)
    );
  }
  await Promise.all(promises);
  console.timeEnd("Concurrent Saves");

  // Test sequential overlapping
  console.time("Overlapping Saves");
  const adapter3 = new FileAdapter(filePath);
  await Promise.all([
    adapter3.set("notes", "1", { id: "1" } as unknown as StoredNote),
    new Promise((r) => setTimeout(r, 5)).then(() =>
      adapter3.set("notes", "2", { id: "2" } as unknown as StoredNote)
    ),
    new Promise((r) => setTimeout(r, 15)).then(() =>
      adapter3.set("notes", "3", { id: "3" } as unknown as StoredNote)
    ),
  ]);
  console.timeEnd("Overlapping Saves");

  const finalData = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(finalData);
  if (parsed.notes["1"] && parsed.notes["2"] && parsed.notes["3"]) {
    console.log("All data saved successfully.");
  } else {
    console.error("Data loss occurred:", Object.keys(parsed.notes));
  }
}

main().catch(console.error);
