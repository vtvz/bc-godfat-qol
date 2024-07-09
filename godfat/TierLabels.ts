import { NpChartItems } from "./data/npChartRaw";

export default class TierLabels {
  labels: Map<any, string> = new Map();

  constructor() {
    this.labels.set(
      /^TOP-/,
      "The best ubers. Spend everything you have to get them",
    );
    this.labels.set(
      /^Fest-/,
      "Uberfest and Epicfest units. Very good and very rare. Should be prioritized. Fest's 'F' tier is 'A' for others",
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
