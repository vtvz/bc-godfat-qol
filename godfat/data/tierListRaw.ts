// Wrap and join
// ^v$hS"A,Jj

import { DescriptionData } from "./data";

//
const tierListRaw = [
  "TOP-1 - Dark Kasli",
  "TOP-2 - Phono",
  "TOP-3 - Balrog",
  "TOP-4 - Dark Phono",
  "TOP-5 - Izanagi",
  "TOP-6 - Miko Mitama",
  "TOP-7 - D’arktanyan",
  "TOP-8 - Yukimura",
  "TOP-9 - Chronos",
  "TOP-10 - Sirius",

  "S - Balrog, Lasvoss, Baby Cat (UF), Yukimura, Keiji, Kuu (UT), Kalisa, Windy (UF), Daliasan, Akira (UT), Saki, Vigler, Chronos, Poseidon, Anubis (UT), Amaterasu, Ganesha, Siege (UF), Tecoluga",
  "A - Baby Cat, Ice (UT), Satoru, Shingen (UT), Kai, Coppermine (UT), Lilin, Dioramos (UT), Kasa Jizo, Ushiwakamaru, Sarukani, Kintaro, Momotaro (UT), Momotaro, Thunder Jack, Warlock (UT), Catman, Aphrodite (UT), Lucifer, Aphrodite, Hades, Gaia, Deth Troy, Aethur, Thermae, Muu, Lumina, Nanaho, Kanna, Himeyuri (UT), Himeyuri",
  "B - Momoco, Ice, Cat Machine (UT), Cat Machine, Akechi, Shingen, Kenshin, Amakusa, Hanzo, Jeanne, Windy, Thundia, Twinstars, Terun, Ganglion, Hevijak, Raiden (UT), Gamereon, Cosmo, Kaguya (UF), Issun, Shitakiri, Warlock, Hayabusa, Prof Abyss, Mekako, Cyclops, White Rabbit (UF), Aset, Drednot, Rekon Korps, Bora, Gravi, Yamii, Ruri (UT), Ruri, Reika, Balaluga, Asiluga",
  "C - Paladin, Tengu, Musashi, Yoshimoto, Oda (UF), Masamune (UT), Vars, Gundros, Raiden, Kachi Kachi (UT), Kachi Kachi, Kaguya, Akira, Zeus (UT), Anubis, Bomburr, Volta, Aer (UF), Vega, Deale, Shishilan, Kubiluga, Furiluga",
  "D - Nurse (UT), Nurse, Cat Clan Heroes, Kaihime, Masamune, Kuu, Pegasa, Gladios, Kamukura (UT), Kamukura, Megidora (UT), Megidora, Babel, Dioramos, Zeus, Mizli, Tetsukachi, Tomoe, Legeluga, Nekoluga (UT)",
  "E - Coppermine, Sodom, White Rabbit, Sphinx Korps, Siege, Envanz, Aer, Blizana, Verbena, Nekoluga, Kaoluga",
  "F - Oda, Myrcia, Nobiluga, Papaluga",

  "S - Izanagi",
  "A - Gaia, Nanaho, Black Zeus, Izanami, Ushi, Muu, Lumina",
  "B - Emperor, Momoco, Doktor Heaven, Jeanne",
  "C - Akuma, Musashi",
  "D - Babel, Legeluga",

  "Fest-S - Dark Kasli, Phono, Dark Phono, Izanagi",
  "Fest-A - Mitama, D’arktanyan",
  "Fest-B - Kasli, Dartanyan, Gao",
  "Fest-C - Shadow Gao, Izanami",
  "Fest-D - Dark Izu, Izu",
  "Fest-E - Dark Mitama, Garu",
  "Fest-F - Dark Garu",

  // NOTE: PATCH
  "E - Envanz",
];

export default tierListRaw;

export class TierList {
  descriptionData: DescriptionData;
  tierList: Map<string, Set<string>> = new Map();

  constructor(descriptionData: DescriptionData) {
    this.descriptionData = descriptionData;
  }

  addItem(key: string, value: string) {
    if (!this.tierList[key]) {
      this.tierList[key] = new Set();
    }
    this.tierList[key].add(value);
  }

  asArray(key: string): string[] {
    const val = this.tierList[key];
    if (!val) {
      return;
    }

    return [...val];
  }

  parse(): TierList {
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

        const fullName = this.descriptionData.nameToFullName[unitName];

        if (!fullName) {
          console.log("don't have full name", unitName);

          continue;
        }
        this.addItem(fullName, unitTier);
      }
    }

    console.log(this);

    return this;
  }
}
