const mongoose = require("mongoose");

const terminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    downPayment: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Termin", terminSchema);
