const browserify = require("browserify");
const tsify = require("tsify");
const fs = require("fs");

const file = fs.createWriteStream("tmp/godfat.js");

browserify()
  .add("godfat/index.ts")
  .plugin(tsify, { noImplicitAny: false })
  .bundle()
  .on("error", function (error) {
    console.error(error.toString());
  })
  .pipe(file);
