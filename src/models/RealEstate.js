const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config()

const realEstateSchema = new mongoose.Schema({
title: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
  type: Number,
  required: false,
  trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    trim: true,
  },
  typeOfEstate:  {
      type: String,
      require: true,
        enum: ["residential", "commercial", "industrial"]
    },
  tokens: [
    {
      token: {
        required: true,
        type: String,
      },
    },
  ],
  time: { type: Date, default: Date.now },
});

realEstateSchema.methods.toJSON = function () {
  const obj = this;
  const reObj = obj.toObject();
  return reObj;
};



const RE = mongoose.model("RealEstate", realEstateSchema);
module.exports = RE;
