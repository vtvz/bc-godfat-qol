```bash
echo -n 'export default ' > godfat/data/unitsRarityRaw.ts &&
curl https://onestoppress.com/api/allcats |
  jq '.sampledata | map(select(.form == "Normal")) | map({name: .name, value: .rarity}) | from_entries' >> godfat/data/unitsRarityRaw.ts
```

[Click to install script](https://raw.githubusercontent.com/vtvz/bc-godfat-qol/master/dist/godfat.wiki.js)
