import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const CH = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22];
const VERSIONS = ["alm", "blv", "blt", "nva"];

function book(ver, b) {
  return JSON.parse(fs.readFileSync(new URL(`../data/${ver}/${String(b + 1).padStart(2, "0")}.json`, import.meta.url), "utf8"));
}
function eachVerse(fn) {
  for (const ver of VERSIONS) for (let b = 0; b < 66; b++) {
    book(ver, b).forEach((ch, c) => ch.forEach((text, v) => fn(text, `${ver} ${b + 1}.${c + 1}.${v + 1}`)));
  }
}

test("todas as versões têm 66 livros e 1.189 capítulos", () => {
  for (const ver of VERSIONS) for (let b = 0; b < 66; b++) {
    const data = book(ver, b);
    assert.equal(data.length, CH[b], `${ver} livro ${b + 1}`);
    data.forEach((ch, c) => assert.ok(ch.length > 0, `${ver} ${b + 1}.${c + 1} vazio`));
  }
});

test("nenhum versículo tem erro de codificação ou marcação solta", () => {
  eachVerse((text, ref) => {
    assert.equal(typeof text, "string", ref);
    assert.doesNotMatch(text, /(^|[\s("“])ç/, `${ref}: "ç" no lugar de "Ó"`);
    assert.doesNotMatch(text, /‰|\/fn|\/key|\*fn|\*key/, `${ref}: marcação solta`);
  });
});
