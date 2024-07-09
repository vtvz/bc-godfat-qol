import { DescriptionData, banners, npChart, tierListRaw } from "./data";
import { TierList } from "./data/tierListRaw";

const descriptionData = new DescriptionData().parse();

const tierLabels = new Map();
tierLabels.set(
  /^TOP-/,
  "The best ubers. Spend everything you have to get them",
);
tierLabels.set(
  /^Fest-/,
  "Uberfest and Epicfest units. Very good and very rare. Should be prioritized. Fest's 'F' tier is 'A' for others",
);
tierLabels.set(/-UT$/, "Tier with Ultra Talents consideration");
tierLabels.set(/-UF$/, "Tier with Ultra Form consideration");

const tierList = new TierList(descriptionData).parse();

for (const npKey in npChart) {
  tierLabels.set("NP-" + npKey.toUpperCase(), npChart[npKey].label);

  for (const fullName of npChart[npKey].units) {
    tierList.addItem(fullName, "NP-" + npKey.toUpperCase());
  }
}

const unitToBanners: any = {};

unitToBanners.addItem = (key, value) => {
  if (!unitToBanners[key]) {
    unitToBanners[key] = new Set();
  }
  unitToBanners[key].add(value);
};

unitToBanners.asArray = (key) => {
  const val = unitToBanners[key];
  if (!val) {
    return;
  }
  return [...val];
};

for (const banner of banners) {
  for (const fullName of banner.units) {
    unitToBanners.addItem(fullName, banner);
  }
}

console.log("tierList", tierList);

for (const fullName of descriptionData.fullNames) {
  if (!tierList.asArray(fullName)) {
    console.log(`${fullName} is not found in tierlist`);
  }
}

if (typeof window !== "undefined") {
  const elms = document.querySelectorAll(
    ".cat a:first-child, .found_cats a:first-child, .cats label span",
  );

  const missed = new Set();

  for (const el of elms) {
    const text = el.textContent;
    const tiers = tierList.asArray(text);

    if (tiers) {
      const htmlTiers = tiers
        .map((tier) => {
          const found = [...tierLabels.entries()].find(([key, _]) =>
            tier.match(key),
          );

          if (found) {
            return [tier, found[1]];
          }

          return [tier, ""];
        })
        .map(([tier, label]) => `<span title="${label}">[${tier}]</span>`);

      el.innerHTML += `<sup><b>${htmlTiers.join(" ")}</b></sup>`;
    } else {
      missed.add(text);
    }

    const unitBanners = unitToBanners.asArray(text);
    if (unitBanners) {
      el.parentElement.innerHTML +=
        '<div class="vtvz-banners">' +
        unitBanners
          .map(
            (banner) =>
              `<a href="${banner.link}">${banner.title.replace("/Gacha Drop", "").replace(/Collaboration Event.*/, "")}</a>`,
          )
          .join(" | ") +
        "</div>";
    }
  }

  console.log("missed", missed);

  var style = document.createElement("style");
  style.type = "text/css";
  const styleText = `
    .vtvz-banners {
      max-width: 350px;
      font-size: 14px;
    }

    .owned {
      background-color: #34aeae !important;
    }
  `;

  style.appendChild(document.createTextNode(styleText));

  document.getElementsByTagName("head")[0].appendChild(style);
}
