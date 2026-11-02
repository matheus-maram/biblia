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

test("a Almeida tem o mesmo total de versículos da Bíblia Livre em cada capítulo", () => {
  for (let b = 0; b < 66; b++) {
    const blv = book("blv", b);
    book("alm", b).forEach((ch, c) => assert.equal(ch.length, blv[c].length, `livro ${b + 1}, capítulo ${c + 1}`));
  }
});

test("a Almeida mantém a numeração corrigida", () => {
  const cases = [
    [0, 36, 5, "e Aolíbama teve a Jeús"],
    [0, 43, 7, "Responderam eles:"],
    [3, 5, 6, "Dize aos filhos de Israel:"],
    [3, 25, 9, "Ora, os que morreram"],
    [6, 5, 31, "Assim ó Senhor"],
    [8, 20, 42, "E disse Jônatas"],
    [11, 18, 34, "Que é feito dos deuses"],
    [15, 5, 10, "Também eu,"],
    [15, 12, 3, "Secanias,"],
    [18, 86, 11, "Ensina-me, Senhor"],
    [18, 86, 13, "Pois grande"],
    [25, 20, 5, "e dize-lhes:"],
    [41, 9, 62, "Jesus, porém"],
    [46, 13, 14, "A graça do Senhor"],
  ];
  for (const [b, c, v, start] of cases) {
    assert.ok(book("alm", b)[c - 1][v - 1].startsWith(start), `livro ${b + 1}, ${c}:${v}`);
  }
});

test("os únicos versículos vazios da Almeida são os que faltam na fonte", () => {
  const empty = [];
  for (let b = 0; b < 66; b++) {
    book("alm", b).forEach((ch, c) => ch.forEach((text, v) => { if (!text) empty.push(`${b + 1}.${c + 1}.${v + 1}`); }));
  }
  assert.deepEqual(empty, ["19.86.10", "42.9.61"]);
});

test("nenhum versículo tem erro de codificação ou marcação solta", () => {
  eachVerse((text, ref) => {
    assert.equal(typeof text, "string", ref);
    assert.doesNotMatch(text, /(^|[\s("“])ç/, `${ref}: "ç" no lugar de "Ó"`);
    assert.doesNotMatch(text, /‰|\/fn|\/key|\*fn|\*key/, `${ref}: marcação solta`);
  });
});
