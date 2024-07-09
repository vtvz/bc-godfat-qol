import { DescriptionData, banners, npChart, tierListRaw } from "./data";

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

const tierList: any = {};

tierList.addItem = (key, value) => {
  if (!tierList[key]) {
    tierList[key] = new Set();
  }
  tierList[key].add(value);
};

tierList.asArray = (key) => {
  const val = tierList[key];
  if (!val) {
    return;
  }
  return [...val];
};

for (const item of tierListRaw) {
  const [tier, unitsRaw] = item.split(" - ");

  const units = unitsRaw.replaceAll("’", "'").split(", ");

  for (const unit of units) {
    let unitName = unit;
    let unitTier = tier;

    const withCond = unit.match(new RegExp("(.*) \\((.*)\\)"));
    if (withCond) {
      let [, unitNameParsed, unitTierCond] = withCond;

      unitName = unitNameParsed;
      unitTier = `${unitTier}-${unitTierCond}`;
    }

    const fullName = descriptionData.nameToFullName[unitName];

    if (!fullName) {
      console.log("don't have full name", unitName);

      continue;
    }
    tierList.addItem(fullName, unitTier);
  }
}

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
  if (!tierList[fullName]) {
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
