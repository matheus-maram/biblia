import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const PKEY = "biblia.prog.v1";

function open(hash = "", prog = null, settings = null, { voice = false } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e));
  const dom = new JSDOM(html, {
    url: "http://localhost/" + hash,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(w) {
      if (prog) w.localStorage.setItem(PKEY, JSON.stringify(prog));
      if (settings) w.localStorage.setItem("biblia.v1", JSON.stringify(settings));
      w.scrollTo = () => {};
      w.Element.prototype.scrollIntoView = () => {};
      w.matchMedia = () => ({ matches: true, addEventListener() {} });
      if (voice) {
        // Voz falsa: guarda o que seria falado e deixa o teste encerrar cada fala
        w.spoken = [];
        w.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        w.speechSynthesis = {
          speak(u) { w.spoken.push(u); },
          cancel() { w.cancels = (w.cancels || 0) + 1; },
          getVoices: () => [
            { lang: "en-US", name: "Samantha", voiceURI: "samantha" },
            { lang: "pt-PT", name: "Joana", voiceURI: "joana" },
            { lang: "pt-BR", name: "Luciana", voiceURI: "luciana" },
            { lang: "pt-BR", name: "Felipe (Aprimorada)", voiceURI: "felipe-plus" },
          ],
        };
      }
      w.navigator.clipboard = { writeText: (t) => { w.copied = t; return Promise.resolve(); } };
      w.fetch = async (path) => {
        const url = new URL("../" + path, import.meta.url);
        if (!fs.existsSync(url)) return { ok: false, status: 404 };
        const text = fs.readFileSync(url, "utf8");
        return { ok: true, json: async () => JSON.parse(text) };
      };
    },
  });
  const w = dom.window;
  const $ = (id) => w.document.getElementById(id);
  const saved = () => JSON.parse(w.localStorage.getItem(PKEY) || "null");
  return { w, $, saved, errors };
}
const tick = () => new Promise((r) => setTimeout(r, 30));

test("o traço do logo não usa a classe da barra de navegação", () => {
  const { w } = open();
  assert.equal(w.document.querySelector(".mark .bar"), null);
  assert.equal(w.document.querySelectorAll(".mark .mark-bar").length, 2);
});

test("a página inicial abre sem erros e traz o versículo do dia", async () => {
  const { w, $, errors } = open();
  await tick();
  assert.equal($("home").hidden, false);
  assert.equal(w.document.querySelectorAll("#homeAT .book").length, 39);
  assert.equal(w.document.querySelectorAll("#homeNT .book").length, 27);
  assert.match($("votdText").textContent, /^“.+”$/);
  assert.deepEqual(errors, []);
});

test("a busca rápida abre a referência e seleciona o versículo", async () => {
  const { w, $ } = open();
  $("homeJumpIn").value = "jo 3:16";
  $("homeJump").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await tick();
  assert.equal($("reader").hidden, false);
  assert.equal($("bookName").textContent, "João");
  assert.equal($("chNum").textContent, "3");
  assert.ok($("v16").classList.contains("on"));
  assert.equal($("selRef").textContent, "João 3:16");
});

test("um versículo vazio fica sem número, sem deslocar os seguintes", async () => {
  const { w, $ } = open("#sl-46");
  await tick();
  $("openVer").click();
  [...w.document.querySelectorAll(".ver")].find((el) => el.textContent.includes("BLV")).click();
  await tick();
  assert.equal($("v3"), null);
  assert.match($("v4").textContent, /^4/);
  assert.match($("meta").textContent, /10 versículos/);
});

test("trocar de versão mantém o capítulo e carrega o novo texto", async () => {
  const { w, $ } = open("#sl-23");
  await tick();
  const before = $("v1").textContent;
  $("openVer").click();
  [...w.document.querySelectorAll(".ver")].find((el) => el.textContent.includes("NVA")).click();
  await tick();
  assert.equal($("bookName").textContent, "Salmos");
  assert.notEqual($("v1").textContent, before);
});

test("as configurações trocam o tema e a escolha continua ao reabrir", async () => {
  const { w, $ } = open();
  assert.equal($("homeVer").textContent, "Configurações");
  $("homeVer").click();
  assert.equal($("verSheet").hidden, false);
  assert.equal($("verTitle").textContent, "Configurações");

  $("themeLight").click();
  assert.equal(w.document.documentElement.getAttribute("data-theme"), "light");
  assert.equal($("themeLight").getAttribute("aria-pressed"), "true");
  assert.equal($("themeDark").getAttribute("aria-pressed"), "false");

  $("themeDark").click();
  assert.equal(w.document.documentElement.getAttribute("data-theme"), "dark");
  const settings = JSON.parse(w.localStorage.getItem("biblia.v1"));
  assert.equal(settings.theme, "dark");

  const again = open("", null, { theme: "light" });
  assert.equal(again.w.document.documentElement.getAttribute("data-theme"), "light");
  assert.equal(again.$("themeLight").getAttribute("aria-pressed"), "true");
});

test("o desafio de 1 ano passa por leitura do dia, marcos e progresso salvo", async () => {
  const { w, $, saved } = open("#progresso");
  await tick();
  [...$("pgPlan").querySelectorAll("button")].find((b) => b.textContent === "Começar desafio").click();
  assert.equal(saved().plan.days, 365);
  assert.equal($("pgPlan").querySelectorAll(".todo-row").length, 4);

  $("pgPlan").querySelector(".chk").click();
  assert.equal($("cel").hidden, false);
  assert.equal($("celTitle").textContent, "Primeiro capítulo");
  $("celNext").click();
  assert.equal($("cel").hidden, true);

  for (let i = 0; i < 3; i++) {
    const open = [...$("pgPlan").querySelectorAll(".chk")].find((c) => !c.classList.contains("on"));
    open.click();
  }
  assert.equal($("celTitle").textContent, "Meta de hoje");
  $("celNext").click();
  assert.equal($("pgStatus").textContent, "Meta de hoje cumprida");
  assert.equal(saved().r.slice(0, 4), "1111");
  assert.equal($("openProg").textContent, "0,3%");
});

