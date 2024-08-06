import { NpChartItems } from "./data/npChartRaw";

export default class TierLabels {
  labels: Map<any, [string, string]> = new Map();

  constructor() {
    this.labels.set(/^TOP-/, [
      "TOP-1",
      "The best ubers. Spend everything you have to get them",
    ]);

    this.labels.set(/^Fest-[A-Z]+/, [
      "Fest-S",
      "Fest units. Very good and very rare. Should be prioritized. Fest's 'F' tier is 'A' for others",
    ]);

    this.labels.set(/^Fest-[0-9]+/, [
      "Fest-1",
      "Fest numeric priority. Less is better",
    ]);

    this.labels.set(/^Ban-[0-9]+/, ["Ban-1", "Priority within main banner"]);

    this.labels.set(/^L-/, [
      "L-1",
      "Numeric priorities of legend rares. Less is better",
    ]);

    this.labels.set(/-UT$/, ["S-UT", "Tier with Ultra Talents consideration"]);

    this.labels.set(/-UF$/, ["S-UF", "Tier with Ultra Form consideration"]);

    this.labels.set(/^S$/, [
      "S",
      "Extremely overpowered units who excel in their niche and general end game performance. Ubers that typically land around top 30 are placed here",
    ]);

    this.labels.set(/^A$/, [
      "A",
      "Insanely powerful units who only suffer from minor blemishes. Shines above lower tiers either through surpassing generalist expectations or being particularly powerful at their niche",
    ]);

    this.labels.set(/^B$/, [
      "B",
      "Very strong units who are often used as powerful specialists",
    ]);

    this.labels.set(/^C$/, [
      "C",
      "Average units who are sufficient for their usage and offer a well balanced kit",
    ]);

    this.labels.set(/^D$/, [
      "D",
      "Slightly below average units who may struggle in a few of their designated departments. Typically have niche overlaps with a non uber unit or have generic roles",
    ]);

    this.labels.set(/^E$/, [
      "E",
      "Bad units who do not offer value through their niche, usually being outclassed by a handful of non uber options both in niche and generalist aspects. Only spared from F due to very small and situational scenarios",
    ]);

    this.labels.set(/^F$/, [
      "F",
      "Garbage units who have little to no use. Either completely outdone by non uber units or serve zero purpose to exist",
    ]);
  }

  npChart(npChart: NpChartItems): TierLabels {
    for (const npKey in npChart) {
      this.labels.set("NP-" + npKey.toUpperCase(), [
        "NP-" + npKey.toUpperCase(),
        npChart[npKey].label,
      ]);
    }
    return this;
  }

  findByTier(tier: string): { tier: string; label: string } {
    for (const [key, label] of this.labels.entries()) {
      if (tier.match(key)) {
        return { tier, label: label[1] };
      }
    }

    return { tier, label: "" };
  }
}
