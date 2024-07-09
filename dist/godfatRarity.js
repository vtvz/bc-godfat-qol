// ==UserScript==
// @name        Copy Cats rarity
// @description Allows copy units from godfat's "all cats" page with rarity
// @version     1.0
// @namespace   https://github.com/vtvz/bc-tiers
// @author      vtvz
// @match       https://bc.godfat.org/*
// @updateURL   https://raw.githubusercontent.com/vtvz/bc-tiers/master/dist/godfatRarity.js
// @downloadURL https://raw.githubusercontent.com/vtvz/bc-tiers/master/dist/godfatRarity.js
// ==/UserScript==
const title = document.querySelector("#content > h1");

const rarityIndexes = {
  5: "legend",
  4: "uber",
  3: "super",
  2: "rare",
  1: "special",
  0: "normal",
};

if (title) {
  title.style.cursor = "pointer";
  title.onclick = () => {
    const elms = document.querySelectorAll(".cats label > span, .cats h1");

    const rarityMap = {};

    let current = "";
    for (const el of elms) {
      switch (el.tagName) {
        case "SPAN":
          const unitName = el.firstChild.data;
          rarityMap[unitName] = current;
          break;
        case "H1":
          current = rarityIndexes[parseInt(el.innerText)];
          break;
      }
    }

    navigator.clipboard.writeText(JSON.stringify(rarityMap, undefined, 2));
  };
}
