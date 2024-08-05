import { NpChartItems } from "./data/npChartRaw";

export default class TierLabels {
  labels: Map<any, string> = new Map();

  constructor() {
    this.labels.set(
      /^TOP-/,
      "The best ubers. Spend everything you have to get them",
    );
    this.labels.set(
      /^Fest-[A-Z]+/,
      "Fest units. Very good and very rare. Should be prioritized. Fest's 'F' tier is 'A' for others. Number means priority within Fest's banners",
    );

    this.labels.set(/^Fest-[0-9]+/, "Fest numeric priority. Less is better");
    this.labels.set(/^Ban-[0-9]+/, "Priority within banner");

    this.labels.set(
      /^L-/,
      "Numeric priorities of legend rares. Less is better",
    );
    this.labels.set(/-UT$/, "Tier with Ultra Talents consideration");
    this.labels.set(/-UF$/, "Tier with Ultra Form consideration");
  }

  npChart(npChart: NpChartItems): TierLabels {
    for (const npKey in npChart) {
      this.labels.set("NP-" + npKey.toUpperCase(), npChart[npKey].label);
    }
    return this;
  }

  findByTier(tier: string): { tier: string; label: string } {
    for (const [key, label] of this.labels.entries()) {
      if (tier.match(key)) {
        return { tier, label };
      }
    }

    return { tier, label: "" };
  }
}
