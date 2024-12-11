const Category = require("../../model/Category/Category");
const { appErr, AppErr } = require("../../utils/appError");

const createCategory = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({ title, user: req.userAuth });
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

const fetchCategories = async (req, res, next) => {
  try {
    const category = await Category.find({});

    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const fetchCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};
const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      data: "category deleted",
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};
const updateCategory = async (req, res, next) => {
  try {
    const { title } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title, user: req.userAuth },
      { new: true, runValidators: true }
    );

    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    return next(new AppErr(error.message));
  }
};

module.exports = {
  createCategory,
  fetchCategory,
  deleteCategory,
  updateCategory,
  fetchCategories,
};
