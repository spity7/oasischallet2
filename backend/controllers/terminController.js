const Termin = require("../models/terminModel.js");

const validateTerminData = (terminData) => {
  const { name, guestCount, price, downPayment, startDate, endDate } =
    terminData;

  if (!name) {
    return { valid: false, message: "الاسم مطلوب" };
  }

  if (!guestCount) {
    return { valid: false, message: "عدد الضيوف مطلوب ويجب أن يكون أكبر من 0" };
  }

  if (!price) {
    return { valid: false, message: "السعر مطلوب ويجب أن يكون أكبر من 0" };
  }

  if (!startDate) {
    return { valid: false, message: "تاريخ البدء مطلوب" };
  }

  if (!endDate) {
    return { valid: false, message: "تاريخ الانتهاء مطلوب" };
  }

  if (Number(guestCount) <= 0) {
    return { valid: false, message: "يجب أن يكون عدد الضيوف أكبر من 0" };
  }

  if (Number(price) <= 0) {
    return { valid: false, message: "يجب أن يكون السعر أكبر من 0" };
  }

  if (Number(downPayment) < 0) {
    return { valid: false, message: "يجب أن تكون الدفعة الأولى 0 أو أكبر" };
  }

  if (Number(price) < Number(downPayment)) {
    return {
      valid: false,
      message: "وينبغي أن يكون السعر على الأقل بقدر الدفعة الأولى",
    };
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return {
      valid: false,
      message: "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء",
    };
  }

  return { valid: true };
};

exports.addTermin = async (req, res) => {
  try {
    console.log("Received request to add termin", { requestBody: req.body });

    const { valid, message } = validateTerminData(req.body);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    const { name, guestCount, price, downPayment, startDate, endDate } =
      req.body;

    const overlappingTermins = await Termin.find({
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (overlappingTermins.length > 0) {
      return res.status(400).json({
        error: "يتداخل الحجز مع حجز موجود",
      });
    }

    const newTermin = new Termin({
      name,
      guestCount,
      price,
      downPayment,
      startDate,
      endDate,
    });

    const savedTermin = await newTermin.save();

    console.log("Successfully added new termin", { terminId: savedTermin._id });

    res
      .status(201)
      .json({ message: "لقد تم حفظ حجزك بنجاح", termin: savedTermin });
  } catch (error) {
    console.error("Error adding termin:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getTermins = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "تاريخ البدء وتاريخ الانتهاء مطلوبان" });
    }

    const termins = await Termin.find({
      $and: [
        { startDate: { $lte: new Date(endDate) } },
        { endDate: { $gte: new Date(startDate) } },
        { endDate: { $gte: new Date() } }, // Only future or current appointments
      ],
    }).select("name guestCount price downPayment startDate endDate");

    res.status(200).json({ termins });
  } catch (error) {
    console.error(":خطأ في جلب الحجوزات:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.updateTermin = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log("Received data for update:", updatedData); // Debugging Log

    const { valid, message } = validateTerminData(updatedData);
    if (!valid) {
      return res.status(400).json({ error: message });
    }

    const existingTermin = await Termin.findById(id);
    if (!existingTermin) {
      return res.status(404).json({ error: "لم يتم العثور على الحجز" });
    }

    const overlappingTermins = await Termin.find({
      _id: { $ne: id },
      $or: [
        {
          startDate: { $lte: new Date(updatedData.endDate) },
          endDate: { $gte: new Date(updatedData.startDate) },
        },
      ],
    });

    if (overlappingTermins.length > 0) {
      return res.status(400).json({
        error: "يتداخل الحجز مع حجز موجود",
      });
    }

    const updatedTermin = await Termin.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json(updatedTermin);
  } catch (error) {
    console.error("حدث خطأ أثناء تحديث الحجز", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.deleteTermin = async (req, res) => {
  try {
    const { id } = req.params;

    const termin = await Termin.findById(id);
    if (!termin) {
      return res.status(404).json({ error: "Termin not found" });
    }

    await Termin.findByIdAndDelete(id);
    res.status(200).json({ message: "لقد تم حذف حجزك بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
