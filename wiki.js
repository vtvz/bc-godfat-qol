// ==UserScript==
// @name        Battle Cats Unit Copy
// @description Battle Cats copy all units from page
// @version     1
// @match       https://battle-cats.fandom.com/wiki/*
// @author      vtvz
// @updateURL   https://gist.githubusercontent.com/vtvz/c76e08303e078df861ddab5b5621e924/raw/wiki.js
// @downloadURL https://gist.githubusercontent.com/vtvz/c76e08303e078df861ddab5b5621e924/raw/wiki.js
// ==/UserScript==

const title = document.querySelector("h1");

if (title) {  title.style.cursor = "pointer";
  title.onclick = () => {
    const unitNames = [...document.querySelectorAll("tr th:nth-child(1)")]
      .filter((_) => _.textContent.includes("Normal: "))
      .map((_) => _.querySelector("a").textContent.trim());

    const content = {
      title: title.textContent.replace(/\(.*?\)/, "").trim(),
      units: unitNames,
    };
    navigator.clipboard.writeText(JSON.stringify(content));
    alert("Content Copied");
  };
}