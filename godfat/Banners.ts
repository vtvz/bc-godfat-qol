export interface Banner {
  title: string;
  link: string;
  units: string[];
}

export default class Banners {
  unitToBanners: Map<string, Set<any>> = new Map();

  addItem(key: string, value: any) {
    if (!this.unitToBanners[key]) {
      this.unitToBanners[key] = new Set();
    }
    this.unitToBanners[key].add(value);
  }

  asArray(key: string): any[] {
    const val = this.unitToBanners[key];
    if (!val) {
      return;
    }

    return [...val];
  }

  parse(banners: Banner[]): Banners {
    for (const banner of banners) {
      for (const fullName of banner.units) {
        this.addItem(fullName, banner);
      }
    }
    return this;
  }
}
