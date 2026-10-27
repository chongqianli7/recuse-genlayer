import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const source = readFileSync("contracts/recuse.py");
writeFileSync(
  "public/source.json",
  JSON.stringify(
    {
      protocol: "recuse-1",
      sha256: createHash("sha256").update(source).digest("hex"),
      chainId: 61999,
      rpc: "https://studio.genlayer.com/api",
    },
    null,
    2,
  ),
);
