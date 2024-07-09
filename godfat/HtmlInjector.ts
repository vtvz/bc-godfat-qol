import Banners from "./Banners";
import TierLabels from "./TierLabels";
import TierList from "./TierList";
import UnitsRarity from "./UnitsRarity";

export default class HtmlInjector {
  tierList: TierList;
  unitToBanners: Banners;
  tierLabels: TierLabels;
  unitsRarity: UnitsRarity;

  constructor(
    tierList: TierList,
    unitToBanners: Banners,
    tierLabels: TierLabels,
    unitsRarity: UnitsRarity,
  ) {
    this.tierList = tierList;
    this.unitToBanners = unitToBanners;
    this.tierLabels = tierLabels;
    this.unitsRarity = unitsRarity;
  }

  inject() {
    const elms = document.querySelectorAll(
      ".cat a:first-child, .found_cats a:first-child, .cats label span",
    );

    const missed = new Set();

    for (const el of elms) {
      const unitName = el.textContent;
      const tiers = this.renderTiers(unitName);

      if (tiers) {
        el.innerHTML += tiers;
      } else {
        missed.add(unitName);
      }

      const elParent = el.parentElement;

      const unitBanners = this.renderBanners(
        unitName,
        !!el.closest(".found_cats"),
      );

      if (unitBanners) {
        elParent.innerHTML += unitBanners;
      }

      if (elParent.classList.contains("cat")) {
        elParent.classList.add("vtvz-" + this.unitsRarity.getRarity(unitName));
      }
    }

    console.log("missed", missed);

    this.injectStyle();
  }

  renderTiers(unitName: string): string {
    const tiers = this.tierList.asArray(unitName);

    if (!tiers) {
      return;
    }

    const htmlTiers = tiers
      .map((tier) => this.tierLabels.findByTier(tier))
      .map(({ tier, label }) => `<span title="${label}">[${tier}]</span>`);

    return `<sup><b>${htmlTiers.join(" ")}</b></sup>`;
  }

  renderBanners(unitName: string, isInline: boolean): string {
    const unitBanners = this.unitToBanners.asArray(unitName);
    if (!unitBanners) {
      return;
    }

    const links = unitBanners.map(
      (banner) =>
        `<a href="${banner.link}">${banner.title.replace("/Gacha Drop", "").replace(/Collaboration Event.*/, "")}</a>`,
    );

    const el = isInline ? "span" : "div";

    return `<${el} class="vtvz-banners">${links.join(" | ")}</${el}>`;
  }

  injectStyle() {
    var style = document.createElement("style");
    const styleText = `
      .owned {
        background-color: #34aeae !important;
      }

      .vtvz-banners {
        max-width: 350px;
        font-size: 14px;
      }

      .vtvz-legend:not(.legend) {
        # border-top: 25px solid darkviolet;
        background-color: darkviolet !important;
        color: #d8a56f !important;
      }

      .vtvz-legend:not(.legend) a {
        color: #d8a56f !important;
      }

      .vtvz-uber:not(.uber) {
        # border-top: 25px solid red;
        background-color: red !important;
      }

      .vtvz-super:not(.supa) {
        # border-top: 25px solid gold;
        background-color: gold !important;
      }

      .vtvz-rare {
      }

      .vtvz-special {
      }

      .vtvz-normal {
      }
    `;

    style.appendChild(document.createTextNode(styleText));

    document.getElementsByTagName("head")[0].appendChild(style);
  }
}