test("marcar um livro inteiro dá o marco e a tela de capítulo mostra o carimbo", async () => {
  const { $, saved } = open("#ob-1");
  await tick();
  $("markBtn").click();
  assert.equal($("readState").hidden, false);
  assert.deepEqual(Object.keys(saved().m).sort(), ["c1", "livro"]);
  assert.equal($("celTitle").textContent, "Primeiro capítulo");
  $("celNext").click();
  assert.equal($("celTitle").textContent, "Primeiro livro");
});

test("o código de backup restaura o progresso em outro aparelho", async () => {
  const a = open("#ob-1");
  await tick();
  a.$("markBtn").click();
  a.$("bkCopy").click();
  await tick();
  assert.match(a.w.copied, /^AJA1\./);

  const b = open("#progresso");
  await tick();
  b.$("restoreIn").value = a.w.copied;
  b.$("bkApply").click();
  assert.ok(b.saved().m.livro);
  assert.equal(b.$("pgN").textContent, "1 de 1.189 capítulos");
});

test("sem voz no navegador, o botão de ouvir não aparece", async () => {
  const { $ } = open("#sl-23");
  await tick();
  assert.equal($("listenBtn").hidden, true);
  assert.equal($("voiceBox").hidden, true);
});

test("ouvir o capítulo lê o título e depois cada versículo, marcando o atual", async () => {
  const { w, $ } = open("#1co-13", null, { rate: 1.25 }, { voice: true });
  await tick();
  assert.equal($("listenBtn").hidden, false);
  $("listenBtn").click();
  const last = () => w.spoken[w.spoken.length - 1];
  assert.equal(last().text, "Primeira Coríntios, capítulo 13.");
  assert.equal(last().lang, "pt-BR");
  assert.equal(last().voice.name, "Felipe (Aprimorada)");
  assert.equal(last().rate, 1.25);
  assert.equal($("barTts").hidden, false);
  assert.equal($("barNav").hidden, true);

  last().onend();
  assert.equal(last().text, $("v1").querySelector(".x").textContent);
  assert.ok($("v1").classList.contains("say"));
  assert.equal($("ttsRef").textContent, "1 Coríntios 13:1");

  $("ttsPause").click();
  assert.equal($("ttsPause").textContent, "Continuar");
  const count = w.spoken.length;
  $("ttsPause").click();
  assert.equal(w.spoken.length, count + 1);
  assert.equal(last().text, $("v1").querySelector(".x").textContent);

  $("ttsStop").click();
  assert.equal($("barTts").hidden, true);
  assert.equal($("barNav").hidden, false);
  assert.equal(w.document.querySelector(".v.say"), null);
});

test("ouvir a seleção lê só os versículos escolhidos e para no fim", async () => {
  const { w, $ } = open("#sl-23", null, null, { voice: true });
  await tick();
  $("v3").click(); $("v1").click();
  $("listenSel").click();
  assert.equal($("barSel").hidden, true);
  const said = [];
  while (!$("barTts").hidden) { const u = w.spoken[w.spoken.length - 1]; said.push(u.text); u.onend(); }
  assert.deepEqual(said, [1, 3].map((n) => $("v" + n).querySelector(".x").textContent));
  assert.equal($("barNav").hidden, false);
});

test("trocar de capítulo interrompe a leitura", async () => {
  const { $ } = open("#sl-23", null, null, { voice: true });
  await tick();
  $("listenBtn").click();
  $("next").click();
  await tick();
  assert.equal($("barTts").hidden, true);
  assert.equal($("listenBtn").textContent, "▶ Ouvir capítulo");
});

test("a velocidade da voz fica salva nas configurações", () => {
  const { w, $ } = open("", null, null, { voice: true });
  assert.equal($("voiceBox").hidden, false);
  w.document.querySelector('[data-rate="0.8"]').click();
  assert.equal(JSON.parse(w.localStorage.getItem("biblia.v1")).rate, 0.8);
  assert.equal(w.document.querySelector('[data-rate="0.8"]').getAttribute("aria-pressed"), "true");
});

test("a lista de vozes põe as do Brasil e as aprimoradas primeiro, e a escolha vale para a leitura", async () => {
  const { w, $ } = open("#sl-23", null, null, { voice: true });
  await tick();
  $("openVer").click();
  const items = () => [...$("voiceList").querySelectorAll(".ver")];
  assert.deepEqual(items().map((el) => el.querySelector(".vn").textContent), ["Automática", "Felipe (Aprimorada)", "Luciana", "Joana"]);
  assert.match(items()[0].querySelector(".vd").textContent, /Felipe \(Aprimorada\)/);
  assert.equal(items()[0].getAttribute("aria-pressed"), "true");
  assert.match(items()[3].querySelector(".vd").textContent, /Portugal/);

  items()[2].click();
  assert.equal(JSON.parse(w.localStorage.getItem("biblia.v1")).voice, "luciana");
  assert.equal(items()[2].getAttribute("aria-pressed"), "true");
  assert.equal(w.spoken.at(-1).voice.name, "Luciana");

  $("closeVer").click();
  $("listenBtn").click();
  assert.equal(w.spoken.at(-1).voice.name, "Luciana");

  const again = open("#sl-23", null, { voice: "sumiu" }, { voice: true });
  await tick();
  again.$("listenBtn").click();
  assert.equal(again.w.spoken.at(-1).voice.name, "Felipe (Aprimorada)");
});
