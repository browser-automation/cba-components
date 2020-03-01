#!/usr/bin/env node

"use strict";

const config = require('../webpack.config.js');
const webpack = require('webpack');
const compiler = webpack(config);

compiler.run((err, res) =>
{
  if (err)
    console.error("Error", err);
  else
    console.log("Components are ready");
});
