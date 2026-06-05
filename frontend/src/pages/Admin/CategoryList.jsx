/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "@redux/api/categoryApiSlice";
import AdminMenu from "./AdminMenu";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import axios from "axios";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline, MdOutlineCloudUpload } from "react-icons/md";
import React from "react";

// Icons for TreeView
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaPlus,
} from "react-icons/fa";

// Custom Loading Spinner Component
const ButtonSpinner = () => (
  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
);

const CategoryList = () => {
  const { data: categories, refetch } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  // Flatten nested categories for the Table view
  const flatCategories = useMemo(() => {
    const flat = [];
    const flattenTree = (cats, isSub = false) => {
      if (!cats) return;
      for (const cat of cats) {
        flat.push({ ...cat, isSubCategory: isSub });
        if (cat.children && cat.children.length > 0) {
          flattenTree(cat.children, true);
        }
      }
    };
    flattenTree(categories);
    return flat;
  }, [categories]);

  // Recursive function for Select Dropdown (Now uses nested children)
  const renderTreeOptions = (cats, depth = 0) => {
    if (!cats || cats.length === 0) return null;
    return cats.map((c) => (
      <React.Fragment key={c._id}>
        <option value={c._id}>
          {"\u00A0\u00A0".repeat(depth * 2)} {depth > 0 ? "↳ " : ""} {c.name}
        </option>
        {c.children &&
          c.children.length > 0 &&
          renderTreeOptions(c.children, depth + 1)}
      </React.Fragment>
    ));
  };

  // Recursive TreeView Component (Now uses nested children)
  const TreeItem = ({ category }) => {
    const [isOpen, setIsOpen] = useState(true);
    const children = category.children || [];
    const hasChildren = children.length > 0;

    return (
      <div className="ml-2 md:ml-4 border-l border-gray-200 pl-3 md:pl-4 my-0.5">
        <div className="flex items-center justify-between group py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {isOpen ? (
                  <FaChevronDown size={10} />
                ) : (
                  <FaChevronRight size={10} />
                )}
              </button>
            ) : (
              <span className="w-[10px]" />
            )}

            <span
              className={`text-sm ${hasChildren ? "text-gray-800 font-semibold" : "text-gray-600 font-medium"}`}
            >
              {isOpen && hasChildren ? (
                <FaFolderOpen className="inline mr-1.5 text-blue-500" />
              ) : (
                <FaFolder className="inline mr-1.5 text-gray-400" />
              )}
              {category.name}
            </span>
          </div>

          {/* Opacity used instead of hidden to prevent jumping */}
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button
              onClick={() => {
                setSelectedCategory(category);
                setUpdatingName(category.name);
                setModalVisible(true);
              }}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded-md"
            >
              <CiEdit size={16} />
            </button>
          </div>
        </div>

        {isOpen && hasChildren && (
          <div>
            {children.map((child) => (
              <TreeItem key={child._id} category={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Handle Image Upload
  const uploadImage = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const { data } = await axios.post("/api/upload", formData);
      return data.images && data.images.length > 0 ? data.images[0] : null;
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    const imageUrl = await uploadImage();
    try {
      const result = await createCategory({
        name,
        image: imageUrl,
        parent: parent || null,
      }).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
        setParent("");
        setImage(null);
        toast.success(`${result.name} is created.`);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Creating category failed, try again.");
    }
  };

  // Handle Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName) {
      toast.error("Category name is required");
      return;
    }

    let imageUrl = selectedCategory.image;
    if (image) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: {
          name: updatingName,
          image: imageUrl,
        },
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is updated`);
        setSelectedCategory(null);
        setUpdatingName("");
        setImage(null);
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is deleted.`);
        setSelectedCategory(null);
        setModalVisible(false);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Category deletion failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <AdminMenu />

      {/* Main Container - Reduced padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Header - Reduced margin */}
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Organize your store with infinite sub-categories.
          </p>
        </header>

        {/* Create Form Card - Reduced padding and margin */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <FaPlus className="text-blue-500" /> Create New Category
          </h2>
          <form onSubmit={handleCreateCategory} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="e.g. Electronics, Clothes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Select Parent
                </label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                >
                  <option value="">None (Main Category)</option>
                  {categories && renderTreeOptions(categories)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category Image
                </label>
                <label className="flex items-center gap-2 w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <MdOutlineCloudUpload className="text-gray-400 text-lg" />
                  <span className="text-sm text-gray-500 truncate">
                    {image ? image.name : "Choose an image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Fixed height container to prevent jumping */}
            <div className="h-[80px] flex justify-start items-center">
              {image && (
                <div className="relative inline-block">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full md:w-auto min-w-[160px] flex justify-center items-center px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={creating}
            >
              {creating && <ButtonSpinner />}
              {creating ? "Processing" : "Create Category"}
            </button>
          </form>
        </div>

        {/* Tree View & Table Layout - Reduced gap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tree View Section - Reduced padding */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4 md:p-5 h-fit lg:sticky lg:top-28">
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaFolderOpen className="text-blue-500" /> Hierarchy View
            </h2>
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {categories?.length > 0 ? (
                categories.map((mainCat) => (
                  <TreeItem key={mainCat._id} category={mainCat} />
                ))
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No categories found.
                </p>
              )}
            </div>
          </div>

          {/* Table Section - Reduced padding */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 md:p-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                All Categories
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {flatCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-9 h-9 rounded-md object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                            <FaFolder size={14} />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-gray-800">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.isSubCategory ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"}`}
                        >
                          {category.isSubCategory ? "Sub" : "Main"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={() => {
                              setModalVisible(true);
                              setSelectedCategory(category);
                              setUpdatingName(category.name);
                            }}
                          >
                            <CiEdit size={16} />
                          </button>
                          <button
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => {
                              setSelectedCategory(category);
                              setModalVisible(true);
                            }}
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Component */}
        <Modal
          isOpen={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setImage(null);
          }}
        >
          <div className="bg-white p-5 md:p-6">
            <header className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Category</h2>
              <p className="text-gray-500 text-xs mt-1">
                Update details or remove this category permanently.
              </p>
            </header>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Update Name
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="New category name"
                  value={updatingName}
                  onChange={(e) => setUpdatingName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Change Image
                </label>
                <label className="flex items-center gap-2 w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <MdOutlineCloudUpload className="text-gray-400 text-lg" />
                  <span className="text-sm text-gray-500 truncate">
                    {image ? image.name : "Choose new image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])} // Fixed files[1] to files[0]
                    className="hidden"
                  />
                </label>
              </div>

              {/* Fixed height container for image preview to prevent jumping */}
              <div className="h-[90px] flex gap-4 items-center">
                {selectedCategory?.image && !image && (
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-gray-400 mb-1">
                      Current
                    </p>
                    <img
                      src={selectedCategory.image}
                      alt="Current"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
                {image && (
                  <div>
                    <p className="text-[9px] uppercase font-semibold text-blue-400 mb-1">
                      New Preview
                    </p>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-blue-200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="min-w-[120px] flex justify-center items-center bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-black transition-all text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={updating}
                >
                  {updating && <ButtonSpinner />}
                  {updating ? "Updating" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="min-w-[120px] flex justify-center items-center bg-white text-red-600 border border-gray-200 py-2.5 rounded-lg font-semibold hover:bg-red-50 hover:border-red-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleting}
                >
                  {deleting && <ButtonSpinner />}
                  {deleting ? "Deleting" : "Delete"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryList;
