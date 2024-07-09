// curl https://onestoppress.com/api/allcats | jq '.sampledata | map(.rarity) | unique'

export default class UnitsRarity {
  unitsRarity: { [key: string]: string };

  constructor(unitsRarity: { [key: string]: string }) {
    this.unitsRarity = unitsRarity;
  }

  getRarity(unitName: string): string {
    const nameToClass = {
      Basic: "basic",
      "Legendary Rare": "legend",
      Rare: "rare",
      Special: "special",
      "Super Rare": "super",
      "Uber Rare": "uber",
      "Uber Super Rare": "uber",
    };

    return nameToClass[this.unitsRarity[unitName]] || "unknown";
  }
}
