import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, image, parent } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    // একই প্যারেন্টের আন্ডারে একই নাম চেক করা
    const existingCategory = await Category.findOne({
      name,
      parent: parent || null,
    });
    if (existingCategory) {
      return res.json({ error: "Already exists under this parent" });
    }

    const category = await new Category({
      name,
      image,
      parent: parent || null,
    }).save();

    res.json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, image, parent, isActive } = req.body; // parent ও isActive যোগ করা হলো
    const { categoryId } = req.params;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.name = name || category.name;
    category.image = image || category.image;
    category.parent = parent !== undefined ? parent : category.parent; // parent আপডেট
    category.isActive = isActive !== undefined ? isActive : category.isActive; // status আপডেট

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const removeCategory = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // চেক করা: এই ক্যাটাগরির আন্ডারে কি কোনো চাইল্ড আছে?
    const hasChildren = await Category.exists({ parent: categoryId });

    if (hasChildren) {
      // অপশন ১: চাইল্ড থাকলে ডিলিট হতে দেবেন না (Safe approach)
      return res
        .status(400)
        .json({ error: "Cannot delete. This category has sub-categories." });

      // অপশন ২: চাইল্ডদের parent কে null করে দিন (Orphan approach)
      // await Category.updateMany({ parent: categoryId }, { $set: { parent: null } });
    }

    const removed = await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Category removed", removed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// সবচেয়ে গুরুত্বপূর্ণ অংশ: Tree Structure তৈরি করা
const listCategory = asyncHandler(async (req, res) => {
  try {
    // সব ক্যাটাগরি ফ্ল্যাট আকারে নিচ্ছি, populate এর দরকার নেই ট্রি বানানোর জন্য
    const all = await Category.find({}).lean();

    // ফ্ল্যাট লিস্ট থেকে Nested Tree বানানোর ফাংশন
    const buildCategoryTree = (categories, parentId = null) => {
      const categoryList = [];
      const filteredCategories = categories.filter((cat) => {
        // parentId null হলে মেন ক্যাটাগরি, না হলে চাইল্ড
        return String(cat.parent) === String(parentId);
      });

      for (let cat of filteredCategories) {
        categoryList.push({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          isActive: cat.isActive,
          children: buildCategoryTree(categories, cat._id), // Recursive call
        });
      }
      return categoryList;
    };

    const categoryTree = buildCategoryTree(all);
    res.json(categoryTree);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
});

const readCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    res.json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
};
