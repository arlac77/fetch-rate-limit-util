import json from "rollup-plugin-json";
import cleanup from "rollup-plugin-cleanup";
import executable from "rollup-plugin-executable";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default {
  plugins: [resolve(), commonjs()],
  input: pkg.module,
  output: {
    file: pkg.main,
    format: "cjs",
    interop: false
  }
};
