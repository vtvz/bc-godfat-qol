// from NP Chart
// https://imgur.com/a/np-charts-9rAfl93

export interface NpChartItem {
  label: string;
  units: string[];
}

export type NpChartItems = { [key: string]: NpChartItem };

const npChart: NpChartItems = {
  sell: {
    label: "Just sell them",
    units: [
      "Witch Cat",
      "Fortune Teller Cat",
      "Thief Cat",
      "Cat Gunslinger",
      "Shaman Cat",
      "Tin Cat",
      "Gardener Cat",
      "Psychocat",
      "Stilts Cat",
      "Good-Luck Ebisu",
      "Bodhisattva Cat",
      "Bishop Cat",
      "Pirate Cat",
      "Onmyoji Cat",
      "Welterweight Cat",
      "Pogo Cat",
      "Backhoe Cat",
      "Metal Cat",
      "Gold Cat",
      "Cat Toaster",
      "Neneko",
      "Rich Cat III",
      "Sniper the Recruit",
      "Freshman Cat Jobs",
      "Piledriver Cat",
      "Driller Cat",
      "Cat Base Mini",
      "Apple Cat",
    ],
  },
  maybe: {
    label: "Decide youself",
    units: ["Fencer Cat", "Juliet Cat", "Viking Cat"],
  },
  "a-bit": {
    label: "Use a bit",
    units: [
      "Sushi Cat",
      "Kotatsu Cat",
      "Nymph Cat",
      "Surfer Cat",
      "Matador Cat",
      "Archer Cat",
    ],
  },
  starve: {
    label: "Use unless NP starve",
    units: ["Swimmer Cat", "Vaulter Cat"],
  },
  halfed: {
    label: "Use until halved / quartered",
    units: [
      "Jurassic Cat",
      "Salon Cat",
      "Rocker Cat",
      "Mer-Cat",
      "Wushu Cat",
      "Rover Cat",
      "Wheel Cat",
      "Hip Hop Cat",
      "Figure Skating Cats",
      "Weightlifter Cat",
    ],
  },
};

export default npChart;
