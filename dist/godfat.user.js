// ==UserScript==
// @name        Battle Cats GodFat QoL Tools
// @description Injects a lot of useful information to bc.godfat.org seed tracker
// @namespace   https://github.com/vtvz/bc-godfat-qol
// @version     2.10.0
// @match       https://bc.godfat.org/*
// @author      vtvz
// @updateURL   https://raw.githubusercontent.com/vtvz/bc-godfat-qol/master/dist/godfat.user.js
// @downloadURL https://raw.githubusercontent.com/vtvz/bc-godfat-qol/master/dist/godfat.user.js
// ==/UserScript==
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Banners {
    constructor() {
        this.unitToBanners = new Map();
    }
    addItem(key, value) {
        if (!this.unitToBanners[key]) {
            this.unitToBanners[key] = new Set();
        }
        this.unitToBanners[key].add(value);
    }
    asArray(key) {
        const val = this.unitToBanners[key];
        if (!val) {
            return;
        }
        return [...val];
    }
    parse(banners) {
        for (const banner of banners) {
            for (const fullName of banner.units) {
                this.addItem(fullName, banner);
            }
        }
        return this;
    }
}
exports.default = Banners;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DescriptionData {
    constructor() {
        this.fullNames = [];
        this.nameToFullName = {
            Siege: "Mighty Kat-A-Pult",
            Ice: "Ice Cat",
            Issun: "Issun Boshi",
            "Prof Abyss": "Doktor Heaven",
            Shishilan: "Togeluga",
            Ushi: "Ushiwakamaru",
            Emperor: "Emperor Cat",
            Akuma: "Akuma",
            Dartanyan: "D'artanyan",
            Sirius: "Goddess of Light Sirius",
        };
    }
    parse(data) {
        const names = [];
        for (const index in data) {
            const item = data[index];
            if (parseInt(index) % 2 == 0) {
                names.push(item.replaceAll("’", "'").split(" - ")[0]);
            }
            else {
                const [, realName] = item.match(new RegExp(".*/(.*)_\\(.*?\\)"));
                this.fullNames.push(decodeURI(realName.replaceAll("_", " ")).replaceAll("’", "'"));
            }
        }
        for (const index in names) {
            this.nameToFullName[names[index]] = this.fullNames[index];
            this.nameToFullName[this.fullNames[index]] = this.fullNames[index];
        }
        return this;
    }
}
exports.default = DescriptionData;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HtmlInjector {
    constructor(tierList, unitToBanners, tierLabels, unitsRarity) {
        this.tierList = tierList;
        this.unitToBanners = unitToBanners;
        this.tierLabels = tierLabels;
        this.unitsRarity = unitsRarity;
    }
    renderBigBanner() {
        const notice = document.querySelector(".information");
        if (!notice) {
            return;
        }
        const banner = document.createElement("div");
        const tierDesc = Array.from(this.tierLabels.labels)
            .map(([_, [tier, desc]]) => `<b><sup>[${tier}]</sup></b> ${desc}`)
            .join("</li><li>");
        banner.id = "vtvz-big-banner";
        banner.innerHTML = `
      <p>
        You're using <a href="https://github.com/vtvz/bc-godfat-qol/">Battle Cats GodFat QoL Tools</a> created by <a href="https://github.com/vtvz">vtvz</a>
      </p>

      <details>
	      <summary>Here is "documentation" of tags</summary>
        <ul>
          <li>${tierDesc}</li>
          <li>Sell all <b>duplicate</b> Ubers, Legend rares and all Nenekos for NP</li>
        </ul>
      </details>

      <details>
	      <summary>Sources</summary>
        <ul>
          <li><a href="https://docs.google.com/document/u/0/d/10jGnHCqKcaVoQ6uPxohy57YKhQUjo20H_ddVXzSot3I">Tier Lists</a></li>
          <li><a href="https://imgur.com/a/np-charts-9rAfl93">NP Charts</a></li>
        </ul>
      </details>

      <details>
	      <summary>Credits</summary>
        <ul>
          <li><a href="https://www.reddit.com/user/XskullBC/">XskullBC</a> for NP Charts and Tier lists</li>
          <li><a href="https://github.com/vtvz">vtvz</a> for code</li>
        </ul>
      </details>
    `;
        notice.insertAdjacentElement("afterend", banner);
    }
    inject() {
        this.renderBigBanner();
        const elms = document.querySelectorAll(".cat a:first-child, .found_cats a:first-child, .cats label span");
        const missed = new Set();
        for (const el of elms) {
            const unitName = el.textContent;
            const tiers = this.renderTiers(unitName);
            if (tiers) {
                el.innerHTML += tiers;
            }
            else {
                missed.add(unitName);
            }
            const elParent = el.parentElement;
            const unitBanners = this.renderBanners(unitName, !!el.closest(".found_cats"));
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
    renderTiers(unitName) {
        const tiers = this.tierList.asArray(unitName);
        if (!tiers) {
            return;
        }
        const htmlTiers = tiers
            .map((tier) => this.tierLabels.findByTier(tier))
            .map(({ tier, label }) => `<span title="${label}">[${tier}]</span>`);
        return `<sup><b>${htmlTiers.join(" ")}</b></sup>`;
    }
    renderBanners(unitName, isInline) {
        const unitBanners = this.unitToBanners.asArray(unitName);
        if (!unitBanners) {
            return;
        }
        const links = unitBanners.map((banner) => `<a href="${banner.link}">${banner.title.replace("/Gacha Drop", "").replace(/Collaboration Event.*/, "")}</a>`);
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

      #vtvz-big-banner {
        border: 1px solid black;
        padding: 10px;
        margin-bottom: 10px;
        max-width: 1000px;
        display: inline-block;
      }

      #vtvz-big-banner ul {
        margin-bottom: 0;
      }

      #vtvz-big-banner summary {
        cursor: pointer;
      }
    `;
        style.appendChild(document.createTextNode(styleText));
        document.getElementsByTagName("head")[0].appendChild(style);
    }
}
exports.default = HtmlInjector;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TierLabels {
    constructor() {
        this.labels = new Map();
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
    npChart(npChart) {
        for (const npKey in npChart) {
            this.labels.set("NP-" + npKey.toUpperCase(), [
                "NP-" + npKey.toUpperCase(),
                npChart[npKey].label,
            ]);
        }
        return this;
    }
    findByTier(tier) {
        for (const [key, label] of this.labels.entries()) {
            if (tier.match(key)) {
                return { tier, label: label[1] };
            }
        }
        return { tier, label: "" };
    }
}
exports.default = TierLabels;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TierList {
    constructor(descriptionData) {
        this.tierList = new Map();
        this.descriptionData = descriptionData;
    }
    addItem(key, value) {
        if (!this.tierList[key]) {
            this.tierList[key] = new Set();
        }
        this.tierList[key].add(value);
    }
    asArray(key) {
        const val = this.tierList[key];
        if (!val) {
            return;
        }
        return [...val];
    }
    parse(tierListRaw) {
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
                    console.log("don't have full name in desc", unitName);
                    this.addItem(unitName, unitTier);
                    continue;
                }
                this.addItem(fullName, unitTier);
            }
        }
        return this;
    }
    npChart(npChart) {
        for (const npKey in npChart) {
            for (const fullName of npChart[npKey].units) {
                this.addItem(fullName, "NP-" + npKey.toUpperCase());
            }
        }
        return this;
    }
}
exports.default = TierList;

},{}],6:[function(require,module,exports){
"use strict";
// curl https://onestoppress.com/api/allcats | jq '.sampledata | map(.rarity) | unique'
Object.defineProperty(exports, "__esModule", { value: true });
class UnitsRarity {
    constructor(unitsRarity) {
        this.unitsRarity = unitsRarity;
    }
    getRarity(unitName) {
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
exports.default = UnitsRarity;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Got from wiki with `dist/wiki.js` script
const banners = [
    {
        title: "Dynasty Fest",
        link: "https://battle-cats.fandom.com/wiki/Dynasty_Fest_(Gacha_Event)",
        units: [
            "Emperor Cat",
            "Hallowindy",
            "Spooky Thundia",
            "Frosty Kai",
            "Santa Kuu",
            "Holy Coppermine",
            "Tropical Kalisa",
            "Midsummer Rabbit",
            "Lilith Cat",
            "Yuletide Nurse",
            "Springtime Kenshin",
            "Bunny & Canard",
            "Seashore Kai",
            "Waverider Kuu",
            "Seabreeze Coppermine",
            "Snow Angel Twinstars",
            "Squirtgun Saki",
            "Summerluga",
            "Skull Rider Vars",
            "Keiji Claus",
            "Sweet Aphrodite",
            "First-Love Myrcia",
            "Blooming Kamukura",
            "Kaguya of the Coast",
            "Sweet Love Mekako",
            "Lovestruck Lesser Demon",
            "Chronos the Bride",
            "Night Beach Lilin",
            "Count Yukimura",
            "Reindeer Terun",
            "White Butler Vigler",
            "Betrothed Balaluga",
            "Rabbit Satoru",
            "// others",
            "Gloomy Neneko",
            "Sunny Neneko",
            "Years-End Neneko",
            "Easter Neneko",
            "Valentine's Neneko",
            "Suntan Cat",
            "Lifeguard Cats",
        ],
    },
    {
        title: "Tales of the Nekoluga",
        link: "https://battle-cats.fandom.com/wiki/Tales_of_the_Nekoluga_(Gacha_Event)",
        units: [
            "Legeluga",
            "Nekoluga",
            "Asiluga",
            "Kubiluga",
            "Tecoluga",
            "Balaluga",
            "Togeluga",
            "Nobiluga",
            "Papaluga",
            "Furiluga",
            "Kaoluga",
            "Mimiluga",
        ],
    },
    {
        title: "EPICFEST",
        link: "https://battle-cats.fandom.com/wiki/EPICFEST_(Gacha_Event)",
        units: [
            "Izanami of Dusk",
            "Shadow Gao",
            "Dark Mitama",
            "D'arktanyan",
            "Kasli the Bane",
            "Dark Aegis Garu",
            "Iz the Dancer of Grief",
            "King of Doom Phono",
        ],
    },
    {
        title: "Frontline Assault Iron Legion",
        link: "https://battle-cats.fandom.com/wiki/Frontline_Assault_Iron_Legion_(Gacha_Event)",
        units: [
            "Mighty Kristul Muu",
            "Mighty Kat-A-Pult",
            "Mighty Drednot",
            "Mighty Bomburr",
            "Mighty Rekon Korps",
            "Mighty Thermae D-Lux",
            "Mighty Aethur Ltd.",
            "Mighty Deth-Troy-R",
            "Mighty Carrowsell",
            "Mighty Sphinx Korps",
            "Entangled Wooden Horse Javelins",
        ],
    },
    {
        title: "Nature's Guardians Elemental Pixies",
        link: "https://battle-cats.fandom.com/wiki/Nature%27s_Guardians_Elemental_Pixies_(Gacha_Event)",
        units: [
            "Lumina",
            "Bora",
            "Mizli",
            "Aer",
            "Voli",
            "Gravi",
            "Yamii",
            "Bliza",
            "Tekachi",
        ],
    },
    {
        title: "UBERFEST",
        link: "https://battle-cats.fandom.com/wiki/UBERFEST_(Gacha_Event)",
        units: [
            "Daybreaker Izanagi",
            "Baby Gao",
            "Miko Mitama",
            "D'artanyan",
            "Kasli the Scourge",
            "Baby Garu",
            "Iz the Dancer",
            "Child of Destiny Phono",
        ],
    },
    {
        title: "Girls & Monsters: Angels of Terror",
        link: "https://battle-cats.fandom.com/wiki/Girls_%26_Monsters:_Angels_of_Terror_(Gacha_Event)",
        units: [
            "Kyosaka Nanaho",
            "Trickster Himeyuri",
            "Sea Maiden Ruri",
            "Queen Reika",
            "Wolfchild Deale",
            "Graveflower Verbena",
            "Adventurer Kanna",
            "Spectral Goth Vega",
            "Ninja Girl Tomoe",
        ],
    },
    {
        title: "Ancient Heroes Ultra Souls",
        link: "https://battle-cats.fandom.com/wiki/Ancient_Heroes_Ultra_Souls_(Gacha_Event)",
        units: [
            "Ushiwakamaru",
            "Urashima Taro",
            "The Grateful Crane",
            "Momotaro",
            "Kasa Jizo",
            "Princess Kaguya",
            "Kachi-Kachi",
            "Sarukani",
            "Kintaro",
            "Shitakiri Sparrow",
            "Issun Boshi",
            "Issun Boushi",
        ],
    },
    {
        title: "The Almighties The Majestic Zeus",
        link: "https://battle-cats.fandom.com/wiki/The_Almighties_The_Majestic_Zeus_(Gacha_Event)",
        units: [
            "Gaia the Creator",
            "Thunder God Zeus",
            "Anubis the Protector",
            "Radiant Aphrodite",
            "Shining Amaterasu",
            "Splendid Ganesha",
            "Wrathful Poseidon",
            "Empress Chronos",
            "Hades the Punisher",
            "Lucifer the Fallen",
            "Lightmother Aset",
            "Battle God Odin",
        ],
    },
    {
        title: "Dark Heroes",
        link: "https://battle-cats.fandom.com/wiki/Dark_Heroes_(Gacha_Event)",
        units: [
            "Doktor Heaven",
            "Akira",
            "Mekako Saionji",
            "Catman",
            "The White Rabbit",
            "Warlock and Pierre",
            "Hayabusa",
            "Detective Vigler",
            "Sharpshooter Saki",
            "White Knight Cyclops",
            "Thunder Jack",
            "Type-Monshiro",
        ],
    },
    /////////////////////
    {
        title: "Lords of Destruction Dragon Emperors",
        link: "https://battle-cats.fandom.com/wiki/Lords_of_Destruction_Dragon_Emperors_(Gacha_Event)",
        units: [
            "High Lord Babel",
            "Sodom",
            "Megidora",
            "Vars",
            "Kamukura",
            "Raiden",
            "Dioramos",
            "Ganglion",
            "Relentless Gladios",
            "Hevijak the Wicked",
            "Sea Serpent Daliasan",
            "King Berius",
        ],
    },
    {
        title: "Cyber Academy Galaxy Gals",
        link: "https://battle-cats.fandom.com/wiki/Cyber_Academy_Galaxy_Gals_(Gacha_Event)",
        units: [
            "Headmistress Jeanne",
            "Windy",
            "Thundia",
            "Kuu",
            "Kai",
            "Coppermine",
            "Kalisa",
            "Twinstars",
            "Myrcia",
            "Lilin",
            "Huntress Terun",
            "Pegasa",
            "Wise Emperor Nobel",
        ],
    },
    {
        title: "Sengoku Wargods Vajiras",
        link: "https://battle-cats.fandom.com/wiki/Sengoku_Wargods_Vajiras_(Gacha_Event)",
        units: [
            "Musashi Miyamoto",
            "Sanada Yukimura",
            "Maeda Keiji",
            "Oda Nobunaga",
            "Date Masamune",
            "Takeda Shingen",
            "Uesugi Kenshin",
            "Imagawa Yoshimoto",
            "Narita Kaihime",
            "Shiro Amakusa",
            "Hattori Hanzo",
            "Akechi Mitsuhide",
            "Honda Tadakatsu",
        ],
    },
    {
        title: "Tower of Saviors Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Tower_of_Saviors_Collaboration_Event/Gacha_Drop",
        units: ["Voluptuous Peony - Daji", "// others", "Mollyanna Cat"],
    },
    {
        title: "Easter Carnival",
        link: "https://battle-cats.fandom.com/wiki/Easter_Carnival_(Gacha_Event)",
        units: [
            "Springtime Kenshin",
            "Bunny & Canard",
            "Blooming Kamukura",
            "Rabbit Satoru",
            "Floral Kalisa",
            "// others",
            "Easter Neneko",
            "Brainwashed Cat",
            "Brainwashed Gross Cat",
            "Brainwashed Fish Cat",
        ],
    },
    {
        title: "White Day Capsules",
        link: "https://battle-cats.fandom.com/wiki/White_Day_Capsules_(Gacha_Event)",
        units: [
            "Date Masamune",
            "Urashima Taro",
            "Lucifer the Fallen",
            "Lovestruck Lesser Demon",
            "White Butler Vigler",
            "Thunder Jack",
            "Frozen Rose Cat",
            "// others",
            "Brainwashed Gross Cat",
            "Brainwashed Lizard Cat",
            "Brainwashed Titan Cat",
        ],
    },
    {
        title: "Hatsune Miku Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Hatsune_Miku_Collaboration_Event/Gacha_Drop",
        units: [
            "Hatsune Miku",
            "Sakura Miku",
            "Kagamine Rin & Len",
            "Megurine Luka",
            "Hatsune Miku: MM2020 Osaka",
            "Hatsune Miku: MM2020 Tokyo",
            "Snow Miku 2021",
            "Hatsune Miku XVI",
            "// others",
            "MEIKO & Cat",
            "KAITO & Cat",
            "Luka Cat",
            "Neko Rin",
            "Neko Len",
        ],
    },
    {
        title: "Gals of Summer",
        link: "https://battle-cats.fandom.com/wiki/Gals_of_Summer_(Gacha_Event)",
        units: [
            "Tropical Kalisa",
            "Midsummer Rabbit",
            "Seashore Kai",
            "Waverider Kuu",
            "Seabreeze Coppermine",
            "Squirtgun Saki",
            "Summerluga",
            "Kaguya of the Coast",
            "Night Beach Lilin",
            "Coastal Explorer Kanna",
            "// others",
            "Sunny Neneko",
            "Suntan Cat",
            "Lifeguard Cats",
            "Brainwashed Axe Cat",
            "Brainwashed Bird Cat",
            "Brainwashed Titan Cat",
        ],
    },
    {
        title: "June Bride",
        link: "https://battle-cats.fandom.com/wiki/June_Bride_(Gacha_Event)",
        units: [
            "Ice Cat",
            "The Grateful Crane",
            "Graveflower Verbena",
            "Mizli",
            "Chronos the Bride",
            "Mighty Carrowsell",
            "Betrothed Balaluga",
            "756-1",
            "// others",
            "Brainwashed Cat",
            "Brainwashed Tank Cat",
            "Brainwashed Cow Cat",
        ],
    },
    {
        title: "Xmas Gals",
        link: "https://battle-cats.fandom.com/wiki/Xmas_Gals_(Gacha_Event)",
        units: [
            "Frosty Kai",
            "Santa Kuu",
            "Holy Coppermine",
            "Yuletide Nurse",
            "Snow Angel Twinstars",
            "Keiji Claus",
            "Reindeer Terun",
            "// others",
            "Brainwashed Tank Cat",
            "Brainwashed Cow Cat",
            "Brainwashed Lizard Cat",
        ],
    },
    {
        title: "Halloween Capsules",
        link: "https://battle-cats.fandom.com/wiki/Halloween_Capsules_(Gacha_Event)",
        units: [
            "Hallowindy",
            "Spooky Thundia",
            "Lilith Cat",
            "Skull Rider Vars",
            "Count Yukimura",
            "// others",
            "Gloomy Neneko",
            "Brainwashed Cat",
            "Brainwashed Gross Cat",
            "Brainwashed Fish Cat",
        ],
    },
    {
        title: "Street Fighter V Collaboration Event/Blue Team Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Street_Fighter_V_Collaboration_Event/Blue_Team_Gacha_Drop",
        units: [
            "Akuma",
            "Chun-Li",
            "Zangief",
            "Dhalsim",
            "Ken",
            "Vega",
            "Sagat",
            "Sakura",
            "// others",
            "C. Honda",
            "Balrog Cat",
            "Vega Cat",
            "Sagat Cat",
            "M. Bison Cat",
        ],
    },
    {
        title: "Street Fighter V Collaboration Event/Red Team Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Street_Fighter_V_Collaboration_Event/Red_Team_Gacha_Drop",
        units: [
            "Akuma",
            "Ryu",
            "Guile",
            "Blanka",
            "E. Honda",
            "Balrog",
            "M. Bison",
            "Luke",
            "// others",
            "C. Honda",
            "Balrog Cat",
            "Vega Cat",
            "Sagat Cat",
            "M. Bison Cat",
        ],
    },
    {
        title: "The Dynamites",
        link: "https://battle-cats.fandom.com/wiki/The_Dynamites_(Gacha_Event)",
        units: [
            "Wonder MOMOCO",
            "Ice Cat",
            "Cat Machine",
            "Lesser Demon Cat",
            "Marauder Cat",
            "Baby Cat",
            "Nurse Cat",
            "Cat Clan Heroes",
            "Lasvoss",
            "Summoner Satoru",
            "Cat Tengu",
            "Cat Maid",
        ],
    },
    {
        title: "Valentine Gals",
        link: "https://battle-cats.fandom.com/wiki/Valentine_Gals_(Gacha_Event)",
        units: [
            "Uesugi Kenshin",
            "The White Rabbit",
            "Wolfchild Deale",
            "Sweet Aphrodite",
            "First-Love Myrcia",
            "Lilin",
            "Sweet Love Mekako",
            "// others",
            "Valentine's Neneko",
            "Brainwashed Axe Cat",
            "Brainwashed Bird Cat",
            "Brainwashed Titan Cat",
        ],
    },
    {
        title: "RoyalFest",
        link: "https://battle-cats.fandom.com/wiki/RoyalFest_(Gacha_Event)",
        units: [
            "Musashi Miyamoto",
            "Headmistress Jeanne",
            "High Lord Babel",
            "Ushiwakamaru",
            "Wonder MOMOCO",
            "Legeluga",
            "Mighty Kristul Muu",
            "Lumina",
            "Doktor Heaven",
            "Gaia the Creator",
            "Kyosaka Nanaho",
            "Princess Cat",
            "Ice Cat",
            "Kai",
            "Princess Kaguya",
            "Mekako Saionji",
            "Hallowindy",
            "Radiant Aphrodite",
            "Shining Amaterasu",
            "Springtime Kenshin",
            "Graveflower Verbena",
            "Narita Kaihime",
            "Myrcia",
            "Snow Angel Twinstars",
            "Sharpshooter Saki",
            "Summerluga",
        ],
    },
    // manual
    {
        title: "Neon Genesis Evangelion Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Neon_Genesis_Evangelion_Collaboration_Event/Gacha_Drop",
        units: [
            "Eva Unit-00",
            "Eva Unit-01",
            "Eva Unit-02",
            "Eva Unit-08",
            "Shinji Cat",
            "Moon Operators",
            "AAA Wunder",
            "One-Eyed Asuka",
            "// others",
            "Rei Ayanami",
            "Asuka Langley",
            "Mari Illustrious",
            "Misato Katsuragi",
            "Ritsuko Akagi",
            "Rei Ayanami (???)",
            "Rei Cat",
            "Asuka Cat",
            "Mari Cat",
            "Kaworu Cat",
        ],
    },
    {
        title: "Neon Genesis Evangelion Collaboration Event/2nd Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Neon_Genesis_Evangelion_Collaboration_Event/2nd_Gacha_Drop?so=search",
        units: [
            "Night Oracle Rei",
            "The 4th Angel",
            "The 6th Angel",
            "The 10th Angel",
            "The 9th Angel",
            "Eva Unit-13",
            "// others",
            "Rei Ayanami",
            "Asuka Langley",
            "Mari Illustrious",
            "Misato Katsuragi",
            "Ritsuko Akagi",
            "Rei Ayanami (???)",
            "Rei Cat",
            "Asuka Cat",
            "Mari Cat",
            "Kaworu Cat",
        ],
    },
    {
        title: "Ranma 1/2 Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Ranma_1/2_Collaboration_Event/Gacha_Drop?so=search",
        units: [
            "Ranma Saotome (M)",
            "Akane Tendo",
            "Ryoga Hibiki (Pig)",
            "Shampoo (Cat)",
            "Mousse (Duck)",
            "Ranma Saotome (Leotard)",
            "// others",
            "Happosai",
            "Ukyo Kuonji (GR)",
            "Tatewaki Kuno (Gi)",
            "Genma Saotome (Panda)",
            "Akane Cat",
        ],
    },
    {
        title: "Merc Storia Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Merc_Storia_Collaboration_Event/Gacha_Drop",
        units: [
            "Wyvern",
            "Hearscht",
            "Cornelia",
            "Juvens",
            "Mystica",
            "Michelia",
            "Todomeki",
            "Eyewaltz",
            "// others",
            "Aura",
            "Rei",
            "Alois",
            "Citrouille",
            "Orthos",
            "Celesse",
            "Nono",
            "Olga",
            "Norn",
            "Yoichi",
            "Serum",
            "Fuu",
        ],
    },
    {
        title: "Shoumetsu Toshi Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Shoumetsu_Toshi_Collaboration_Event/Gacha_Drop?so=search",
        units: [
            "Mystery Girl Yuki",
            "Crazed Yuki",
            "Lost World Yuki",
            "Benevolent Souma",
            "// others",
            "Otaku Geek Cat",
            "Souma Cat",
        ],
    },
    {
        title: "Fate/Stay Night: Heaven's Feel Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Fate/Stay_Night:_Heaven%27s_Feel_Collaboration_Event/Gacha_Drop",
        units: [
            "Saber",
            "Rin Tohsaka",
            "Illyasviel",
            "Archer",
            "Lancer",
            "Rider",
            "Gilgamesh",
            "Sakura Matou",
            "// others",
            "Kotomine & Gilgamesh Cats",
            "Sakura the Cat",
            "Rin the Cat",
            "Illya the Cat",
            "Archer the Cat",
            "Rider the Cat",
        ],
    },
    {
        title: "Power Pro Baseball Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Power_Pro_Baseball_Collaboration_Event/Gacha_Drop",
        units: [
            "Saki Nijima",
            "Subaru Hoshi",
            "Miyabi Oyama",
            "// others",
            "Aoi Hayakawa",
            "Mizuki Tachibana",
            "Hijiri Rokudo",
        ],
    },
    {
        title: "Puella Magi Madoka Magica Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Puella_Magi_Madoka_Magica_Collaboration_Event/Gacha_Drop",
        units: [
            "Madoka Kaname",
            "Homura Akemi",
            "Sayaka Miki",
            "Mami Tomoe",
            "Kyoko Sakura",
            "Bebe",
            "// others",
            "Kyubey",
            "Madoka Cat",
            "Homura Cat",
            "Sayaka Cat",
            "Mami Cat",
            "Kyoko Cat",
        ],
    },
    {
        title: "Wave Busters",
        link: "https://battle-cats.fandom.com/wiki/Wave_Busters_(Gacha_Event)",
        units: [
            "Hell Warden Emma",
            "Cat Machine",
            "Maeda Keiji",
            "Akira",
            "Togeluga",
            "Anubis the Protector",
            "Nobiluga",
            "Lasvoss",
            "// others",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
        ],
    },
    {
        title: "Princess Punt Sweets Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Princess_Punt_Sweets_Collaboration_Event/Gacha_Drop",
        units: [
            "PPT48",
            "Crazed Princess Punt",
            "HMS Princess",
            "Calette",
            "Herme",
            "// others",
            "Yurinchi",
            "Reaper",
            "Hina",
            "Swordsman",
            "Cow Princess",
            "Li'l Gau",
        ],
    },
    {
        title: "Best of the Best",
        link: "https://battle-cats.fandom.com/wiki/Best_of_the_Best_(Gacha_Event)",
        units: [
            "Li'l Valkyrie",
            "Iz the Dancer",
            "Lesser Demon Cat",
            "Vars",
            "Kai",
            "Momotaro",
            "Splendid Ganesha",
            "Sea Maiden Ruri",
            "Bora",
            "Nobiluga",
            "Sharpshooter Saki",
            "Mighty Aethur Ltd.",
            "Shiro Amakusa",
            "// others",
            "Good-Luck Ebisu",
        ],
    },
    {
        title: "NEO Best of the Best",
        link: "https://battle-cats.fandom.com/wiki/NEO_Best_of_the_Best_(Gacha_Event)",
        units: [
            "Li'l Valkyrie Dark",
            "Iz the Dancer of Grief",
            "Lesser Demon Cat",
            "Vars",
            "Kai",
            "Momotaro",
            "Splendid Ganesha",
            "Sea Maiden Ruri",
            "Bora",
            "Nobiluga",
            "Sharpshooter Saki",
            "Mighty Aethur Ltd.",
            "Shiro Amakusa",
            "// others",
            "Good-Luck Ebisu",
        ],
    },
    {
        title: "Bikkuriman Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Bikkuriman_Collaboration_Event/Gacha_Drop",
        units: [
            "Black Zeus",
            "Super Zeus",
            "Holy Phoenix",
            "Super Devil",
            "Satanmaria",
            "Heracrist",
            "Shaman Khan",
            "// others",
            "Fiendish Nero",
            "Holy Knight Alibaba",
        ],
    },
    {
        title: "Metal Busters",
        link: "https://battle-cats.fandom.com/wiki/Metal_Busters_(Gacha_Event)",
        units: [
            "Sakura Sonic",
            "Marauder Cat",
            "Princess Kaguya",
            "Tecoluga",
            "Hayabusa",
            "Wrathful Poseidon",
            "// others",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
            "Gloomy Neneko",
            "Sunny Neneko",
            "Years-End Neneko",
            "Easter Neneko",
            "Valentine's Neneko",
        ],
    },
    {
        title: "Air Busters",
        link: "https://battle-cats.fandom.com/wiki/Air_Busters_(Gacha_Event)",
        units: [
            "Strike Unit R.E.I.",
            "Baby Cat",
            "Nurse Cat",
            "Windy",
            "Kai",
            "Coppermine",
            "Sodom",
            "Megidora",
            "The Grateful Crane",
            "Catman",
            "Karasu-Tengu Tenten",
            "// others",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
        ],
    },
    {
        title: "Red Busters",
        link: "https://battle-cats.fandom.com/wiki/Red_Busters_(Gacha_Event)",
        units: [
            "Pai-Pai",
            "Ice Cat",
            "Cat Machine",
            "Thundia",
            "Kuu",
            "Kamukura",
            "Raiden",
            "Date Masamune",
            "Momotaro",
            "The White Rabbit",
            "Mighty Drednot",
            "Sharpshooter Saki",
            "Hevijak the Wicked",
            "// others",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
        ],
    },
    {
        title: "Survive! Mola Mola! Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Survive!_Mola_Mola!_Collaboration_Event/Gacha_Drop",
        units: [
            "Mola King",
            "Mola King",
            "// others",
            "Baby Mola",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Baby Mola",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
        ],
    },
    {
        title: "Colossus Busters",
        link: "https://battle-cats.fandom.com/wiki/Colossus_Busters_(Gacha_Event)",
        units: [
            "Goddess of Light Sirius",
            "Huntress Terun",
            "Hattori Hanzo",
            "Bliza",
            "Sea Serpent Daliasan",
            "Cat Tengu",
            "Mighty Carrowsell",
            "Spectral Goth Vega",
            "// others",
            "Gold Cat",
            "Cat Base Mini",
            "Neneko",
            "Metal Cat",
            "Sniper the Recruit",
            "Rich Cat III",
            "Freshman Cat Jobs",
        ],
    },
    {
        title: "Crash Fever Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Crash_Fever_Collaboration_Event/Gacha_Drop",
        units: ["Mobius", "// others", "Belial"],
    },
    {
        title: "Metal Slug Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Metal_Slug_Collaboration_Event/Gacha_Drop?so=search",
        units: [
            "HUGE HERMIT",
            "JUPITER KING",
            "DONALD MORDEN",
            "HI-DO",
            "Sol Dae Rokker",
            "// others",
            "SV-001",
            "ALLEN O'NEIL",
            "MARCO",
            "TARMA",
            "ERI",
            "FIO",
            "MARS PEOPLE",
        ],
    },
    {
        title: "Rurouni Kenshin Collaboration Event/Gacha Drop",
        link: "https://battle-cats.fandom.com/wiki/Rurouni_Kenshin_Collaboration_Event/Gacha_Drop",
        units: [
            "Kenshin Himura",
            "Sanosuke Sagara",
            "Aoshi Shinomori",
            "Hajime Saito",
            "// others",
            "Li'l Kaoru",
            "Li'l Yahiko",
        ],
    },
    // mannual
    //
    {
        title: "River City Ransom Collaboration Event",
        link: "https://battle-cats.fandom.com/wiki/River_City_Ransom_Collaboration_Event",
        units: ["High School Kingpin Riki", "Kunio-kun"],
    },
];
exports.default = banners;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = [
    "Ice Cat - Extremely powerful backliner from her strengthen ultra talent and very strong anti red/ metal CC. Has great compatibility in freezing and controlling both traits due to her common range advantage against melee, good uptime, and stackability. She roughly matches the DPS of Gao through strengthen except carries advantages such as super high mobility and cheap cost, is stunted by low HP.",
    "https://battle-cats.fandom.com/wiki/Ice_Cat_(Uber_Rare_Cat)",
    "Cat Machine - Very good anti red/ alien tank with very cheap cost, fast cooldown, and high speed. Also has wave blocker to counter wave enemies as well as very strong offense, however he carries a very long foreswing which can cause him to miss attacks or get left behind which somewhat damages his wave blocking skill. Struggles from niche overlaps from Roe, Soap, and Octopus from which Cat Machine is generally used as extra defense alongside them.",
    "https://battle-cats.fandom.com/wiki/Cat_Machine_(Uber_Rare_Cat)",
    "Balrog - One of the best ubers in the game due to his insanely cheap cost, batshit cooldown, and godlike offense. One of the highest DPS and damage per hit out of any uber along with synergizing super well with majority of ubers, unfathomably game breaking in later areas such as end/ post game. Has insane utility in specific strats against advents or other bosses as well as amazing usage as a generalist, notably for startoffs where spawning a single lone Balrog can hold off smaller enemies incredibly well while allowing you to build ridiculous amounts of cash. Has vulnerabilities against stages with enemies that rip apart frontliners as well as heavy peon spam stages due to his single target.",
    "https://battle-cats.fandom.com/wiki/Lesser_Demon_Cat_(Uber_Rare_Cat)",
    "Paladin - Best anti metal uber in the game due to his super cheap cost, fast cooldown, and high proc rate for critter. Also carries good damage to kill most metal enemies in only a couple hits along with high enough mobility to be used on even the roughest metal or mixed stages. Does have a slight niche overlap with Jurassic Cat and has zero versatility.",
    "https://battle-cats.fandom.com/wiki/Marauder_Cat_(Uber_Rare_Cat)",
    "Baby Cat - Extremely powerful melee attacker with very good cost, cooldown, and has high bulk and insane damage per hit. Shockwave is super strong and gives Baby Cat some pierce, with only a couple attacks having the capability to completely crush certain enemies, especially bosses and potentially surrounding support thanks to the wave. The high mobility also gives Baby very easy usage and earns tons of value. Foreswing and attack rate are a bit sluggish and can lead to high damage downtime or vulnerability against hyper aggressive enemies.",
    "https://battle-cats.fandom.com/wiki/Baby_Cat_(Uber_Rare_Cat)",
    "Nurse - Outdated uber with generic role and surface level procs. Gets outclassed by Ururun as a generalist and outdone by numerous non uber proc units such as Sanzo, Rodeo, Bomber, etc. Has mini surge for some CC extension but has overall minimal effect and acts as small bonus/ accuracy quality. Sage slayer viability is to be determined.",
    "https://battle-cats.fandom.com/wiki/Nurse_Cat_(Uber_Rare_Cat)",
    "Cat Clan Heroes - Okay CC unit with a good array of targets (red, floating, black, and notably relic) and fairly good mobility. Has great pierce, fast cooldown, good speed, and is very cheap for somewhat solid synergy and good flexibility. Struggles with offense and survivability.",
    "https://battle-cats.fandom.com/wiki/Cat_Clan_Heroes_(Uber_Rare_Cat)",
    "Lasvoss - Insanely overpowered nuker with one of the highest payoffs in the game. Can deal millions of damage in a single hit, killing bosses or severely damaging them in one swift stroke. Also carries high speed, every debuff immunity, and very quick cooldown along with carrying a super strong research combo L that serves as a direct replacement to BioBone with much bigger benefit in cooldown reduction. Unfortunately requires extremely specific setup and RNG in order to work at max potential.",
    "https://battle-cats.fandom.com/wiki/Lasvoss_(Uber_Rare_Cat)",
    "Satoru - Super powerful anti aku with great CC and very good shield pierce. Also has cheap cost, good cooldown, and wide LD attacks to increase shield piercing capabilities to make him one of the best anti aku ubers. Struggles in survivability and has mediocre offense.",
    "https://battle-cats.fandom.com/wiki/Summoner_Satoru_(Uber_Rare_Cat)",
    "Tengu - Fairly generic mid ranger that has a good amount of abilities from strong vs red/ angel, wave immune, and strengthen. Cheap and an overall solid option to combat red and angel, notably useful for being a direct counter to Exiel and viability in Baron Seal due to his colossus slayer and wave immunity.",
    "https://battle-cats.fandom.com/wiki/Cat_Tengu_(Uber_Rare_Cat)",
    "Dinosaur - A strong specialist sniper who deals extremely high piercing DPS against Angels. Has an all round well built kit with good HP, good KB count, and good cooldown. However, he struggles in having an unsafe standing range which considerably lowers general usage and can’t reliably counter higher ranged Angels without the help of peons or a stepping stone. Offers good control from his multi hit + LD attack with a summoner that synergizes well with his sniper kit but can interfere with his short cooldown.",
    // NOTE: PATCH added link as a new line
    "https://battle-cats.fandom.com/wiki/Dinosaur_(Uber_Rare_Cat)",
    "Momoco - Has wide wave attacks with high DPS and strong freeze procs against red, black, and angel, especially with the field wide wave attacks. Can deal good chip damage overtime with the wave, especially if a stepping stone is present. Struggles with survivability and has multi hits which can potentially make her miss attacks.",
    "https://battle-cats.fandom.com/wiki/Wonder_MOMOCO_(Legend_Rare_Cat)",
    "Yukimura - One of the best kamikaze rushers in the game. At max level, he exceeds the power of Awakened Bahamut when completely maxed in damage, HP, speed, cost, and cooldown. Extremely high mobility and safe uber that yields high reward. Also carries massive damage to blacks to completely decimate a trait, being best used as a unit that can take out a specific black enemy on the field or rebound constantly to handle a larger crowd. Only struggles against stages that may ward off kamikaze units, though that is rare to find due to Yukimura’s build and how speed can infiltrate most enemies.",
    "https://battle-cats.fandom.com/wiki/Sanada_Yukimura_(Uber_Rare_Cat)",
    "Keiji - A high mobility mid ranged tank who has cheap cost, cooldown, and extremely high DPS when strengthened. His bulky kit comes with a very cheap cost which makes his ease of usage and payoff very good. The DPS Keiji can accumulate overtime can be brutal and earn tons of value. He’s also an anti black tank with his resistance. He does have a bit of reliance on strengthen to activate his huge DPS and can only reposition once. Stats as a tanker are also quite below average in comparison to other tanks, but still holds up due to his insane mobility advantage.",
    "https://battle-cats.fandom.com/wiki/Maeda_Keiji_(Uber_Rare_Cat)",
    "Oda - A great anti aku freezer who has decent range, good bulk, high speed, fast attacks, and a little over 200% uptime on his procs for effortless perma freeze. Has uniqueness and value in his niche due to the lack of anti aku freezers. Also carries counter surge to retaliate against aku death surge and extend his CC while also having great surge damage through the ability, although he still takes full damage from surge attacks. Struggles immensely in general usage (especially survivability) along with being useless as an anti black, due to being completely outclassed by Bombercat in that field.",
    "https://battle-cats.fandom.com/wiki/Oda_Nobunaga_(Uber_Rare_Cat)",
    "Masamune - Very generic mid ranger whose generalist performance gets outclassed by Ururun. His knockback vs red and black are solid niches, especially with mini wave which can give him field wide KB, giving him small niche value.",
    "https://battle-cats.fandom.com/wiki/Date_Masamune_(Uber_Rare_Cat)",
    "Shingen - Extremely powerful nuker with high DPS, above average range, and solid attack rate combined with high damage per hit. Initially is able to hit black and alien, enhanced by talents to target angel, red, zombie, and aku for 6 trait specialist domination. His nuking has great compatibility and can crush all 6 traits with relative ease. Struggles with survivability, has long foreswing, and cannot hit traitless, floating, and relic. Getting cursed is detrimental due to how curse affects target only units.",
    "https://battle-cats.fandom.com/wiki/Takeda_Shingen_(Uber_Rare_Cat)",
    "Kenshin - A strong mid ranger with high bulk and damage against black and relic. Also carries knockback procs to ward off frontliners while having fairly decent mobility too, particularly with speed. Her high stats and valuable role against relics is noteworthy, as she can counter most relic enemies very well, giving her good performance in end game. She is a bit generic on the generalist side.",
    "https://battle-cats.fandom.com/wiki/Uesugi_Kenshin_(Uber_Rare_Cat)",
    "Yoshimoto - A solid sniper/ debuffer with good procs against black and aku. He has relatively high HP and decent damage for a sniper while standing at a pretty safe standing range and still delivering large piercing attacks. His most notable matchup is Tackey, from which his decent damage, high pierce, high bulk, and weaken procs both damage and neutralize Tackey effectively. His aku matchup is not as prestigious due to the lack of shield pierce and surge immune, but still has merits against a few higher ranged aku when accompanied with shield piercing units.",
    "https://battle-cats.fandom.com/wiki/Imagawa_Yoshimoto_(Uber_Rare_Cat)",
    "Kaihime - An okay backliner with good savage blows but very subpar niche. Their slowing against zombie and black is outdone by other options such as Housewife, Psychocat, and Rodeo, with their generalist stats being not much better than a unit like Ururun. Does have pretty good burst thanks to the nature of savage blows.",
    "https://battle-cats.fandom.com/wiki/Narita_Kaihime_(Uber_Rare_Cat)",
    "Amakusa - A powerful backliner who deals great damage to black and aku, with aku being notable for its relevance and Amakusa being on the top end of aku nukers, dealing staggering amounts of DPS that can brute force through even most aku shields. His generalist stats are also solid too, going a little above Ururun. Unfortunately has multi hit which makes him slightly better vs some shielded aku, but generally makes him miss a few of his attacks.",
    "https://battle-cats.fandom.com/wiki/Shiro_Amakusa_(Uber_Rare_Cat)",
    "Hanzo - A strong backliner with very high damage against floating and black. He has super quick foreswing that allows Hanzo to have very high accuracy while dealing the DPS you’d find on a bulky nuker. He also has pretty strong survivability with good HP and good KB count. Bonus freeze procs neutralize blacks and floatings briefly to regain ground. Has subpar generalist stats.",
    "https://battle-cats.fandom.com/wiki/Hattori_Hanzo_(Uber_Rare_Cat)",
    "Akechi - Long ranged sniper with good overall stats. Delivers strong DPS from a distance with high pierce, best matchups being backliner enemies who easily stand in his LD. Surge provides an occasional damage boost but spawns slightly within his blindspot, reducing accuracy but allowing for slight safety precaution. Carries guaranteed knockback procs which has great pushing power, being able to borderline juggle backliner angels and blacks with his somewhat fast attack rate. Summon synergizes very well in being able to knockback and damage enemies, covering his own blindspot. Suffers from insanely short inner range which impacts certain matchups and makes him not as favorable as a frontliner counter.",
    "https://battle-cats.fandom.com/wiki/Akechi_Mitsuhide_(Uber_Rare_Cat)",
    "Musashi - Very tanky mid ranger with high DPS and fast attack rates. Extremely bulky and has insanely good damage against black, however, his single target heavily stunts his compatibility as black enemies are often swarm type enemies. Does have high viability on black stages with minimal amount of peons and serves as a big version of Dragon Cat as a generalist.",
    "https://battle-cats.fandom.com/wiki/Musashi_Miyamoto_(Legend_Rare_Cat)",
    "Windy - The best anti floating uber in the game, Windy is a high ranged super backliner with 510 range, strong general DPS, and insane damage against floating. She can deal over a million damage to floatings in one hit, combined with hundreds of thousands of DPS, solid attack rate, decent foreswing, and the huge area attack. Bonus curse immune for better compatibility against relic mixed or curse base stages. Also has very good general stats, especially when strengthened, giving her arguably top end general backliner performance while also having a total of 6 KB. Strengthen does activate somewhat late at half HP and also has somewhat lowish HP.",
    "https://battle-cats.fandom.com/wiki/Windy_(Uber_Rare_Cat)",
    "Thundia - A very powerful anti red nuker that can reach hundreds of thousands of damage against red in just one hit. Has above average mobility and good survivability compared to other nukers, has great compatibility and a good strengthen talent. Does have long foreswing and attack rate.",
    "https://battle-cats.fandom.com/wiki/Thundia_(Uber_Rare_Cat)",
    "Kuu - An extremely overpowered generalist and specialist that’s strong against red, black, and relic. Deals very high nuking damage against all 3 traits while having high bulk, good KB count, and solid attack rate for a mix of high burst and strong reliability. Relic niche in particular shines for matching Luza, and exceeding him with generalist usage, from which Kuu is only slightly behind Gao as a generalist. Also functions as a very good anti surge mid ranger/ backliner.",
    "https://battle-cats.fandom.com/wiki/Kuu_(Uber_Rare_Cat)",
    "Kai - A frontline tank who excels both in huge defense and huge offense. She has one of the highest base HP among tanks in general, making her an absolute powerhouse against floating as well as being a general tank in stages where melee/ frontline cats are applicable. She has super high damage per hit and high DPS to provide as a powerful melee attacker and carries niche quality such as floating tanking and shield piercer to counter floating and aku enemies.",
    "https://battle-cats.fandom.com/wiki/Kai_(Uber_Rare_Cat)",
    "Coppermine - A powerful CC/ mid ranged attacker with extremely strong mobility. Her rapid attacks combined with high uptime, high proc rate, freeze, and mini surge allows her to shut down almost any floating enemy she can reach. Her surge deals a surprisingly high amount of damage on top of her base attack, leading her to become a very effective generalist for just her offensive output. Her insanely cheap cost and fast cooldown are the cherry on top of her wide ability set.",
    "https://battle-cats.fandom.com/wiki/Coppermine_(Uber_Rare_Cat)",
    "Kalisa - A fast, high damaging, mid ranged kamikaze unit with incredible burst potential. She’s got very high damage stats with super strong mobility which makes her great for general rushing. Her massive damage to angel makes her one of the best anti angel units in the game while also giving her a valuable niche that isn’t replicated by any other non uber counterpart.",
    "https://battle-cats.fandom.com/wiki/Kalisa_(Uber_Rare_Cat)",
    "Twinstars - A fast, rapid attacking mid ranger with extremely high DPS against aliens and blacks. Rapid attacking nature creates bad bursts, but very powerful juggling capabilities to counter swarms of black and aliens, through this they have very strong compatibility too. Pretty frail with low base HP.",
    "https://battle-cats.fandom.com/wiki/Twinstars_(Uber_Rare_Cat)",
    "Myrcia - Terrible unit who lacks in overall usage. Supposed defensive unit but carries below average dodge and underpowered base offense, even with wave attacks. Is unsuitable for most roles, carrying next to no value from it.",
    "https://battle-cats.fandom.com/wiki/Myrcia_(Uber_Rare_Cat)",
    "Lilin - One of the best anti aku ubers with her strong mobility, high stats vs aku, surge, and guaranteed shield piercer. Designed to be an aku destroyer and is arguably the best cat in her field to do so. Lacks surge immune, general usage, and is insufficient against angels.",
    "https://battle-cats.fandom.com/wiki/Lilin_(Uber_Rare_Cat)",
    "Terun - An average support unit with very high slow uptime against red and alien while having very cheap cost and fast cooldown. Can be stacked for easy perma slowing and reliable procs. Lacks in HP, offense, and has slight niche overlap with Witch and Psychocat.",
    "https://battle-cats.fandom.com/wiki/Huntress_Terun_(Uber_Rare_Cat)",
    "Pegasa - A generic backliner with below average offensive stats but above average mobility. Has good weaken procs against floating and zombies through her good range, guaranteed procs, and high uptime. Also has summon which does good burst damage and long duration weaken procs, though comes at the expense of restricting one Pegasa on the field at a time. Her weaken procs are more suitable as supplementary support over hard carry and also have slight niche overlap with Sanzo and Psychocat weaken.",
    "https://battle-cats.fandom.com/wiki/Pegasa_(Uber_Rare_Cat)",
    "Jeanne - Fast, high DPS piercing mid ranger with insane damage against red and floating. One of the best attackers for her field, notably floating for her quick attacks which can juggle and decimate crowds well while her huge DPS amount can accumulate tons of damage against bulkier red enemies. Is okay as a generalist and has decent survivability.",
    "https://battle-cats.fandom.com/wiki/Headmistress_Jeanne_(Legend_Rare_Cat)",
    "Megidora - A generic mid ranger/ backliner who has knockback and slow against floating, relic, and metal. Usage as a generalist is completely outclassed by Ururun, and usage as a proc unit is outclassed by sanzo, uril, and puppetmaster as well as doctor, rodeo, and quizmaster. Has some usage in favor of role compression, but largely remains irrelevant in later game environment.",
    "https://battle-cats.fandom.com/wiki/Megidora_(Uber_Rare_Cat)",
    "Sodom - Slow and expensive mid ranged tank with insufficient amounts of HP against floating and relic. Also has an extremely long attack rate and foreswing to create a fairly below average offense despite being above the DPS criteria for his range. Gets overshadowed by superior defense such as Modern, Corn, and Octopus.",
    "https://battle-cats.fandom.com/wiki/Sodom_(Uber_Rare_Cat)",
    "Vars - A generic backliner that’s outclassed by Ururun in general usage, but carries decent procs against blacks and relics, with relic knockback + slow being a notable ability for early UL stages and can act as an early version of Uril. Decreases in value over the course of the game once Uril is acquired and true formed. https://battle-cats.fandom.com/wiki/Vars_(Uber_Rare_Cat)",
    // NOTE: PATCH added link as a new line
    "https://battle-cats.fandom.com/wiki/Vars_(Uber_Rare_Cat)",
    "Kamukura - A generic and slow backliner who is outclassed by Ururun in general usage, but has a niche of being a ranged anti red tank and support with his resist, knockback, and slow against red. Unfortunately he’s very sluggish in his stats along with his abilities not carrying particularly good value, as red knockback, slow, and defense can be found in units like Witch, Pirate, and Roe. The lack of mobility leaves this unit to only be strong in early game stages for his range.",
    "https://battle-cats.fandom.com/wiki/Kamukura_(Uber_Rare_Cat)",
    "Raiden - A solid backliner who’s generalist usage gets outclassed by Ururun, but has a good niche with his strong against and guaranteed knockback against reds, which can offer more reliable pushing power and offense compared to someone like Pirate cat. He also has behemoth slayer and surge immune, giving him good relevance in end game stages for farming behemoths and countering surge spam stages along the likes of our current aresenal against them.",
    "https://battle-cats.fandom.com/wiki/Raiden_(Uber_Rare_Cat)",
    "Dioramos -  An extremely powerful back/ mid ranger, support, and mid ranged tank with very high bulk and extreme offense. Has super high DPS with slight piercing multi hits along with strengthen, bringing his DPS number to some of the best generalist backliners. Also has knockback and slow against angels and aliens, offering super strong ranged control and high consistency with piercing multi hits, being able to cover a wide area and occasionally doing double procs for massive pushing power. Struggles in cost, speed, cooldown, big foreswing, and has poor repositioning with only 2 knockbacks, preventing him from topping the table.",
    "https://battle-cats.fandom.com/wiki/Dioramos_(Uber_Rare_Cat)",
    "Ganglion - A great and fast rusher with high HP and damage against alien and zombie along with piercing attacks and rebound mechanics for very strong burst. Also has strong usage as a general rusher by sustaining overall very high stats. Has a bit of a foreswing and is quite expensive.",
    "https://battle-cats.fandom.com/wiki/Ganglion_(Uber_Rare_Cat)",
    "Gladios - A decent mid ranged support with knockback and slow against traitless. Has a valuable niche in being a sustainable traitless debuffer, but still faces niche overlaps with Glass and Tourist. Solid unit to have in specific scenarios by offering some okay-ish value. Unviable and outclassed by Ururun as generalist.",
    "https://battle-cats.fandom.com/wiki/Relentless_Gladios_(Uber_Rare_Cat)",
    "Hevijak - A good mid ranged tank who has resist and guaranteed knockback against red and aku, with aku being the more relevant target due to the lack of strong aku tanks in the meta. The addition of shield pierce also brings him into being one of the best anti aku ubers in the game, a great amount of value to hold in the later game meta. He can stay on the field for a long time, reliably shield piercing and protecting your units.",
    "https://battle-cats.fandom.com/wiki/Hevijak_the_Wicked_(Uber_Rare_Cat)",
    "Daliasan - An incredibly powerful general sniper with very high stats all round for his class. Has good HP with great survivability, high standing range, great pierce, and super strong general DPS for a sniper that place him among one of the best uber snipers in the game. Also has function as a support with his slow vs floating and angel, being able to somehow not get outclassed by sanzo despite the odds.",
    "https://battle-cats.fandom.com/wiki/Sea_Serpent_Daliasan_(Uber_Rare_Cat)",
    "Babel - Likewise to Sodom, a slow and expensive mid ranged tank who has extremely high effective HP against red and floating, but gets outclassed in both niches by Roe and Octopus. His DPS is also on the high end, but the terrible attack rate and ungodly long foreswing make his offense pretty bad in the big picture. Also has colossus slayer, but his offense is bad and tanking colossus is a very bad idea for how much DPS barons can accumulate. His mobility ruins most of his kit into being a very expensive form of supplementary defense.",
    "https://battle-cats.fandom.com/wiki/High_Lord_Babel_(Legend_Rare_Cat)",
    "Momotaro - A multi purpose anti red/ angel freezer who serves as a spammable freezer and attacker in first form and a high speed and bulky rusher in his evolved form. First form can be stacked against melee reds and angels for perma freezing and high DPS stackability, with evolved form having rather below average DPS but trades for having superb speed, cost, and insanely low cooldown along with powerful freeze and weaken procs with nearly 100% uptime, fast attacks, and good range. Also carries knockback, wave immunity, and mini wave for some strong pushing power and decent anti wave DPS, though his knockback can be nonoptimal on stages with backliners and can sabotage other stacked Peach Devils through speed clipping issues.",
    "https://battle-cats.fandom.com/wiki/Momotaro_(Uber_Rare_Cat)",
    "Kaguya - An okay debuffer who slows metals and angels. First form is spammable and can be stacked against melee metals and angels for easy perma slowing and good synergy with other crit units, albeit this function has overlap with puppet master and sanzo. Evolved form becomes a rather generic backliner with guaranteed slow, with fairly okay-ish uptime. Has merits especially on metal stages and can be used alongside or as an alternative to your metal debuffers. Ultra form inherits true form talents and gains metal killer for a spammable support that can easily whittle down the HP of any metal for an easy kill alongside other crit units, the combination of knockback and slow with high guaranteed anti metal offense putting her firmly as one of the best anti metal ubers.",
    "https://battle-cats.fandom.com/wiki/Princess_Kaguya_(Uber_Rare_Cat)",
    "Kasa Jizo - A funny egg who can stack incredibly high amounts of damage against blacks and angels. His cost effective and spammable nature make him ideal for destroying black and angel spam, garnering near perfect compatibility against both traits. Also has very strong general stats, being a completely superior version of Cyborg cat across the majority of the game. Also carries an evolved form that turns into a bulky nuker which patches up any previous matchup that first form may not deal with very well. Does have a slight niche overlap with Pizza and Mushroom in first form, but is still arguably superior to both even in end/ post game environment.",
    "https://battle-cats.fandom.com/wiki/Kasa_Jizo_(Uber_Rare_Cat)",
    "Gamereon - Mid ranged tank with resist vs black and angel. Notable for scoring millions of HP against both traits while having okay cost and decent damage output for his range, especially on the long term. His quality of being mid ranged helps immensely by avoiding certain melee enemies that are designed to shred tanks, but stands far back enough to protect your ranged attackers from serious harm. Struggles against some debuffs (especially curse on relic mix stages) and has very slow speed.",
    "https://battle-cats.fandom.com/wiki/Urashima_Taro_(Uber_Rare_Cat)",
    "Cosmo - A sniper and support unit with decent damage from extremely high standing range and carries very powerful procs against angels and floatings for amazing support. Is able to freeze, knockback, and curse angels and floatings at high ranges, potentially stunning an entire field if properly positioned or great for regaining or maintaining ground in a long term battle. Synergizes particularly well with Cyberpunk as both work in similar archetypes due to their similar roles while Cosmo also covers Cyberpunk, especially on angels and floatings he knocks back. Struggles a bit in speed clipping, carries extremely long attack rate, and one of the longest foreswings in the game with no pierce.",
    "https://battle-cats.fandom.com/wiki/The_Grateful_Crane_(Uber_Rare_Cat)",
    "Kachi Kachi - A subpar mid ranged rusher and support with lacking stats in damage and survivability. Suffers immensely with speed clipping, especially with only 2 knockbacks for 1 chance to reposition. Also carries extremely high cost pre talent, and strengthen ultra talent doesn’t bring his offense to a good enough level. Main value is found through his weaken against alien and angel, which carries guaranteed procs alongside almost 100% uptime, good for some synergy and prolonging the lifetime or certain units.",
    "https://battle-cats.fandom.com/wiki/Kachi-Kachi_(Uber_Rare_Cat)",
    "Sarukani - Sarukani is an anti zombie uber in the ultra souls set who is both a spammable AOE attacker in his first form and a backliner in his evolved forms. In his first form, Sarukani boasts strong stats against zombies and angels with his strong ability against them. His usage as an anti zombie is notable for his good range and damage against them as well as having relatively good HP for his class, being easily usable alongside similar units like Cadaver and Chief or as an alternative for the range safety. His evolved forms turn Sarukani into a backliner/ nuker who also carries good HP and damage against angels and zombies, with his zombie matchup again being notable for having great compatibility at countering the majority of zombies including cadaver bear. Through talents, they gain savage blow which allows them to burst ridiculously high amounts of damage in one hit, increasing their overall offense to high end generalist performance in backliner meta. Also gained toxic immunity for better niche compatibility and as general anti toxic.",
    "https://battle-cats.fandom.com/wiki/Sarukani_(Uber_Rare_Cat)",
    "Kintaro - An extremely powerful sniper and support with good speed, high damage, and excellent range with pierce. Savage blows allow for potentially lethal bursts of damage, powerful enough for good general usage and quality against angels. His main crowd control is 50% chance to slow and curse angels, occurring almost every attack cycle due to his 3 part multi hit which each have a chance to activate procs. Both abilities have good compatibility with his targeted trait and the wide LD attack gives him strong control. Suffering from some speed clipping and multi hit can potentially cause enemies to get knocked back mid attack, lowering the total offense.",
    "https://battle-cats.fandom.com/wiki/Kintaro_(Uber_Rare_Cat)",
    "Shitakiri - A good crowd controller with knockback and curse against aku and angels. While not great on offense, he delivers through his surprisingly high HP, fast attacks, and mini wave which combined with his guaranteed procs creates very strong and consistent pushing power to ward off aku and angels. Aku matchup is finicky due to lack of shield pierce, but can be patched through units such as Barrel and Aku Researcher. Also has surge immune to provide a niche anti surge backliner and better combat against aku. Lastly, he carries a small research combo with only himself, effectively turning into a great filler as well as one of the best research combos in the game.",
    "https://battle-cats.fandom.com/wiki/Shitakiri_Sparrow_(Uber_Rare_Cat)",
    "Issun Boshi - A kamikaze rusher with incredibly high speed, good cooldown, and cheap cost. Has very strong burst against angel and traitless along with omni range to increase attack accuracy. Being cheap and fast allows him to get value easily and deal huge damage to big angel/ traitless or kill medium sized foes. Has bad damage against non angel/ traitless, needs heavy boost in order to be viable as a generalist. You also get extra cool points by using Issun alongside Amaterasu.",
    "https://battle-cats.fandom.com/wiki/Issun_Boshi_(Uber_Rare_Cat)",
    "Ushiwakamaru - Another one of the best anti angels in the game, he is a designated specialist who carries extraordinary strats, deleting angels being his main function. He’s a spammable AOE attacker in first form who carries high bulk and insane cost efficiency that’s already enough to shut down most angels, but his evolved form becomes an incredibly powerful nuker who can kill the majority of angel enemies in just a few hits while having super high bulk thanks to the resist. His evolved form is also a fairly solid generalist.",
    "https://battle-cats.fandom.com/wiki/Ushiwakamaru_(Legend_Rare_Cat)",
    "Akira - An extremely powerful mid ranger/ sniper that has solid DPS with a very powerful surge for wide attack coverage. Can deal high damage in a large field, allowing him to clear peons, hit oncoming enemies, or snipe backliners. His frontliner DPS is also quite solid, being a fairly decent mid ranger with very strong DPS especially when strengthened. Speaking of, he has a large quantity of good abilities such as strong and freeze against alien and aku, giving him a powerful niche against both on top of the surge which makes him one of the best anti alien/ aku ubers out there. Lastly, he carries other abilities such as weaken, wave immune, strengthen, and lethal strike to further expand his usage and give him more quality. Suffers from having a slightly sluggish foreswing with no initial piercing.",
    "https://battle-cats.fandom.com/wiki/Akira_(Uber_Rare_Cat)",
    "Mekako - A good backliner with multiple abilities across different forms, with true form in particular being noteworthy for her massive damage against aliens and several procs such as slow, weaken, and knockback on top of the huge damage output she delivers. Also has quite good HP too. Struggles in survivability and has a very generic role.",
    "https://battle-cats.fandom.com/wiki/Mekako_Saionji_(Uber_Rare_Cat)",
    "Catman - A highly versatile nuker who targets angel, alien, floating, and relic. Carries high effective DPS against all of his targets while having good characteristics for a nuker such as great survivability, decent attack rate, good damage per hit, and fairly average mobility. The wide array of targets and easily applicable role makes him strong on mixed stages that may carry multiple of these traits together. Has lacking general stats and niche overlap with later UL legends in terms of relic matchups, being almost completely outclassed by Luza in post game environment.",
    "https://battle-cats.fandom.com/wiki/Catman_(Uber_Rare_Cat)",
    "White Rabbit - A solid backliner and support with good offense and supportive qualities against reds and aliens. In terms of her ultra form, she carries strong, weaken, and slow against her traits with acceptable levels of DPS and fairly decent proc uptime/ duration. As a backliner, she has staggering LD/ multi hit attacks that overlap on each other and creates a small amount of pierce, similarly in fashion to Dioramos. She also has other nice qualities such as good HP and high KB count for a backliner. She also carries Sage Slayer and can be used as a superior version to the Ururuns in that department. Her only major flaws are being quite expensive without cost down talent, operating within powercrept niches, and having relatively low effective DPS for specialist standards albeit the low DPS is balanced by having supportive abilities.",
    "https://battle-cats.fandom.com/wiki/The_White_Rabbit_(Uber_Rare_Cat)",
    "Warlock - An extremely powerful specialist who carries somewhat similar stats to Catman, from which Warlock carries the same targets being angel, alien, and floating. He serves as a high stat and super bulky backliner with huge damage per hit against his targets, shutting all of his traits down with sheer force. His kit is limited by his target only, which allows him to only be able to hit angel, floating, and alien, giving him zero general usage. Besides his power to nuke his traits, he also carries base destroyer in first form, being the first and only unit in the game to harbor such ability which gives some new usage for him being a cheese unit, though his function as cheeser remains more relevant in mid game over later game content. True form heavily increases his stats and gives him traitless target through ultra talents, serving as one of the best anti aliens and anti traitless in the game, rivaling that of shadow gao in pure stats. His full array of complete debuff immunities also emphasize his bulk, from which he carries absurdly high HP for his role. Struggles a bit in survivability due to his 2 knockbacks.",
    "https://battle-cats.fandom.com/wiki/Warlock_and_Pierre_(Uber_Rare_Cat)",
    "Hayabusa - A multi purpose rusher with many abilities across his multiple forms, first serving as a critical hitter and being one of the best anti metals in the game through his good crit chance, wide AOE, and huge damage against metals. Evolved becomes an anti alien with knockback and slow against aliens, offering as a highly strong pusher while avoiding Mizli Syndrome due to his role as a rusher and his LD being able to reach and push backliners, carrying viability even on backliner heavy stages. True forms becomes an anti zombie/ anti aku who also carries knockback and slow for good pushing power, but also carries shield piercer to enhance his anti aku capabilities as one of the best shield piercers in the game. Also has decent general stats through his rushing and LD. Struggles in survivability due to his somewhat noticeable blindspot, okay HP, and fast speed with no backswing, though it is alleviated through his very high KB count.",
    "https://battle-cats.fandom.com/wiki/Hayabusa_(Uber_Rare_Cat)",
    "Vigler - A broken combo unit with a medium research combo with Sumo Cat, easily being the best cat combo in the game with the huge utility it has in 4 crown stages. Allows cats such as Ramen, Maximum, Cameraman, and other units of around 4s cooldown to be reduced down to 2s, halving their recharge to the same as traditional meatshield. This majorly impacts strategies and can influence these units usage by a considerable amount, most of the time for spammability for better stalling or overwhelming enemies. Sumo himself is also a usable anti debuff meatshield that has usage in certain 4 crown stages, making this combo potentially only 1 slot worth of sacrifice for it’s huge benefits. Outside of combo, Vigler is a fairly okay uber with decent offense and procs. Combo is where almost all of his usage rests within.",
    "https://battle-cats.fandom.com/wiki/Detective_Vigler_(Uber_Rare_Cat)",
    "Saki - An extreme ended specialist sniper with target only against alien and red in fist form, alien and zombie in evolved, and alien and relic in true form. Saki has super high damage at high range and large pierce along with having very quick cooldown. However, her huge damage and range are limited by her target only and her super wide blindspot, being most effective at sniping higher ranged/ backliner enemies. Her red and zombie targets are straight ass, as both traits consist of primarily frontliners who invade her blindspot, not to mention the nature of zombies burrowing and reviving means she will barely be able to focus and hit anything. This contrasts with her alien and relic target, which is where her true value and broken status come from. Both of these traits consist of higher ranged or backline enemies, with her having the potential to wipe both traits clean off the face of the game. Her compatibility against both of these traits become even better with her strong against talent, essentially acting as a permanent damage buff for complete domination against both traits. She lacks in many qualities such as general use, cost, and speed clipping, but her ridiculous damage per hit, DPS, and insane range make her among one of the best anti alien/ relic ubers and the true embodiment of what an extreme ended specialist looks like.",
    "https://battle-cats.fandom.com/wiki/Sharpshooter_Saki_(Uber_Rare_Cat)",
    "Cyclops - A good anti aku backliner with strong offense and good shield piercing against aku enemies. Also carries a massive damage combo with himself, serving as a decent filler when using other massive damage units or just to increase his own effective DPS against aku. Struggles in general usage and has some damage inconsistencies with multi hit dividing his burst damage.",
    "https://battle-cats.fandom.com/wiki/White_Knight_Cyclops_(Uber_Rare_Cat)",
    "Jack - Fast, bulky, and highly aggressive rusher with an extremely tanky kit combined with godlike melee DPS and ultra fast attacks for insanely strong rushing. Also has super cheap cost and good cooldown for easy usage and high value. Also carries knockback procs against alien, angel, and zombie which can be utilized to push threats away from your other attackers or pin bosses to bases and rush down whole stages in incredible speed. Has one knockback count which creates extreme bulk, but makes it difficult to track HP and can be vulnerable to high DPS enemies.",
    "https://battle-cats.fandom.com/wiki/Thunder_Jack_(Uber_Rare_Cat)",
    "Heaven - A powerful dual role backliner who serves as heavy defense in first form and heavy offense in evolved form. Carries insane resist against black and alien in first form, having ridiculously high HP against both targets while having decent offense and good range point to serve as a mid ranged tank, protecting units behind or extending her longevity for good damage overtime on stages where high bulk is preferred. Evolved opts for an offensive focused ability set with insane damage against black and alien, offering super high damage against both traits while still having very good bulk through her high base HP, usually being the preferred form on general scenario. Has a pretty long cooldown and is not impressive as a generalist.",
    "https://battle-cats.fandom.com/wiki/Doktor_Heaven_(Legend_Rare_Cat)",
    "Zeus - A solid general backliner who also serves as a ranged tank against angels and zombies. Stats are mostly matched by Ururun and ranged tanking niche is extremely situational and finicky, all for a fairly forgettable and easily outclassed uber in later game. Gains some value through behemoth slayer ultra talent, from which can be used as an early Urs true form or used alongside her for massive ranged anti behemoth DPS.",
    "https://battle-cats.fandom.com/wiki/Thunder_God_Zeus_(Uber_Rare_Cat)",
    "Anubis - One of the best generalist backliners in the game with extremely high DPS, good HP, decent range, decent mobility with above average speed, occasional surges, and a whole slew of highly valuable immunities such as wave, surge, and slow immunity along with Z Killer, barrier breaker, and shield piercer for added versatility. Has a long foreswing, but can be alleviated with proper lineup building and has little impact in the first place due to his fast attack rate. Does have mediocre survivability.",
    "https://battle-cats.fandom.com/wiki/Anubis_the_Protector_(Uber_Rare_Cat)",
    "Aphrodite - A very strong sniper that delivers huge damage against aliens, being one of the best anti alien snipers in the game with her huge offense, range, and AOE to deny and nuke almost every alien in the game with extreme ease of usage thanks to her good knockback count and above average cooldown. Also has strong viability as a general sniper, dishing out consistent DPS from a far range along with having good damage per hit for strong burst and far range. While she does have great burst from afar, her DPS pales in comparison to other uber rare snipers and is also somewhat low on its own due to the sluggish attack rate (although it is mostly alleviated through ultra talent), but still carries the quality of consistency with the large pierce synergizing well with many units.",
    "https://battle-cats.fandom.com/wiki/Radiant_Aphrodite_(Uber_Rare_Cat)",
    "Amaterasu - One of the best generalist backliners in the game with extremely high effective DPS against traited enemies. Has a whole bunch of good qualities and abilities such as good range, average mobility, great survivability, barrier breaker, Z Killer, and lethal strike to make her a more versatile backliner. Has some vulnerabilities against relic curse and is ineffective against traitless. Can also master all 13 traits of celestial brush.",
    "https://battle-cats.fandom.com/wiki/Shining_Amaterasu_(Uber_Rare_Cat)",
    "Ganesha - An incredible mid ranged sniper who has godly amounts of pierce and ludicrous damage output, rivaling some of the best LD attackers in the game. His DPS when strengthened approaches that of some of the Kaslis, but trades damage uptime for extremely powerful burst. Also has great survivability with his good HP and knockback count as well as average mobility overall. Doesn’t have many special abilities, but his function as a huge stat, general LD attacker remains to be a very strong function that allows him to stay strong in the current game environment.",
    "https://battle-cats.fandom.com/wiki/Splendid_Ganesha_(Uber_Rare_Cat)",
    "Poseidon - One of the most powerful rushers in the game, he has high speed, cheap cost, quick cooldown, and incredible burst with his savage blow talent. Can deal hundreds of thousands of damage in one hit while having rebound and being mid ranged for a high mobility rusher, effectively bursting and smiting any enemy caught in his savage blow. Performance as a rusher is comparable to that of Yukimura while having the punch power of someone like Balrog. Also has additional zombie/ metal freezing for some strong supporting qualities and usability as anti zombie rusher.",
    "https://battle-cats.fandom.com/wiki/Wrathful_Poseidon_(Uber_Rare_Cat)",
    "Chronos - One of the strongest supporting ubers in the game with her wide LD, decent attack rate, decent offense, good standing range for LD unit, and very powerful freeze procs that stop traited enemies for a few seconds. Her value is found through her insane synergy with almost any unit in the game whether it be sniper, backliner, tank, melee, or even meatshield. She can increase the longevity of these units or keep enemies in place for other units to take advantage of. Her freeze is a general hard counter to enemies that are extremely aggressive, common in end game environment.",
    "https://battle-cats.fandom.com/wiki/Empress_Chronos_(Uber_Rare_Cat)",
    "Hades - A borderline melee/ mid ranged tank with extremely high base HP, serving as a general tank to defend against almost any enemy, along with his multitude of debuff immunities such as knockback and poison immune to secure his status as one of the most versatile and sturdy tanks out there. His synergy with many attackers is very prevalent, as he can be utilized alongside other attackers to block off enemies and hold them in place for your attackers to demolish at safe position. His fast attacks also help clear away peons, further making his synergy (especially with melee units like Can Can and Balrog) even better. Struggles in offense, due to his rapid attacking nature and low DPS combining for poor burst potential, but can still dish out decent damage in the long term, especially when properly supported to get rid of enemies that may shred him.",
    "https://battle-cats.fandom.com/wiki/Hades_the_Punisher_(Uber_Rare_Cat)",
    "Lucifer - A very strong sniper who has strong against floating, aku, and carries surge immune. He has all round good qualities such as good survivability and strong offense, dealing high damage from high range, making him a confident sniper especially with his surges which have wide area denial. His immunity to surges also makes him relevant in later game stages and also improves his compatibility against aku, from which he offers very strong offense against both of his traits, even if he lacks shield pierce against aku. His overall safety and damage output from afar makes him great as specialist and generalist, only really struggling in the slight surge RNG.",
    "https://battle-cats.fandom.com/wiki/Lucifer_the_Fallen_(Uber_Rare_Cat)",
    "Aset - A bulky rusher/ mid ranger with high DPS, fast attacks, and waves to rush down enemies and clear peons for strong synergy with many melee units. The combination of her fast attacks and waves makes her great for clearing the path for units, juggling certain enemies, and potentially piercing lower class backliners when accompanied with a stepping stone for some strong damage output overtime. On the other hand, her fast attacks mean low damage per hit, even with the wave and strengthen accounted for. This creates bad burst, which means you want to pair her with hard hitting units and utilize her on stages where she can be sustained more easily.",
    // NOTE: PATCHED "https://battle-cats.fandom.com/wiki/723_(Uber_Rare_Cat)",
    "https://battle-cats.fandom.com/wiki/Lightmother_Aset_(Uber_Rare_Cat)",
    "Gaia - One of the most inconsistent nukers in the game that carries one of the highest payoffs out of any attacker. Her godlike offense against traited can absolutely annihilate any big enemy, even if they are getting hit by only one or two of her three attacks. She also carries LD which gives her some pierce, being able to snipe lower class backliners and reach enemies that she may have otherwise missed. Her inconsistent nature comes from her having one of the harshest blindspots in the game, having super small inner range which creates the weakness of her being super vulnerable against frontline pushers that can move into her blindspot. The main strategy to using Gaia is to make sure enemies are positioned outside of her blindspot, which can be done with synergy such as rock or debuffers to freeze or slow enemies in place. This usage may not be optimal on many stages, which creates a unit that has generalist abilities and is paradoxically a strong ended specialist, with her nuking power having very high payoff but little ease of usage, comparable to a unit like Lasvoss.",
    "https://battle-cats.fandom.com/wiki/Gaia_the_Creator_(Legend_Rare_Cat)",
    "Siege Engine - Incredibly powerful multi purpose specialist with high sniping offense and super high defense. Has extremely wide LD attacks with high damage/ DPS and essentially no blind spot. Has wave attacks which increases average DPS and improves burst potential. Is also very bulky and has an average KB count of 3. Specializes in support and tanking against zombies and relics, being able to weaken both traits with about 100% uptime as well as having resistance against them, combined with weaken can accumulate millions of HP against both traits. Also has further qualities such as occasional slow procs and toxic immunity. Has some flaws in mobility, being very slow and having long cooldown but still retaining average cost.",
    "https://battle-cats.fandom.com/wiki/Mighty_Kat-A-Pult_(Uber_Rare_Cat)",
    "Drednot - A great anti red/ zombie nuker who has extremely high DPS and huge damage per hit against both traits. Also has good range and high bulk which allows him to slip into certain enemies and get 1-2 good hits for tons of damage. Compatibility is also strong, with both red and zombie carrying some bulky frontliners which are some of Drednot’s most optimal targets. Also has soulstrike allowing him to stand against burrowing zombies and finish off corpses. Has some mobility issues such as low speed, long attack rate, and long foreswing.",
    "https://battle-cats.fandom.com/wiki/Mighty_Drednot_(Uber_Rare_Cat)",
    "Bomburr - A decent anti zombie support with good attack rate and consistent knockback procs. Can ward off zombies very well and can synergize with certain units by getting zombies that burrow on top of your other attackers away. Also has high KB count and okay DPS output along with poison immunity which allows Bomburr to be an anti poison backliner, particularly useful on stages like Big Peng Z and some Gobble stages.",
    "https://battle-cats.fandom.com/wiki/Mighty_Bomburr_(Uber_Rare_Cat)",
    "Rekon Korps - An insanely powerful generalist nuker who can essentially be described as a rapid attacking version of crazed bahamut. Has high KB count for lots of repositioning, high range, and great damage per hit for strong bursts of damage. Very versatile unit with high DPS output with a rather basic, but consistent role. Also has survivor and curse immunity for some later game quality. Has issues with low HP and extremely long foreswing, requiring you to build your lineup around Rekon Korps and having less viability against enemies with high KB count or strong piercing damage.",
    "https://battle-cats.fandom.com/wiki/Mighty_Rekon_Korps_(Uber_Rare_Cat)",
    "Thermae - One of the best anti zombie ubers in the game. He has a mix of both very strong defense and offense against zombies, having a very good HP pool, lots of chances to reposition, and high damage to easily Z Kill and counter most zombies along with this rather safe standing range and omni attacks which allows him to counter zombies that burrow behind him (so long as he has a target in front). He also has numerous abilities such as freeze which gives him some support as well as strengthen which further increases offense and soulstrike which allows him to finish off zombie corpses. The quality of having 3 part multi hit and rapid attacks also gives him strong damage uptime, as he will be constantly attacking and catching zombies within his freeze. His limitations include having below average generalist stats and being rather slow, although the slow speed can be advantageous for defense against burrowing and reviving zombies.",
    "https://battle-cats.fandom.com/wiki/Mighty_Thermae_D-Lux_(Uber_Rare_Cat)",
    "Aethur - One of the best anti zombie ubers in the game. He has insanely high damage against zombie enemies as well as having a rather quick attack rate. He obliterates zombie frontliners while standing at mid range. He also has dodge which allows him to survive momentarily for longer periods of time, especially useful for infiltrating higher ranged zombies like Cadaver and Zamelle. The most crucial aspect to his kit would be his cost and cooldown, as they are among one of the lowest compared to other ubers at around 2000 cost and a minute of cooldown. This gives him insane mobility on many zombie stages as well as allowing him to get tons of value with low risk, almost in an identical manner to someone like Balrog, but specialized for zombie. Aethur also has an incredibly useful combo with Courier, offering a medium worker cat up combo which can help as a filler combo or a primary money combo in order to rush and clear stages faster, convenient considering one of the cats in the combo is Courier. This combo also has utility in dojo too. Aethur’s weaknesses primarily include the complete lack of general usage, as his damage is utter shit against non zombie which can also affect his performance against mixed stages.",
    "https://battle-cats.fandom.com/wiki/Mighty_Aethur_Ltd._(Uber_Rare_Cat)",
    "Deth Troy - An incredibly powerful multi purpose nuker and combo unit with massive damage against 3 traits: aku, zombie, and angel. He carries very strong DPS against all 3 traits while having a surprisingly fast attack rate for a nuker, giving him a strong mix of high damage per hit and consistent damage uptime on the target. Also has good HP and above average range for a backline nuker. Most important part of this unit is the combo, with a medium attack up combo with only 1 other unit, easily being the best attack combo in the game and one of the best filler combos for it’s +15% attack boost for a mere 2 slots, while still reaping the benefit of using Troy himself. As a unit, he suffers from his low speed and long foreswing, which can be particularly troublesome since his fast attack rate constantly triggers his animation, but is still maneuverable. Troy is also very good at Mario Kart Wii.",
    "https://battle-cats.fandom.com/wiki/Mighty_Deth-Troy-R_(Uber_Rare_Cat)",
    "Envanz - Terrible debuffer who has resist, curse, and slow against zombie and black. His procs are fairly weak, with curse in particular being only useful against Big Peng Z. His slow doesn’t have amazing uptime either, and his multi hit can make his other hits miss and reduce proc duration. His stats are fairly below average, having good HP and okay DPS for a mid ranger but still suffers from multi hit issues. Colossus slayer emphasizes his strong viability in Big Peng Z, but serves as a near useless unit outside of that stage.",
    "https://battle-cats.fandom.com/wiki/Mighty_Carrowsell_(Uber_Rare_Cat)",
    "Sphinx Korps - A bad tank with high speed and great effective HP, but terrible targets and awful mobility. He resists against zombie, red, and metal, with red and metal being bad traits for this unit due to better non uber defensive options as well as the severe limitation of being extremely expensive and having super long cooldown, making his flexibility and practical integration in lineups terrible. His DPS is one of the biggest failing points to this uber, being one of the worst frontliner offenses in the game. This designates his usage as a big, high cost, long cooldown wall that happens to be speedy. Contradicting stats make up for a weird and ineffective reactionary tank, where better non uber options such as Wushu, Roe, and Modern makes Sphinx’s value incredibly low.",
    "https://battle-cats.fandom.com/wiki/Mighty_Sphinx_Korps_(Uber_Rare_Cat)",
    "Muu - One of the best and most unique anti zombies in the game due to his incredibly special role as a base defender. He is unbearably slow at 1 speed, but this comes to his advantage as he will stand behind at the base and obliterate any zombie that is near him. This is thanks to his godly stats against zombies, offering super high HP and insane offense through his insane resist and insane damage abilities against zombies. He also has fast attacks and omni which ensure zombies that approach him will be denied. Wave blocker is another neat ability as it gives him the role of a ranged wave blocker, although this usage is a bit scuffed due to his agonizingly slow speed, allowing your units to move up while Muu stays behind, leaving this usage primarily focused for lure strats. His generalist usage is bad.",
    "https://battle-cats.fandom.com/wiki/Mighty_Kristul_Muu_(Legend_Rare_Cat)",
    "Bora - One of the best anti alien nukers due to his strong bulk, super high DPS, insane damage per hit against aliens, and strong mobility. His good standing range, high offense, and good mobility add up to a nuker with very powerful specialist usage, countering and straight up killing most aliens with ease. Likewise to most pixies, he also has very strong viability in cats of the cosmos due to having an interchangeable first form that costs under 1200 as well as an evolved form with wave blocker and costs under 4000. Has bad generalist stats and long foreswing.",
    "https://battle-cats.fandom.com/wiki/Bora_(Uber_Rare_Cat)",
    "Mizli - A solid anti alien crowd controller with guaranteed knockback and slow against aliens, warding off alien frontliners incredibly well with her pushing power while also having solid uptime. Unfortunately with aliens being a backliner heavy trait, Mizli has a slight compatibility issue with her knockback pushing into backliner range and shifting the positioning of your cats to walk into backliner attack, with such phenomenon being called “Mizli Syndrome.” Fortunately this is merely a limiting factor and is quite easy to avoid by not using her on backliner heavy stages, though that leaves her usage as an anti alien pusher against frontliner to be mostly fulfilled by other units like Psychocat and Seafarer while lacking KB which can still be beneficial for holding certain enemies in place for stacking DPS, from which Mizli struggles to synergize with.",
    "https://battle-cats.fandom.com/wiki/Mizli_(Uber_Rare_Cat)",
    "Aer - A below average LD attacker who has lacking stats and abilities both as an anti alien and generalist. His DPS and cooldown are both decent for his wide LD, but the rest of his kit, notably survivability, is pretty below average. On the anti alien side, his ultra form granted knockbacks which allows Aer to have immense pushing power against aliens due to his mix of very wide LD, fast attacks, and guaranteed procs. His knockback provides good control as well as potential for synergy, particularly with other LD snipers. He gains weaken procs through talents, but these procs tend to be somewhat below average in frequency and strength.",
    "https://battle-cats.fandom.com/wiki/Aer_(Uber_Rare_Cat)",
    "Volta - A strong anti alien debuffer who offers very strong support, with guaranteed freeze against aliens with pretty good uptime. While he has a present niche overlap with Seafarer Cat, the unique property of guaranteed freeze gives Volta some value as well as great synergy alongside Seafarer, making a perma freeze stack much more easily achievable. Also has other decent qualities too such as solid DPS, good cooldown, a large amount of immunities, and standard ability set across all Elementals, though likewise he struggles in general usage.",
    "https://battle-cats.fandom.com/wiki/Voli_(Uber_Rare_Cat)",
    "Gravi - A strong anti alien tank who has both high HP and good frontline + wave offense. Carries about 600K HP against aliens while having warp blocker, providing a very sturdy frontliner to keep aliens in place. Also has good DPS and damage per hit with the wave attack for some strong frontline offense while also being able to snipe surprisingly far away with the wave, damaging most of the field and potentially hitting backliners. Also has strong qualities for a tank such as cheap cost, fast cooldown, and wave immunity as a bonus to be used against some general wave enemies like Kory and Dober, as he also has good base HP and enough stats for some solid general tanking.",
    "https://battle-cats.fandom.com/wiki/Gravi_(Uber_Rare_Cat)",
    "Yamii - A very unique tank who has resist against alien and aku, offering solid HP to fend off of both traits as well as weaken procs to offer some support and increase his own lifetime. He is slightly ranged at 340 standing range, so he serves as a mid ranged tank who stands as a secondary line of defense to protect attackers right behind him. Also has other qualities such as super cheap cost and pretty fast cooldown. His most unique property by far is his wave blocker, as his standing range allows him to serve as a ranged wave blocker, a super valuable role that essentially causes every wave based stage to disappear. The combination of his good cost and cooldown put him above every other wave blocking uber, and has a special place in the meta as the best anti wave uber in the game. Likewise to other Pixies, Yamii struggles outside of his niche, as expected. Yami also caused a genocide on the ark of yamato and is Amaterasu’s arch nemesis.",
    "https://battle-cats.fandom.com/wiki/Yamii_(Uber_Rare_Cat)",
    "Blizana - Below average support unit who despite having many abilities, carries a huge niche overlap with Psychocat. Has the ability to slow aliens and zombies, but has somewhat below average uptime combined with multi hits with increasing piercing attacks for some reach, at the expense of having more inconsistent damage output. Standing range is iffy at 350, emphasizing her struggle to compete with Psychocat who has similar standing range, better proc consistency, and more cost effective while still keeping the same targets. Other forms of alien/ zombie CC such as Seafarer and Housewife further digs the trench for Blizana’s grave. Has some usage as filler support due to cost and cooldown being pretty good.",
    "https://battle-cats.fandom.com/wiki/Bliza_(Uber_Rare_Cat)",
    "Tetsukachi - A solid tank with okay effective HP against floating, angel, and aliens while having very good cost and cooldown. Unfortunately has varying niche overlaps and poor DPS along with somewhat sluggish speed. Still has good synergy and ease of usage with the cost and cooldown as well as big fat bulk vs 3 whole traits.",
    "https://battle-cats.fandom.com/wiki/Tekachi_(Uber_Rare_Cat)",
    "Lumina - The ultimate anti alien defensive unit, primarily for her extreme amounts of HP against aliens. With her already strong base HP combined with insane resist, she can score hundreds of thousands of HP against aliens. She also offers as mid ranger/ support, dealing surprisingly good damage for her range as well as inflicting guaranteed weaken procs with over 100% uptime, further increasing her effective HP into the millions. With her having very high speed, strong bulk, cheap cost, and good cooldown, she can hold off practically any alien enemy until they get chipped down to death by her or other attackers. Somewhat viable as a generalist but mostly pertains to her specialist usage being an immovable wall against aliens that also has good offense and support.",
    "https://battle-cats.fandom.com/wiki/Lumina_(Legend_Rare_Cat)",
    "Himeyuri - A decent anti floating/ angel/ relic debuffer whose viability is placed more in her combo. As a support, she has slow against 3 traits with good compatibility against all of them, having a good attack rate and almost 100% uptime against all 3 traits. Also has solid stats such as high KB count and decent offense, although multi hit can make her occasionally miss an attack or two. Her shining function as a unit comes from her cat combo with So-ran and Kite Cat, where the 3 together make up a research L combo, essentially providing a better version of the BioBone combo as they take up the same amount of slots while Himeyuri’s combo has a larger benefit. The combo has excellent utility in making units like Rock as spammable as possible as well as benefiting tons of rare and super rare units, notably in 4 crown gameplay when it comes to units like Ramen, Courier, and other units with around 4-6s of cooldown.",
    "https://battle-cats.fandom.com/wiki/Trickster_Himeyuri_(Uber_Rare_Cat)",
    "Ruri - A strong mid ranged tank with both very high HP and damage against reds and relic. She has high base HP, with hundreds of thousands of HP against her targets. She stands at 380 range which makes her a mid ranged tank, standing slightly further back to stay in front of your longer ranged attackers while avoiding potentially crushing frontline DPS from enemies. This gives her a bit of a unique role, especially in both red and relic matchups from which she has great matchups against. Just as important as her HP stat is her other qualities too, specifically weaken procs which not only have guaranteed proc rate, but also have about 100% uptime to better increase her own defense and support other units. Her defensive skill is further increased with ultra talents, making her speedy and utilizing the dodge ability to create one of the best tanks with dodge in the game due to her high dodge frequency. Lastly she has an insanely high DPS amount for her range, however this is limited by her single target and multi hits which are significant limitations to her offense, though she thrives in stages with little peons likewise to other single target ubers.",
    "https://battle-cats.fandom.com/wiki/Sea_Maiden_Ruri_(Uber_Rare_Cat)",
    "Reika - A powerful backliner with great specialist performance against aliens, zombies, and relics, primarily being a nuker with very high DPS against all 3 traits. Also has qualities such as good cooldown for her class and high knockback count. Fairly basic in role and has multi hits which can cause damage inconsistencies.",
    "https://battle-cats.fandom.com/wiki/Queen_Reika_(Uber_Rare_Cat)",
    "Deale - A solid mid ranger who has rapid attacking knockbacks against aliens and angels. Rapid attacks and knockback combined with extremely high proc frequency gives her a good amount of pushing power against alien and angel frontliner, though the nature of both traits carrying quite a few ranged threats gives way to certain compatibility issues. Has surprisingly high DPS for her range and can be very competent as a mid ranged attacker while also having abilities such as weaken immune and wave immune to expand some of her usage and make certain alien/ angel matchups more favorable.",
    "https://battle-cats.fandom.com/wiki/Wolfchild_Deale_(Uber_Rare_Cat)",
    "Verbena - Below average anti metal uber who has underwhelming stats and weird properties. Has sufficient range for anti metal along with good HP, cost, and cooldown, but is lacking in damage even in anti metal standard. Damage also staggers up in each multi hit, meaning earlier crits deal significantly less damage with her final hit being the most critical damage you can get. Her 3 hits combined with 25% crit chance does have solid proc frequency overall, but still doesn’t detract from the damage inconsistency. Shares an overall niche overlap with Jurassic cat, who is a better anti metal and outshines her in most regards, especially when talented.",
    "https://battle-cats.fandom.com/wiki/Graveflower_Verbena_(Uber_Rare_Cat)",
    "Kanna - Powerful general LD unit who has strong compatibility against black enemies. She has solid stats overall, but particularly shines through her extremely wide piercing attacks, surge, and fast attacks with rapid attacking nature, all combined for a strong stream of constant damage and great control, which goes hand to hand with her black niche, being able to consistently deny swarms and juggle high KB enemies. She is also currently one of the only ubers in the game with behemoth slayer on her base kit, allowing her to be a relatively strong anti behemoth, though her viability decreases against anti surge behemoths. Her overall good damage output, large pierce, and strong control gives way to great general use and synergy with other units.",
    "https://battle-cats.fandom.com/wiki/Adventurer_Kanna_(Uber_Rare_Cat)",
    "Vega - Solid anti traited support and defensive mid ranger with mediocre offense. She has both strong and weaken against traited enemies along with having good base HP which gives her great defensive capabilities against enemies that are weakened by her. Her weaken procs also have general quality in increasing the lifetime of other units, especially with her weaken procs being able to pierce a good amount of range. Also has colossus slayer and toxic immunity for some viability against Baron stages, specifically as a Big Peng Z counter. Despite having strong against traited, her offense is pretty mediocre due to her having multi hits and somewhat small attack overlap along with piss base DPS. Also has other limitations such as non guaranteed proc and only being able to weaken on her second hit, which lands slightly further back.",
    "https://battle-cats.fandom.com/wiki/Spectral_Goth_Vega_(Uber_Rare_Cat)",
    "Tomoe - Underwhelming controller who has subpar DPS despite good attack coverage, having below average damage output in front of her and below average offense at the back. Has freeze against aku and traitless that can be utilized along with her wide LD attack, though the 50% proc rate and somewhat below average uptime puts her CC at a lower level despite it’s uniqueness. She is best used as support for other attackers and snipers.",
    "https://battle-cats.fandom.com/wiki/Ninja_Girl_Tomoe_(Uber_Rare_Cat)",
    "Nanaho - One of the best anti metal units in the game that also delivers as a very strong generalist. As an anti metal, her kit being a 50% proc rate with good range, LD, strong crit damage, 7 knockbacks, and insane resist against metals allows her to straight up kill any metal enemy in the game. Unlike most anti metals, she still has a very strong stance as a generalist, offering great general DPS with wide piercing attacks and having strengths such as her 7 KB for tons of chances to reposition. She also has additional abilities such as Z Killer, barrier breaker, and lethal strike for slightly more versatility (particularly useful for one lineup challenges).",
    "https://battle-cats.fandom.com/wiki/Kyosaka_Nanaho_(Legend_Rare_Cat)",
    "Nekoluga - A subpar high ranged support unit who has knockback and freeze against all traits besides metal. Has great standing range and decent procs for some light pushing power, but extremely poor mobility and super long attack rate designates him as smaller extra support or as filler. His occasional knockback can have some merit on endurance stages, especially some crazed cats in early game, but different options for light pushing power such as Ururun or straight up designated KB units will overshadow Nekoluga in later game environments. The inclusion of surge immune in ultra talents does give him slight viability as anti surge CC, though growing anti surge meta demands such role even less overtime, not to mention there are still plenty of CC that isn’t built as anti surge that still has viability against surge based enemies.",
    "https://battle-cats.fandom.com/wiki/Nekoluga_(Uber_Rare_Cat)",
    "Asiluga - A super long ranged support who slows all traits and acts very similarly to Cyberpunk, from which he acts as an inferior version of said unit. In response, his main usage is to be a companion/ synergizer with Cyberpunk, offering more ranged slow to your lineup and somewhat covering Cyberpunk’s blindspot. Also has a combo with Macho Legs which increases slow time, further supporting their own slow and Cyberpunk’s slow. Has a funny dodge against everything that makes them theoretically an invincible unit.",
    "https://battle-cats.fandom.com/wiki/Asiluga_(Uber_Rare_Cat)",
    "Kubiluga - Solid supporting unit who can deal field wide double knockbacks against all non metal enemies with a fairly decent attack rate. Field wide knockbacks can allow him to push surprisingly fast despite having low mobility. Can synergize very well with certain units, notably snipers, where his good standing range can let him stand back with some snipers as well as keep the frontliner away and position enemies for easier kill. Also has a reputation for cheesing stages, notably with Warlock, where Kubiluga will push enemies behind the base and Warlock will use his base destroyer, although such strats can be mostly replicated even without Warlock. True form opts to become anti metal, with guaranteed crit and field wide wave attacks being excellent for clearing metal peons and more notably being a strong Koronium counter when paired with a wave blocker or talented with wave immune. Arguably his best function is his combo, wielding a medium worker cat combo with another commonly used unit: Eraser. Giving you +2 free worker cat levels upon starting the stage can have huge benefits in speeding up stage clearing or be used in crucial strategies, notably useful for farming and dojo or in any scenario where you can’t or don’t want to use a rich cat, as the combo is essentially a mini rich cat.",
    "https://battle-cats.fandom.com/wiki/Kubiluga_(Uber_Rare_Cat)",
    "Tecoluga - The boss killer. Tecoluga is a super backliner attacker who has monumental range and DPS along with having relatively quick attacks accompanied by huge damage per hit, especially when doing a crit. His insane standing range and hellbent amounts of damage/ DPS makes him able to destroy practically any enemy he can outrange. However, he has a huge limitation being that he is a single target attacker, meaning he is unviable against swarms. This dictates some of his usage where the general strategy to effectively use Tecoluga is to clear the path using other attackers or shockwave units such as Manic Macho Legs to allow Tecoluga to easily hit and wipe out the main boss on the field, earning his reputation as the boss killer. Has poor mobility and is vulnerable to piercing attackers, especially surge and wave.",
    "https://battle-cats.fandom.com/wiki/Tecoluga_(Uber_Rare_Cat)",
    "Balaluga - Strong high ranged supporting unit who can carry excellent synergy with many other units thanks to his guaranteed freeze and weaken procs against all traits including metal. Has a great place in the cyberstacking meta, accompanying cyberpunk with more debuffs from high ranges. Can also be used as an alternative in certain scenarios due to the strength in his freeze procs, which synergizes especially well with tanks, rushers, and other melee units, as Balaluga can create openings for these aggressive units to take out a bigger enemy, most notable in Draconian where Balaluga combos excellently with Bahamut to take out Manic Lizard. Freeze also has general qualities such as being more effective against backliner enemies and allowing your meatshields to have better defensive uptime, further emphasized by the weaken procs inflicted after the freeze. Like almost all other Nekolugas, has poor mobility and dies to any piercing enemy.",
    "https://battle-cats.fandom.com/wiki/Balaluga_(Uber_Rare_Cat)",
    "Togeluga - An above averaged backliner/ nuker with incredibly high damage per hit against all traits while having monstrously strong survivability with his 100 knockback count. Also has wave immune to counter almost every wave enemy flawlessly. Unfortunately has a super long attack rate and foreswing, making them difficult and sluggish to use especially in end/ post game environment. The ludicrous knockback count also makes him easy for the enemies to juggle, combined with the slow speed for some pretty below average mobility. Still has ridiculously powerful nuking attacks as well as wave immunity to shut down almost every wave enemy in the game.",
    "https://battle-cats.fandom.com/wiki/Togeluga_(Uber_Rare_Cat)",
    "Nobiluga - Piss sniper who has bad DPS, huge blindspot, debuff immunities that do more harm than good, and bad mobility besides cost. Also has multi hit to screw up his attack even more in some scenarios. Has strong against relic which gives him minimal usage as filler sniper, though the DPS is still below average for specialist standards.",
    "https://battle-cats.fandom.com/wiki/Nobiluga_(Uber_Rare_Cat)",
    "Papaluga - Meme unit.",
    "https://battle-cats.fandom.com/wiki/Papaluga_(Uber_Rare_Cat)",
    "Furiluga - Strong shield piercer with great combo. Has high range and guaranteed shield pierce along with mini surge to reach potentially missed Aku/ approaching Aku enemies and surge immunity to stay resilient to Aku death surges. While his shield piercing niche has huge overlap with Barrel and Aku Researcher, Furiluga still offers the quality of much higher standing range and mini surge pierce, not to mention he has great synergy with these units anyway, most notably with Aku Researcher thanks to the two having a medium worker cat combo which has the same benefit as Kubiluga combo where you can gain much more cash upon starting the stage for what could be potentially no sacrifice in slots, as both units are commonly and effectively viable against Aku enemies.",
    "https://battle-cats.fandom.com/wiki/Furiluga_(Uber_Rare_Cat)",
    "Kaoluga - Solid sniper with below average supporting abilities. Has high range combined with knockback against all traits (including metal) but has low proc frequency for an overall unreliable knockback. Value lies more in his offense, dealing relatively strong damage from a high range while also having mini surge which can heavily increase his offensive output, although similarly to knockback, mini surge has a wide spawn radius and is generally unreliable. Good for filler, but underwhelming in most other aspects.",
    "https://battle-cats.fandom.com/wiki/Kaoluga_(Uber_Rare_Cat)",
    "Legeluga - Despite being the worst legend rare, still has some okay qualities as a rusher. Has strong DPS at face value along with decent damage per hit, good speed, good KB count, good HP for a rusher, and is somewhat ranged for sustainable offense under right circumstances. Not all that well respected as a legend rare due to having niche overlap with Idi and Bahamut, with both being stronger in many scenarios, with Legeluga’s defining advantages being that they are slightly ranged and have debuff immunities, which can have some merit if Idi or Bahamut ever fails.",
    "https://battle-cats.fandom.com/wiki/Legeluga_(Legend_Rare_Cat)",
    "Gao - An incredibly consistent and powerful generalist backliner with high bulk, high range, good KB count, and high DPS. Can be used on almost any stage in the game and wields strong results. Also has a first form which can have occasional utility. Suffers from high cost and traitless.",
    "https://battle-cats.fandom.com/wiki/Baby_Gao_(Uber_Rare_Cat)",
    "Shadow Gao - One of the best anti traitless in the game with his insanely high DPS, good bulk, good KB count, and high range. Has near perfect matchup against traitless and decimates the trait entirely. Suffers from high cost and being quite generic as a generalist.",
    "https://battle-cats.fandom.com/wiki/Shadow_Gao_(Uber_Rare_Cat)",
    "Mitama - One of the best ubers in the game with her extremely broken amounts of HP, mass amount of KB to reposition/ rebound, strong damage overtime, and slow procs against traited with nearly 100% uptime. Stunts the advance of almost any traited enemy to be killed overtime or synergize beautifully with other attackers be it ranged or melee. Only weakness is traitless.",
    "https://battle-cats.fandom.com/wiki/Miko_Mitama_(Uber_Rare_Cat)",
    "Dark Mitama - A very strong anti traitless with super high proc duration on both her weaken and slow procs. Also carries extremely high HP, lots of KB, and very strong offense overtime against traitless. Somewhat viable as a generalist with her high offense and KB count, but struggles a bit as a generalist.",
    "https://battle-cats.fandom.com/wiki/Dark_Mitama_(Uber_Rare_Cat)",
    "D’artanyan - Glass cannon, mid ranged rusher with godly amounts of DPS against traited combined with wide LD attacks. Has good mobility across the board and delivers huge damage against any enemy he either outranges or can slip into. He is extremely delicate with very little bulk and is unusable against traitless.",
    "https://battle-cats.fandom.com/wiki/D%27artanyan_(Uber_Rare_Cat)",
    "D’arktanyan - Bulky mid ranged rusher with godly amounts of DPS against traited combined with wide LD attacks. Has good mobility across the board and delivers huge damage against any enemy he either outranges or can slip into. Also has traitless niche to combat traitless, easily earning the title as the best anti traitless in the game. Has a slight dependency on strengthen.",
    "https://battle-cats.fandom.com/wiki/D%27arktanyan_(Uber_Rare_Cat)",
    "Kasli - A powerful supporting unit with extremely strong knockback procs while having very high offensive stats. Can create big impacts with her knockback procs, pushing enemies far back and being able to create tons of space in rough environments. High LD DPS combined with surge allow for good kill power and crowd control to destroy swarms and melt enemies away overtime. Has certain notable flaws with knockback such as pushing enemies out of her surge, synergizing badly with certain attackers, being RNG based, and somewhat reliant on it to keep her alive, as she struggles immensely with survivability. In most scenarios, the payoff usually exceeds these pitfalls, but still must be accounted for proper usage.",
    "https://battle-cats.fandom.com/wiki/Kasli_the_Scourge_(Uber_Rare_Cat)",
    "Dark Kasli - The best uber in the game, she wields godlike stats across the entire board. She has high bulk, good KB count, insanely strong LD DPS, surge for high damage uptime and clear peons, curse for extra utility, amazing synergy with many different units due to her surge/ curse, and a wide array of abilities to further expand on her versatile kit. She will simply melt away enemies into dust, obliterating the game with ease, even destroying counter surge enemies. Has vulnerability against surge immune enemies such as behemoths.",
    "https://battle-cats.fandom.com/wiki/Kasli_the_Bane_(Uber_Rare_Cat)",
    "Garu - A strong general tank with good effective HP against traited as well as having strong mid ranged offense. Has a few nice qualities such as wave, Z Killer, and slight pierce through omni/ mini wave to clear peons or land hits consistently. The highly versatile HP pool he has synergizes well as a giant wall to protect ranged attackers, with performance comparable to that of Hades while carrying more justifiable offensive output. Has vulnerabilities against traitless, curse, and lacks many debuff immunities, notably knockback immunity. Also gets shafted hard by specialist tanks if acquired by the player.",
    "https://battle-cats.fandom.com/wiki/Baby_Garu_(Uber_Rare_Cat)",
    "Dark Garu - A strong early to late game anti traitless tank with extremely high strengthened DPS while carrying strong effective HP against traitless. Due to his extreme DPS, he has quite some viability as a general tank when boosted as well as having even better bulk than the normal version. Unfortunately gets hard overshadowed by Dogumaru, who can reach similar HP while having much better mobility. Still has some value due to the super high strengthened DPS.",
    "https://battle-cats.fandom.com/wiki/Dark_Aegis_Garu_(Uber_Rare_Cat)",
    "Izu - A very fast rusher/ melee with super high DPS against traited while having cheap cost and great cooldown. Can be sent out for big bursts of damage to destroy other melee enemies or infiltrate enemies for high burst damage. Also has a how bunch of immunities for better infiltration and stance against debuff based enemies. Does have rapid attacks/ multi hit which requires more careful positioning to rack up good damage and lacks curse/ surge immune for later game enemies.",
    "https://battle-cats.fandom.com/wiki/Iz_the_Dancer_(Uber_Rare_Cat)",
    "Dark Izu - A very fast rusher/ melee with super high DPS against traited, with even stronger DPS through strengthened which can also make them somewhat viable as general rusher. Her biggest strength is having every single debuff immunity in the game as well as a whole bunch of strong abilities, notably her guaranteed shield piercer which makes her one of the best shield piercers in the game. Her immunities and strong performance at crushing traitless make her a valuable asset to have for end/ post game players.",
    "https://battle-cats.fandom.com/wiki/Iz_the_Dancer_of_Grief_(Uber_Rare_Cat)",
    "Phono - An overpowered offensive sniper with godlike damage and range against traited. Can safely outrange most threats and kill incredibly quickly due to having one of the highest ranged DPS out of any backliner/ sniper unit. The heavy emphasis on speed, damage, and still retaining the quality of safety easily make Phono one of the best offensive based attackers in end/ post game meta, with the only factor standing in their way being traitless.",
    "https://battle-cats.fandom.com/wiki/Child_of_Destiny_Phono_(Uber_Rare_Cat)",
    "Dark Phono - The most versatile uber in the game, they carry good survivability, decent bulk, high standing range, wide piercing attacks, mini surge to clear peons, high offense and a good slowing effect to stunt all traits including traitless. Can be used virtually anywhere for very strong results and great synergy with many units, can essentially be described as a more versatile version of Miko Mitama with wider role coverage but much weaker procs.",
    "https://battle-cats.fandom.com/wiki/King_of_Doom_Phono_(Uber_Rare_Cat)",
    "Izanagi - Overpowered offensive mid ranger with great bulk and decent mobility. Has insane damage against traited, dealing hundreds of thousands of damage on each of their 3 multi hits, which staggers up in range with great distance. Functionally similar to Naala with the damage of a strengthened Balrog. Held back by single target, but is fairly easy to maneuver around and gets overshadowed by the mega fuckton amounts of potential damage they have that can ruin whole stages. Also has additional abilities such as summon, which acts as on command CC with good peon clearing measure.",
    "https://battle-cats.fandom.com/wiki/Daybreaker_Izanagi_(Legend_Rare_Cat)",
    "Izanami - Extremely powerful anti traitless with huge burst damage from savage blow and wide AOE with staggering LD and area attacks. Has high bulk and operates similarly to Naala akin to normal Izanagi’s role. Good bulk, high damage, and high pierce leads to insanely good anti traitless matchups and becomes easily usable on stages with any sort of frontliner. Immunities such as surge, curse, and freeze immune allow for better traitless matchups and total destruction against traitless surge bosses. Lacks wave immunity and is unfortunately complete shit in general stats making her only usable within traitless niche, harboring one of the worst base LD DPS out of any uber/ legend rare.",
    "https://battle-cats.fandom.com/wiki/Izanami_of_Dusk_(Legend_Rare_Cat)",
    "Black Zeus (Bikkuriman Collab) - Extremely powerful LD attacker/ nuker with great general stats and insanely powerful niche. Has very good base stats with great HP, average KB count, good standing range, a wide LD attack, and strong DPS for his range that puts him to similar general offensive output to Nanaho. His main ability is insane damage vs traitless which puts his effective DPS higher than even Epicfest ubers like Shadow Gao on top of having the benefit of pierce due to being an LD unit. Has average survivability and long foreswing which can give an opportunity for an aggressive pusher to infiltrate his blindspot.",
    "https://battle-cats.fandom.com/wiki/Black_Zeus_(Legend_Rare_Cat)",
    "Gundros - High ranged heavy nuker with super backliner range and gargantuan damage against aliens and blacks. Deals one of the highest singular nuke damage against his targets compared to most other alien and black nukers while offering high effective DPS. However, his damage is insanely limited due to his poor mobility, long attack rate, and carrying the third longest foreswing out of any cat unit. This forces Gundros to be used in a highly risky play style known as bait-and-punish where you lure enemies into his range and nuke them. This causes Gundros to have bad flexibility and very poor synergy with other units, but in return has the potential to completely obliterate a targeted alien/ black, with alien being the more relevant target for his build.",
    "https://battle-cats.fandom.com/wiki/Gunduros_(Uber_Rare_Cat)",
];
exports.default = data;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitsRarityRaw = exports.descriptionsDataRaw = exports.tierListRaw = exports.npChartRaw = exports.bannersRaw = void 0;
var bannersRaw_1 = require("./bannersRaw");
Object.defineProperty(exports, "bannersRaw", { enumerable: true, get: function () { return bannersRaw_1.default; } });
var npChartRaw_1 = require("./npChartRaw");
Object.defineProperty(exports, "npChartRaw", { enumerable: true, get: function () { return npChartRaw_1.default; } });
var tierListRaw_1 = require("./tierListRaw");
Object.defineProperty(exports, "tierListRaw", { enumerable: true, get: function () { return tierListRaw_1.default; } });
var descriptionsDataRaw_1 = require("./descriptionsDataRaw");
Object.defineProperty(exports, "descriptionsDataRaw", { enumerable: true, get: function () { return descriptionsDataRaw_1.default; } });
var unitsRarityRaw_1 = require("./unitsRarityRaw");
Object.defineProperty(exports, "unitsRarityRaw", { enumerable: true, get: function () { return unitsRarityRaw_1.default; } });

},{"./bannersRaw":7,"./descriptionsDataRaw":8,"./npChartRaw":10,"./tierListRaw":11,"./unitsRarityRaw":12}],10:[function(require,module,exports){
"use strict";
// from NP Chart
// https://imgur.com/a/np-charts-9rAfl93
Object.defineProperty(exports, "__esModule", { value: true });
const npChart = {
    sell: {
        label: "Just sell them for NP",
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
        label: "Decide youself to sell for NP or not",
        units: ["Fencer Cat", "Juliet Cat", "Viking Cat"],
    },
    "a-bit": {
        label: "Use a bit then sell for NP",
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
        label: "Use until halved / quartered then sell",
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
exports.default = npChart;

},{}],11:[function(require,module,exports){
"use strict";
// Wrap and join
// ^v$hS"A,Jj
// Wram and join with Fest prefix
// ^v$hS"A,_A^aFest-j
// Numeric
// :s/\(\d*\)\. \(.*\)/"Ban-\1 - \2",
Object.defineProperty(exports, "__esModule", { value: true });
exports.tierListRaw = void 0;
// update 9/29/24
// based on https://docs.google.com/document/u/0/d/10jGnHCqKcaVoQ6uPxohy57YKhQUjo20H_ddVXzSot3I
// update doc https://docs.google.com/document/d/183G17wJFQL8Ur3AjXEPWZiuhTJBbPwKY7G54pb4htig
exports.tierListRaw = [
    [
        "S - Balrog, Lasvoss, Baby Cat (UF), Yukimura, Keiji, Kuu (UT), Windy (UF), Kalisa, Daliasan, Dioramos (UT), Akira (UT), Saki, Vigler, Chronos, Poseidon, Ganesha (UT), Anubis (UT), Amaterasu, Ganesha, Siege (UF), Tecoluga",
        "A - Baby Cat, Ice (UT), Satoru, Shingen (UT), Kai, Coppermine (UT), Lilin, Kasa Jizo, Ushiwakamaru, Sarukani, Kintaro, Momotaro (UT), Momotaro, Thunder Jack, Warlock (UT), Catman, Aphrodite (UT), Lucifer, Aphrodite, Hades, Gaia, Deth Troy, Aethur, Thermae, Muu, Lumina, Nanaho, Kanna, Himeyuri (UT), Himeyuri, Balaluga, Asiluga",
        "B - Momoco, Ice, Dynasaurus, Cat Machine (UT), Cat Machine, Akechi, Shingen, Kenshin, Amakusa, Hanzo, Jeanne, Windy, Thundia, Twinstars, Terun, Ganglion, Hevijak, Issun, Gamereon, Cosmo, Shitakiri, Kaguya (UF), Warlock, Hayabusa, Prof Abyss, Mekako, White Rabbit (UF), Aset, Drednot, Rekon Korps, Bora, Gravi, Yamii, Ruri (UT), Ruri, Reika",
        "C - Paladin, Tengu, Musashi, Yoshimoto, Oda (UF), Gunduros, Raiden (UT), Raiden, Dioramos, Babel, Kachi Kachi (UT), Kachi Kachi, Kaguya, Cyclops, Akira, Anubis, Bomburr, Volta, Aer (UF), Vega, Deale, Shishilan, Kubiluga, Furiluga",
        "D - Nurse (UT), Nurse, Kaihime, Masamune (UT), Masamune, Kuu, Pegasa, Vars, Gladios, Kamukura (UT), Kamukura, Megidora (UT), Zeus (UT), Zeus, Blizana, Mizli, Tetsukachi, Tomoe, Legeluga, Kaoluga, Nekoluga (UT)",
        "E - Cat Clan Heroes, Coppermine, Megidora, Sodom, White Rabbit, Sphinx Korps, Siege, Aer, Verbena, Nekoluga",
        "F - Oda, Myrcia, Envanz, Nobiluga, Papaluga",
    ],
    [
        "TOP-1 - Dark Kasli",
        "TOP-2 - Phono",
        "TOP-3 - Balrog",
        "TOP-4 - Dark Phono",
        "TOP-5 - Izanagi",
        "TOP-6 - Miko Mitama",
        "TOP-7 - D’arktanyan",
        "TOP-8 - Yukimura",
        "TOP-9 - Lasvoss",
        "TOP-10 - Chronos",
    ],
    [
        "S - Izanagi",
        "A - Gaia, Nanaho, Black Zeus, Izanami, Ushi, Muu, Lumina",
        "B - Emperor, Momoco, Doktor Heaven, Jeanne",
        "C - Akuma, Musashi",
        "D - Babel, Legeluga",
        "L-1 - Izanagi",
        "L-2 - Gaia",
        "L-3 - Nanaho",
        "L-4 - Black Zeus",
        "L-5 - Izanami",
        "L-6 - Ushiwakamaru",
        "L-7 - Muu",
        "L-8 - Lumina",
        "L-9 - Emperor",
        "L-10 - Momoco",
        "L-11 - Heaven",
        "L-12 - Jeanne",
        "L-13 - Akuma",
        "L-14 - Musashi",
        "L-15 - Babel",
        "L-16 - Legeluga",
    ],
    [
        "Fest-S - Dark Kasli, Phono, Dark Phono, Izanagi",
        "Fest-A - Mitama, D’arktanyan",
        "Fest-B - Kasli, Dartanyan, Gao",
        "Fest-C - Shadow Gao, Garu, Izanami",
        "Fest-D - Dark Izu, Izu",
        "Fest-E - Dark Mitama",
        "Fest-F - Dark Garu",
        "Fest-1 - Dark Kasli",
        "Fest-2 - Phono",
        "Fest-3 - Dark Phono",
        "Fest-4 - Izanagi",
        "Fest-5 - Mitama",
        "Fest-6 - D’arktanyan",
        "Fest-7 - Kasli",
        "Fest-8 - D’artanyan",
        "Fest-9 - Gao",
        "Fest-10 - Shadow Gao",
        "Fest-11 - Garu",
        "Fest-12 - Izanami",
        "Fest-13 - Dark Izu",
        "Fest-14 - Izu",
        "Fest-15 - Dark Mitama",
        "Fest-16 - Dark Garu",
    ],
    // https://www.youtube.com/watch?v=5s6rc1T3Y58&t=820s
    [
        "A - Kenshin Himura",
        "C - Sanosuke Sagara",
        "C - Aoshi Shinomori",
        "S - Hajime Saito",
    ],
    // 1. Almighties (A, 6.18)
    [
        "Ban-1 - Chronos",
        "Ban-2 - Poseidon",
        "Ban-3 - Ganesha",
        "Ban-4 - Anubis",
        "Ban-5 - Amaterasu",
        "Ban-6 - Aphrodite",
        "Ban-7 - Lucifer",
        "Ban-8 - Hades",
        "Ban-9 - Gaia",
        "Ban-10 - Aset",
        "Ban-11 - Zeus",
    ],
    // 2. Dark Heroes (A, 5.72)
    [
        "Ban-1 - Akira",
        "Ban-2 - Saki",
        "Ban-3 - Vigler",
        "Ban-4 - Thunder Jack",
        "Ban-5 - Klay",
        "Ban-6 - Catman",
        "Ban-7 - Hayabusa",
        "Ban-8 - Heaven",
        "Ban-9 - Mekako",
        "Ban-10 - White Rabbit",
        "Ban-11 - Cyclops",
    ],
    // 3. Galaxy Gals (B, 5.25)
    [
        "Ban-1 - Kuu",
        "Ban-2 - Windy",
        "Ban-3 - Kalisa",
        "Ban-4 - Kai",
        "Ban-5 - Coppermine",
        "Ban-6 - Lilin",
        "Ban-7 - Jeanne",
        "Ban-8 - Thundia",
        "Ban-9 - Twinstars",
        "Ban-10 - Terun",
        "Ban-11 - Pegasa",
        "Ban-12 - Myrcia",
    ],
    // 4. Ultra Souls (B, 5.16)
    [
        "Ban-1 - Kasa Jizo",
        "Ban-2 - Ushiwakamaru",
        "Ban-3 - Sarukani",
        "Ban-4 - Kintaro",
        "Ban-5 - Momotaro",
        "Ban-6 - Issun",
        "Ban-7 - Gamereon",
        "Ban-8 - Cosmo",
        "Ban-9 - Shitakiri",
        "Ban-10 - Kaguya",
        "Ban-11 - Kachi Kachi",
        "Ban-12 - Hanasaka",
    ],
    // 5. Dynamites (B, 5.08)
    [
        "Ban-1 - Balrog",
        "Ban-2 - Lasvoss",
        "Ban-3 - Baby Cat",
        "Ban-4 - Ice Cat",
        "Ban-5 - Satoru",
        "Ban-6 - Momoco",
        "Ban-7 - Dynasaurus",
        "Ban-8 - Cat Machine",
        "Ban-9 - Paladin",
        "Ban-10 - Tengu",
        "Ban-11 - Nurse",
        "Ban-12 - Cat Clan Heroes",
    ],
    // 6. Wargods (B, 4.92)
    [
        "Ban-1 - Yukimura",
        "Ban-2 - Keiji",
        "Ban-3 - Shingen",
        "Ban-4 - Hanzo",
        "Ban-5 - Akechi",
        "Ban-6 - Amakusa",
        "Ban-7 - Kenshin",
        "Ban-8 - Musashi",
        "Ban-9 - Yoshimoto",
        "Ban-10 - Oda",
        "Ban-11 - Masamune",
        "Ban-12 - Kaihime",
    ],
    // 7. Iron Legions (B, 4.8)
    [
        "Ban-1 - Siege Engine",
        "Ban-2 - Deth Troy",
        "Ban-3 - Aethur",
        "Ban-4 - Thermae",
        "Ban-5 - Muu",
        "Ban-6 - Drednot",
        "Ban-7 - Rekon Korps",
        "Ban-8 - Bomburr",
        "Ban-9 - Sphinx Korps",
        "Ban-10 - Envanz",
    ],
    // 8. MonGals (B, 4.55)
    [
        "Ban-1 - Nanaho",
        "Ban-2 - Kanna",
        "Ban-3 - Himeyuri",
        "Ban-4 - Ruri",
        "Ban-5 - Reika",
        "Ban-6 - Vega",
        "Ban-7 - Deale",
        "Ban-8 - Tomoe",
        "Ban-9 - Verbena",
    ],
    // 9. Elemental Pixies (C, 4.33)
    [
        "Ban-1 - Gravi",
        "Ban-2 - Lumina",
        "Ban-3 - Bora",
        "Ban-4 - Yamii",
        "Ban-5 - Volta",
        "Ban-6 - Aer",
        "Ban-7 - Blizana",
        "Ban-8 - Mizli",
        "Ban-9 - Tetsukachi",
    ],
    // 10. Dragon Emperors (C, 4.16)
    [
        "Ban-1 - Daliasan",
        "Ban-2 - Dioramos",
        "Ban-3 - Hevijak",
        "Ban-4 - Ganglion",
        "Ban-5 - Raiden",
        "Ban-6 - Gunduros",
        "Ban-7 - Babel",
        "Ban-8 - Gladios",
        "Ban-9 - Vars",
        "Ban-10 - Kamukura",
        "Ban-11 - Megidora",
        "Ban-12 - Sodom",
    ],
    // 11. Nekolugas (C, 3.81)
    [
        "Ban-1 - Tecoluga",
        "Ban-2 - Balaluga",
        "Ban-3 - Asiluga",
        "Ban-4 - Togeluga",
        "Ban-5 - Kubiluga",
        "Ban-6 - Furiluga",
        "Ban-7 - Legeluga",
        "Ban-8 - Kaoluga",
        "Ban-9 - Nekoluga",
        "Ban-10 - Nobiluga",
        "Ban-11 - Papaluga",
    ],
];
exports.default = exports.tierListRaw.flat(1);

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Cat: "Basic",
    "Tank Cat": "Basic",
    "Axe Cat": "Basic",
    "Gross Cat": "Basic",
    "Cow Cat": "Basic",
    "Bird Cat": "Basic",
    "Fish Cat": "Basic",
    "Lizard Cat": "Basic",
    "Titan Cat": "Basic",
    "Actress Cat": "Special",
    "Kung Fu Cat": "Special",
    "Mr.": "Special",
    "Bondage Cat": "Special",
    "Dom Cat": "Special",
    "Cats in a Box": "Special",
    "Panties Cat": "Special",
    Moneko: "Special",
    "Tricycle Cat": "Special",
    "Ninja Cat": "Special",
    "Zombie Cat": "Special",
    "Samurai Cat": "Special",
    "Sumo Cat": "Special",
    "Boogie Cat": "Special",
    "Skirt Cat": "Special",
    "Valkyrie Cat": "Special",
    "Bahamut Cat": "Special",
    Kerihime: "Special",
    "Cat Princess": "Special",
    "Capsule Cat": "Special",
    "Masked Cat": "Special",
    "Bodhisattva Cat": "Super Rare",
    "Delinquent Cat": "Super Rare",
    "Hip Hop Cat": "Super Rare",
    "Kotatsu Cat": "Super Rare",
    Nekoluga: "Uber Super Rare",
    "Nerd Cat": "Super Rare",
    "Swimmer Cat": "Super Rare",
    "Pogo Cat": "Rare",
    "Wheel Cat": "Rare",
    "Apple Cat": "Super Rare",
    "Bath Cat": "Super Rare",
    "Salon Cat": "Rare",
    "Ice Cat": "Uber Super Rare",
    "Cat Machine": "Uber Super Rare",
    "Lesser Demon Cat": "Uber Super Rare",
    "Maiko Cat": "Special",
    "Jurassic Cat": "Rare",
    "Viking Cat": "Rare",
    "Pirate Cat": "Rare",
    "Thief Cat": "Rare",
    "Bishop Cat": "Rare",
    "Fortune Teller Cat": "Rare",
    "Shaman Cat": "Rare",
    "Evangelist Cat": "Uber Super Rare",
    "Type 10": "Special",
    "Witch Cat": "Rare",
    "Archer Cat": "Rare",
    "Marauder Cat": "Uber Super Rare",
    "Swordsman Cat": "Rare",
    "Baby Cat": "Uber Super Rare",
    "Bronze Cat": "Rare",
    "Sushi Cat": "Super Rare",
    "Toy Machine Cat": "Special",
    "Sports Day Cat": "Rare",
    Swordsman: "Rare",
    "Cow Princess": "Rare",
    "PPT48\r": "Uber Super Rare",
    "Li'l Gau": "Rare",
    "Reaper\r": "Super Rare",
    "Sleeping Beauty Punt\r": "Super Rare",
    "Salaryman Cat": "Rare",
    "Sanada Yukimura": "Uber Super Rare",
    "Maeda Keiji": "Uber Super Rare",
    "Oda Nobunaga": "Uber Super Rare",
    "Reindeer Fish Cat": "Rare",
    Windy: "Uber Super Rare",
    Thundia: "Uber Super Rare",
    "Droid Cat": "Rare",
    "Space Cat": "Rare",
    "Adult Cat": "Rare",
    "Evil Cat": "Rare",
    "Doll Cats": "Rare",
    "Blue Shinobi": "Special",
    Sodom: "Uber Super Rare",
    Megidora: "Uber Super Rare",
    Vars: "Uber Super Rare",
    Kamukura: "Uber Super Rare",
    Raiden: "Uber Super Rare",
    "Rope Jump Cat": "Rare",
    Nimue: "Uber Super Rare",
    "Monkey King": "Uber Super Rare",
    "Crazed Cat": "Super Rare",
    "Crazed Tank Cat": "Super Rare",
    "Crazed Axe Cat": "Super Rare",
    "Crazed Gross Cat": "Super Rare",
    "Crazed Cow Cat": "Super Rare",
    "Crazed Bird Cat": "Super Rare",
    "Crazed Fish Cat": "Super Rare",
    "Crazed Lizard Cat": "Super Rare",
    "Crazed Titan Cat": "Super Rare",
    "Maiden Cat": "Rare",
    "Clone Elle": "Special",
    "Red Marron": "Special",
    "Cabaret Cat": "Special",
    "Koi Cat": "Rare",
    Kuu: "Uber Super Rare",
    Kai: "Uber Super Rare",
    Coppermine: "Uber Super Rare",
    "Cat Bros": "Special",
    "Madam Bride": "Rare",
    Celesse: "Rare",
    Nono: "Rare",
    Olga: "Rare",
    Norn: "Rare",
    Yoichi: "Rare",
    Serum: "Rare",
    Fuu: "Rare",
    Aura: "Super Rare",
    Rei: "Super Rare",
    Wyvern: "Uber Super Rare",
    Healer: "Special",
    Merc: "Special",
    "Vacation Queen": "Rare",
    "Bean Cats": "Special",
    "Date Masamune": "Uber Super Rare",
    "Takeda Shingen": "Uber Super Rare",
    "Clockwork Cat": "Rare",
    "Flower Cat": "Special",
    "Vengeful Cat": "Rare",
    "Gold Cat": "Super Rare",
    "Ururun Wolf": "Special",
    Neneko: "Super Rare",
    "Kung Fu Cat X": "Rare",
    Hikakin: "Special",
    "Urashima Taro": "Uber Super Rare",
    "The Grateful Crane": "Uber Super Rare",
    Momotaro: "Uber Super Rare",
    "Kasa Jizo": "Uber Super Rare",
    "Princess Kaguya": "Uber Super Rare",
    Nekondo: "Special",
    "Squish Ball Cat": "Special",
    God: "Special",
    "Tutorial Cat": "Special",
    "Nurse Cat": "Uber Super Rare",
    "Cat Base Mini": "Super Rare",
    "Cat Gunslinger": "Rare",
    "Stilts Cat": "Rare",
    "Tin Cat": "Rare",
    "Rocker Cat": "Rare",
    "Mer-Cat": "Rare",
    "Juliet Cat": "Super Rare",
    "Weightlifter Cat": "Super Rare",
    "Figure Skating Cats": "Super Rare",
    "Cat Toaster": "Super Rare",
    "Hoop Cat": "Rare",
    "Chicken Cat": "Uber Super Rare",
    "Drury Swordsman": "Rare",
    Nubobo: "Special",
    "Uesugi Kenshin": "Uber Super Rare",
    Kalisa: "Uber Super Rare",
    "Yurinchi\r": "Super Rare",
    "Crazed Princess Punt\r": "Uber Super Rare",
    "Ayanokōji Shō": "Special",
    "Saotome Hikaru": "Special",
    "Saionji Hitomi": "Special",
    "Hoshi Guranmanie": "Special",
    "Shiratori Shōchikubai": "Special",
    "Yankee Cat": "Rare",
    Asiluga: "Uber Super Rare",
    Kubiluga: "Uber Super Rare",
    Tecoluga: "Uber Super Rare",
    Balaluga: "Uber Super Rare",
    "Li'l Nyandam": "Special",
    "Baby Mola": "Super Rare",
    "Mola King": "Uber Super Rare",
    "Meowla Meowla": "Special",
    "Marshmallow Cat": "Rare",
    Dioramos: "Uber Super Rare",
    "Mob Cat": "Special",
    "Takuya & Yuki": "Rare",
    "Mystery Girl Yuki": "Uber Super Rare",
    "Yuki Cat": "Special",
    "Cat Kart R": "Rare",
    "Mr. Ninja": "Special",
    Hearscht: "Uber Super Rare",
    Cornelia: "Uber Super Rare",
    Juvens: "Uber Super Rare",
    Mystica: "Uber Super Rare",
    Alois: "Super Rare",
    Citrouille: "Super Rare",
    Titi: "Special",
    "Yamaoka Minori": "Special",
    "Nakamura Kanae": "Special",
    Akira: "Uber Super Rare",
    "Mekako Saionji": "Uber Super Rare",
    Catman: "Uber Super Rare",
    Psychocat: "Rare",
    "Onmyoji Cat": "Rare",
    "Surfer Cat": "Super Rare",
    "Metal Cat": "Super Rare",
    "Drumcorps Cat": "Rare",
    "Baozi Cat": "Special",
    "Kachi-Kachi": "Uber Super Rare",
    Airou: "Special",
    "Sheria - Kirin": "Special",
    Rathalos: "Special",
    Rathian: "Special",
    "Kirin Neko": "Special",
    "Li'l Cat": "Special",
    "Li'l Tank Cat": "Special",
    "Li'l Axe Cat": "Special",
    "The White Rabbit": "Uber Super Rare",
    Catburger: "Special",
    HYAKUTARO: "Rare",
    MARCO: "Rare",
    TARMA: "Rare",
    ERI: "Rare",
    FIO: "Rare",
    "SV-001": "Super Rare",
    "ALLEN O'NEIL": "Super Rare",
    "MARS PEOPLE": "Rare",
    "HUGE HERMIT": "Uber Super Rare",
    "JUPITER KING": "Uber Super Rare",
    "DONALD MORDEN": "Uber Super Rare",
    "HI-DO": "Uber Super Rare",
    "Warlock and Pierre": "Uber Super Rare",
    Pumpcat: "Rare",
    "Gloomy Neneko": "Super Rare",
    Hallowindy: "Uber Super Rare",
    "Spooky Thundia": "Uber Super Rare",
    Oden: "Special",
    Valkyrie: "Rare",
    Brynhildr: "Rare",
    Suruzu: "Rare",
    Freya: "Super Rare",
    "God of War - Odin": "Uber Super Rare",
    "Freshman Cat Jobs": "Super Rare",
    "Rich Cat III": "Super Rare",
    "Sniper the Recruit": "Super Rare",
    Togeluga: "Uber Super Rare",
    "Frosty Kai": "Uber Super Rare",
    "Santa Kuu": "Uber Super Rare",
    "Holy Coppermine": "Uber Super Rare",
    "A Gift of Cats": "Rare",
    "Li'l Gross Cat": "Special",
    "Li'l Cow Cat": "Special",
    "Li'l Bird Cat": "Special",
    "Undead Cat": "Special",
    "C&D Swordsman": "Rare",
    "Horsemen Cavalry": "Rare",
    Ashura: "Rare",
    "Battle Balloon": "Rare",
    "Dragon Rider": "Rare",
    "Pretty Cat": "Rare",
    Cyclops: "Rare",
    Golem: "Special",
    "Thunder God Zeus": "Uber Super Rare",
    "Anubis the Protector": "Uber Super Rare",
    "Radiant Aphrodite": "Uber Super Rare",
    Catway: "Super Rare",
    Hayabusa: "Uber Super Rare",
    Nyamusu: "Special",
    Pochi: "Special",
    Kuromi: "Special",
    Setsuko: "Special",
    "Nabaaru-kun": "Special",
    Catornado: "Super Rare",
    "Red Riding Mina": "Special",
    "Baby Gao": "Uber Super Rare",
    "Crazed Yuki": "Uber Super Rare",
    "Shining Amaterasu": "Uber Super Rare",
    "Splendid Ganesha": "Uber Super Rare",
    "Cheerleader Cat": "Super Rare",
    "Tropical Kalisa": "Uber Super Rare",
    "Midsummer Rabbit": "Uber Super Rare",
    "Sunny Neneko": "Super Rare",
    Funghi: "Rare",
    Tanky: "Special",
    "White Cat": "Special",
    Fortressy: "Special",
    Futenyan: "Rare",
    "Awa-Odori Cat": "Rare",
    "Pai-Pai": "Uber Super Rare",
    "Express Cat": "Super Rare",
    "Strike Unit R.E.I.": "Uber Super Rare",
    "Little Leaguer Cat": "Super Rare",
    "Madoka Kaname": "Uber Super Rare",
    "Homura Akemi": "Uber Super Rare",
    "Sayaka Miki": "Uber Super Rare",
    "Mami Tomoe": "Uber Super Rare",
    "Kyoko Sakura": "Uber Super Rare",
    Kyubey: "Super Rare",
    "Madoka Cat": "Rare",
    "Homura Cat": "Rare",
    "Sayaka Cat": "Rare",
    "Mami Cat": "Rare",
    "Kyoko Cat": "Rare",
    "Li'l Madoka": "Rare",
    "Li'l Homura": "Special",
    "Kyubey Cat": "Rare",
    "Lilith Cat": "Uber Super Rare",
    "Food Stall Cat": "Rare",
    "Mighty Kat-A-Pult": "Uber Super Rare",
    "Mighty Drednot": "Uber Super Rare",
    "Mighty Bomburr": "Uber Super Rare",
    "Vaulter Cat": "Super Rare",
    "Gardener Cat": "Rare",
    "Neko Hakase": "Special",
    "Yuletide Nurse": "Uber Super Rare",
    "Li'l Fish Cat": "Special",
    "Li'l Lizard Cat": "Special",
    "Li'l Titan Cat": "Special",
    "Years-End Neneko": "Super Rare",
    PIKOTARO: "Rare",
    "Wrathful Poseidon": "Uber Super Rare",
    CPAC: "Special",
    "Miko Mitama": "Uber Super Rare",
    "Killer Cat": "Rare",
    Nazousagi: "Special",
    Sarukani: "Uber Super Rare",
    "Miyamoku Musashi": "Special",
    "Curling Cat": "Rare",
    "Welterweight Cat": "Rare",
    Mobius: "Uber Super Rare",
    Belial: "Super Rare",
    "Happy 100": "Special",
    "Eggy Cat": "Rare",
    "Springtime Kenshin": "Uber Super Rare",
    "Bunny & Canard": "Uber Super Rare",
    "Easter Neneko": "Super Rare",
    "Shadow Gao": "Uber Super Rare",
    "Trickster Himeyuri": "Uber Super Rare",
    "Sea Maiden Ruri": "Uber Super Rare",
    "Queen Reika": "Uber Super Rare",
    "HMS Princess\r": "Uber Super Rare",
    "Imagawa Yoshimoto": "Uber Super Rare",
    "Redhead Yuki Cat": "Rare",
    "Lost World Yuki": "Uber Super Rare",
    "Maneki Cat": "Special",
    "Slug Jockey Cat": "Rare",
    Orthos: "Super Rare",
    Michelia: "Uber Super Rare",
    Todomeki: "Uber Super Rare",
    "Gudetama Cat": "Special",
    "Gudetama Plate": "Rare",
    "Gudegude Pudding": "Super Rare",
    "Nisetama Army": "Uber Super Rare",
    Twinstars: "Uber Super Rare",
    "Hermit Cat": "Special",
    "Seashore Kai": "Uber Super Rare",
    "Mighty Rekon Korps": "Uber Super Rare",
    Nora: "Special",
    "Wolfchild Deale": "Uber Super Rare",
    "Graveflower Verbena": "Uber Super Rare",
    Bora: "Uber Super Rare",
    Mizli: "Uber Super Rare",
    Aer: "Uber Super Rare",
    Saber: "Uber Super Rare",
    "Rin Tohsaka": "Uber Super Rare",
    Illyasviel: "Uber Super Rare",
    Archer: "Uber Super Rare",
    Lancer: "Uber Super Rare",
    Rider: "Uber Super Rare",
    Gilgamesh: "Uber Super Rare",
    "Saber the Cat": "Special",
    "Sakura the Cat": "Rare",
    "Rin the Cat": "Rare",
    "Illya the Cat": "Rare",
    "Li'l Shirou": "Rare",
    "Li'l Sakura": "Special",
    "Coin Cat": "Special",
    "Rover Cat": "Rare",
    "Fencer Cat": "Super Rare",
    "Dark Mitama": "Uber Super Rare",
    "Volley Cat": "Rare",
    "D'artanyan": "Uber Super Rare",
    "Farmer Cat": "Special",
    "Glass Cat": "Rare",
    "Masked Yulala": "Special",
    "Satori Hikami & Cat": "Special",
    "Akio Yabe": "Rare",
    "Sairi Nijitani": "Rare",
    "Misaki Konno": "Rare",
    "Ren Katagiri": "Rare",
    "Karin Nekozuka": "Rare",
    "Aoi Hayakawa": "Super Rare",
    "Mizuki Tachibana": "Super Rare",
    "Hijiri Rokudo": "Super Rare",
    "Saki Nijima": "Uber Super Rare",
    "Subaru Hoshi": "Uber Super Rare",
    "Miyabi Oyama": "Uber Super Rare",
    Ganglion: "Uber Super Rare",
    "Sakura Sonic": "Uber Super Rare",
    Honiton: "Special",
    Mentori: "Rare",
    Imoto: "Special",
    Voli: "Uber Super Rare",
    "Shinji & Cat": "Rare",
    "Gendo & Fuyutsuki Cats": "Special",
    "Giraffe Unit-01": "Rare",
    "Kaworu & Cat": "Special",
    "Rei Cat": "Rare",
    "Asuka Cat": "Rare",
    "Mari Cat": "Rare",
    "Rei Ayanami": "Super Rare",
    "Asuka Langley": "Super Rare",
    "Mari Illustrious": "Super Rare",
    "Eva Unit-00": "Uber Super Rare",
    "Eva Unit-01": "Uber Super Rare",
    "Eva Unit-02": "Uber Super Rare",
    "Shinji Cat": "Uber Super Rare",
    "Moon Operators": "Uber Super Rare",
    "Mighty Thermae D-Lux": "Uber Super Rare",
    "Crazed Moneko": "Special",
    Pokota: "Rare",
    Ovis: "Rare",
    Coco: "Rare",
    "Uzumasa Moe & Cat": "Rare",
    "Matsuki Saki & Cat": "Rare",
    "Ono Misa & Cat": "Rare",
    "Uzumasa Rei & Cat": "Special",
    "Mecha-Bun": "Special",
    "Cat Clan Heroes": "Uber Super Rare",
    "Souma Cat": "Rare",
    "Otaku Geek Cat": "Super Rare",
    "Gude-Cat Machine": "Uber Super Rare",
    "Detective Vigler": "Uber Super Rare",
    "White Swordsman Cat": "Special",
    "Li'l Valkyrie": "Uber Super Rare",
    Nobiluga: "Uber Super Rare",
    "Cat God the Great": "Special",
    "Waverider Kuu": "Uber Super Rare",
    "Empress Chronos": "Uber Super Rare",
    Bebe: "Uber Super Rare",
    "D'arktanyan": "Uber Super Rare",
    "Lone Cat and Kitten": "Rare",
    "Driller Cat": "Super Rare",
    "Piledriver Cat": "Super Rare",
    "Cutter Cat": "Super Rare",
    "Backhoe Cat": "Super Rare",
    "Miter Saw Cat": "Super Rare",
    "Musashi Miyamoto": "Legendary Rare",
    "Headmistress Jeanne": "Legendary Rare",
    "High Lord Babel": "Legendary Rare",
    Ushiwakamaru: "Legendary Rare",
    "Primordial Cat": "Rare",
    Kitaro: "Special",
    "Medama-Oyaji": "Special",
    "Wonder MOMOCO": "Legendary Rare",
    "Sakura Matou": "Uber Super Rare",
    "Shirou the Cat": "Special",
    "Archer the Cat": "Rare",
    "Rider the Cat": "Rare",
    "Kotomine & Gilgamesh Cats": "Super Rare",
    Legeluga: "Legendary Rare",
    "Filibuster Cat X": "Special",
    "Mighty Kristul Muu": "Legendary Rare",
    Dogumaru: "Special",
    "Black Zeus": "Legendary Rare",
    "Super Zeus": "Uber Super Rare",
    "Holy Phoenix": "Uber Super Rare",
    "Super Devil": "Uber Super Rare",
    Satanmaria: "Uber Super Rare",
    Heracrist: "Uber Super Rare",
    "Fiendish Nero": "Super Rare",
    "Prince Yamato": "Rare",
    "Rosary Angel": "Special",
    "Wakamiko Cat": "Special",
    "Cat Devil": "Special",
    Nekonosuke: "Special",
    Lumina: "Legendary Rare",
    "Doktor Heaven": "Legendary Rare",
    "Benevolent Souma": "Uber Super Rare",
    "Kano ＆ Souma": "Rare",
    "Li'l Valkyrie Dark": "Uber Super Rare",
    Calette: "Uber Super Rare",
    Hina: "Super Rare",
    "Eva Unit-08": "Uber Super Rare",
    "AAA Wunder": "Uber Super Rare",
    "Misato Katsuragi": "Super Rare",
    "Ritsuko Akagi": "Super Rare",
    "Rei Ayanami (???)": "Super Rare",
    "Gaia the Creator": "Legendary Rare",
    "Seabreeze Coppermine": "Uber Super Rare",
    "Matador Cat": "Rare",
    "Narita Kaihime": "Uber Super Rare",
    "Shakurel Cat": "Special",
    "Shakurel Lion": "Special",
    "Shakurel Tiger": "Special",
    "Shakurel Panda": "Special",
    "Cat Bros S": "Rare",
    Myrcia: "Uber Super Rare",
    "Relentless Gladios": "Uber Super Rare",
    Eyewaltz: "Uber Super Rare",
    Mightycat: "Rare",
    "Ryu Cat": "Rare",
    "Chun-Li Cat": "Special",
    Akuma: "Legendary Rare",
    Ryu: "Uber Super Rare",
    "Chun-Li": "Uber Super Rare",
    Guile: "Uber Super Rare",
    Zangief: "Uber Super Rare",
    Blanka: "Uber Super Rare",
    Dhalsim: "Uber Super Rare",
    Ken: "Uber Super Rare",
    "Akuma Giraffe": "Rare",
    Lasvoss: "Uber Super Rare",
    "Good-Luck Ebisu": "Super Rare",
    "Medusa Cat": "Rare",
    "Nymph Cat": "Super Rare",
    "Wushu Cat": "Rare",
    Kintaro: "Uber Super Rare",
    "Snow Angel Twinstars": "Uber Super Rare",
    "Slime Cat": "Rare",
    "Cossack Cat": "Rare",
    "Kasli the Scourge": "Uber Super Rare",
    Herme: "Uber Super Rare",
    "Teacher BearCat": "Rare",
    "Urs & Fenrir": "Special",
    "Sharpshooter Saki": "Uber Super Rare",
    "Hades the Punisher": "Uber Super Rare",
    "Hatsune Miku": "Uber Super Rare",
    "Sakura Miku": "Uber Super Rare",
    "Kagamine Rin & Len": "Uber Super Rare",
    "Miku Cat": "Rare",
    "Rugby Cat": "Rare",
    "Kasli the Bane": "Uber Super Rare",
    "Kyosaka Nanaho": "Legendary Rare",
    "Phantom Cat": "Rare",
    Papaluga: "Uber Super Rare",
    "Night Oracle Rei": "Uber Super Rare",
    "The 4th Angel": "Uber Super Rare",
    "The 6th Angel": "Uber Super Rare",
    "The 10th Angel": "Uber Super Rare",
    "The 9th Angel": "Uber Super Rare",
    "Kaworu Cat": "Rare",
    "Bakery Cat": "Rare",
    "Master Uril": "Special",
    "Shaman Khan": "Uber Super Rare",
    "Holy Knight Alibaba": "Super Rare",
    "Heavenly Jack": "Special",
    "Gacha Cat": "Special",
    "Hell Warden Emma": "Uber Super Rare",
    "Megurine Luka": "Uber Super Rare",
    "MEIKO & Cat": "Super Rare",
    "Luka Cat": "Rare",
    "Squirtgun Saki": "Uber Super Rare",
    Summerluga: "Uber Super Rare",
    "Suntan Cat": "Super Rare",
    "Lifeguard Cats": "Super Rare",
    "Idi:N": "Special",
    Gravi: "Uber Super Rare",
    "Skull Rider Vars": "Uber Super Rare",
    "E. Honda": "Uber Super Rare",
    Balrog: "Uber Super Rare",
    Vega: "Uber Super Rare",
    Sagat: "Uber Super Rare",
    "M. Bison": "Uber Super Rare",
    "C. Honda": "Super Rare",
    "Balrog Cat (Collab)": "Rare",
    "Vega Cat": "Rare",
    "Sagat Cat": "Rare",
    "M. Bison Cat": "Rare",
    "Stone Cat": "Rare",
    "Hatsune Miku: MM2020 Osaka": "Uber Super Rare",
    "Hatsune Miku: MM2020 Tokyo": "Uber Super Rare",
    "Keiji Claus": "Uber Super Rare",
    "Baby Garu": "Uber Super Rare",
    "Emperor Cat": "Legendary Rare",
    "Sweet Aphrodite": "Uber Super Rare",
    "First-Love Myrcia": "Uber Super Rare",
    "Valentine's Neneko": "Super Rare",
    "Snow Miku 2021": "Uber Super Rare",
    "Kaito & Cat": "Super Rare",
    "Neko Rin": "Rare",
    "Neko Len": "Rare",
    "Mighty Aethur Ltd.": "Uber Super Rare",
    "Blooming Kamukura": "Uber Super Rare",
    "Ranma Saotome (M)": "Uber Super Rare",
    "Akane Tendo": "Uber Super Rare",
    "Ryoga Hibiki (Pig)": "Uber Super Rare",
    "Shampoo (Cat)": "Uber Super Rare",
    "Mousse (Duck)": "Uber Super Rare",
    Happosai: "Super Rare",
    "Ukyo Kuonji (GR)": "Super Rare",
    "Tatewaki Kuno (Gi)": "Super Rare",
    "Ranma Cat (M)": "Rare",
    "Akane Cat": "Rare",
    "Panda Cat": "Special",
    "Adventurer Kanna": "Uber Super Rare",
    "Dark Aegis Garu": "Uber Super Rare",
    "Gold Brick Cat": "Special",
    "Godzilla Cat": "Rare",
    "Princess Cat": "Uber Super Rare",
    "Elder Mask Doron": "Special",
    "Kaguya of the Coast": "Uber Super Rare",
    "Kabuto Cat": "Special",
    "Kuwagata Cat": "Special",
    "Summoner Satoru": "Uber Rare",
    "Shiro Amakusa": "Uber Super Rare",
    Lilin: "Uber Super Rare",
    "Hevijak the Wicked": "Uber Super Rare",
    "Aku Researcher": "Rare",
    "Jagando Jr.": "Special",
    "Pied Piper Cat": "Rare",
    "Kunio-kun": "Uber Super Rare",
    Furiluga: "Uber Super Rare",
    "Brainwashed Cat": "Super Rare",
    "Calligraphy Cat": "Rare",
    Yamii: "Uber Super Rare",
    "Mighty Deth-Troy-R": "Uber Super Rare",
    "Shitakiri Sparrow": "Uber Super Rare",
    "White Knight Cyclops": "Uber Super Rare",
    "Million-Dollar Cat": "Special",
    "Brainwashed Tank Cat": "Super Rare",
    "Iz the Dancer": "Uber Super Rare",
    "Lucifer the Fallen": "Uber Super Rare",
    Superfeline: "Basic",
    "Sweet Love Mekako": "Uber Super Rare",
    "Brainwashed Axe Cat": "Super Rare",
    "Firecracker Cat": "Special",
    "Huntress Terun": "Uber Super Rare",
    "Lovestruck Lesser Demon": "Uber Super Rare",
    "Hattori Hanzo": "Uber Super Rare",
    "Secret Crush Cat": "Special",
    "Tomboy Lion Cat": "Special",
    "Chalkboard Eraser Cat": "Special",
    "Elder Beast Naala": "Special",
    "Brainwashed Gross Cat": "Super Rare",
    Bliza: "Uber Super Rare",
    "Ancient Egg N001": "Special",
    "Iz the Dancer of Grief": "Uber Super Rare",
    "Ancient Egg: N101": "Rare",
    "Ancient Egg: N102": "Rare",
    "Sea Serpent Daliasan": "Uber Super Rare",
    "Chronos the Bride": "Uber Super Rare",
    "Brainwashed Cow Cat": "Super Rare",
    "Ancient Egg: N103": "Rare",
    "Ancient Egg: N104": "Rare",
    "Ancient Egg: N201": "Special",
    "Night Beach Lilin": "Uber Super Rare",
    "Brainwashed Bird Cat": "Super Rare",
    "Cat Tengu": "Uber Super Rare",
    "Ancient Egg: N003": "Special",
    "Ancient Egg: N202": "Special",
    "Ranma Saotome (Leotard)": "Uber Super Rare",
    "Genma Saotome (Panda)": "Super Rare",
    ネコチーター: "Uber Super Rare",
    "Mighty Carrowsell": "Uber Super Rare",
    "Ancient Egg: N105": "Rare",
    "Ancient Egg: N106": "Rare",
    "Osamu Mikumo & Cat": "Rare",
    "Yuma Kuga & Cat": "Rare",
    "Chika Amatori & Cat": "Special",
    Sakura: "Uber Super Rare",
    Luke: "Uber Super Rare",
    "Spectral Goth Vega": "Uber Super Rare",
    "Count Yukimura": "Uber Super Rare",
    "Brainwashed Fish Cat": "Super Rare",
    "Ancient Egg: N004": "Special",
    "Goddess of Light Sirius": "Uber Super Rare",
    "Reindeer Terun": "Uber Super Rare",
    "Brainwashed Lizard Cat": "Super Rare",
    "Child of Destiny Phono": "Uber Super Rare",
    "Ancient Egg: N000": "Special",
    "Issun Boshi": "Uber Super Rare",
    "White Butler Vigler": "Uber Super Rare",
    "Brainwashed Titan Cat": "Super Rare",
    "Killer Tank Cat": "Rare",
    "Class Rep Cat": "Special",
    "Ancient Egg: N107": "Rare",
    "Thunder Jack": "Uber Super Rare",
    "Rabbit Satoru": "Uber Super Rare",
    "Ancient Egg N005": "Special",
    "King of Doom Phono": "Uber Super Rare",
    "Ancient Egg: N108": "Super Rare",
    "Ancient Egg: N109": "Rare",
    "Jetpack Cat": "Rare",
    "One-Eyed Asuka": "Uber Super Rare",
    "Eva Unit-13": "Uber Super Rare",
    "Betrothed Balaluga": "Uber Super Rare",
    Kaoluga: "Uber Super Rare",
    "Ancient Egg: N203": "Special",
    "Coastal Explorer Kanna": "Uber Super Rare",
    "Mighty Sphinx Korps": "Uber Super Rare",
    "Ancient Egg: N111": "Super Rare",
    "Ancient Egg: N110": "Rare",
    "Maize Cat": "Rare",
    Tekachi: "Uber Super Rare",
    "Ancient Egg: N006": "Special",
    "High School Kingpin Riki": "Uber Super Rare",
    "Hatsune Miku XVI": "Uber Super Rare",
    "Lightmother Aset": "Uber Super Rare",
    "Ancient Egg: N112": "Rare",
    "Ninja Girl Tomoe": "Uber Super Rare",
    "Master of Mind Soractes": "Special",
    "Spirit (Master of Mind)": "Special",
    "Daybreaker Izanagi": "Legendary Rare",
    "Spirit (Izanagi)": "Legendary Rare",
    Pegasa: "Uber Super Rare",
    "Spirit (Pegasa)": "Uber Super Rare",
    "Principal Cat": "Special",
    "Frozen Rose Cat": "Uber Super Rare",
    "Floral Kalisa": "Uber Super Rare",
    "Izanami of Dusk": "Legendary Rare",
    "Spirit (Izanami)": "Legendary Rare",
    "Trash Cat": "Special",
    "Voluptuous Peony - Daji": "Uber Super Rare",
    "Mollyanna Cat": "Rare",
    Madhead: "Rare",
    "Felix the Cat Duke Cat": "Special",
    "Dotty Cat": "Special",
    "Akechi Mitsuhide": "Uber Super Rare",
    "Spirit (Mitsuhide)": "Uber Super Rare",
    "Cake Machine": "Uber Super Rare",
    "Ancient Egg: N205": "Special",
};

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("./data");
const TierList_1 = require("./TierList");
const DescriptionData_1 = require("./DescriptionData");
const Banners_1 = require("./Banners");
const TierLabels_1 = require("./TierLabels");
const UnitsRarity_1 = require("./UnitsRarity");
const HtmlInjector_1 = require("./HtmlInjector");
const descriptionData = new DescriptionData_1.default().parse(data_1.descriptionsDataRaw);
const tierLabels = new TierLabels_1.default().npChart(data_1.npChartRaw);
const tierList = new TierList_1.default(descriptionData)
    .parse(data_1.tierListRaw)
    .npChart(data_1.npChartRaw);
const unitToBanners = new Banners_1.default().parse(data_1.bannersRaw);
for (const fullName of descriptionData.fullNames) {
    if (!tierList.asArray(fullName)) {
        console.log(`${fullName} is not found in tierlist`);
    }
}
if (typeof window !== "undefined") {
    new HtmlInjector_1.default(tierList, unitToBanners, tierLabels, new UnitsRarity_1.default(data_1.unitsRarityRaw)).inject();
}

},{"./Banners":1,"./DescriptionData":2,"./HtmlInjector":3,"./TierLabels":4,"./TierList":5,"./UnitsRarity":6,"./data":9}]},{},[13]);
