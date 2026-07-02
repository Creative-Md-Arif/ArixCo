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
const isDevelopment = import.meta.env.DEV;
const RENDER_BACKEND_URL = "https://bechabikri-1.onrender.com";
const API_URL = isDevelopment ? "" : RENDER_BACKEND_URL;
const UPLOAD_URL = "/api/upload";

// Icons for TreeView
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaPlus,
} from "react-icons/fa";

// Custom Loading Spinner Component for Buttons
const ButtonSpinner = () => (
  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
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

  // Recursive function for Select Dropdown
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

  // Recursive TreeView Component
  const TreeItem = ({ category }) => {
    const [isOpen, setIsOpen] = useState(true);
    const children = category.children || [];
    const hasChildren = children.length > 0;

    return (
      <div className="ml-2 md:ml-4 border-l border-gray-200 pl-3 md:pl-4 my-0.5">
        <div className="flex items-center justify-between group py-1.5 px-2 rounded-sm hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-black focus:outline-none"
              >
                {isOpen ? (
                  <FaChevronDown size={9} />
                ) : (
                  <FaChevronRight size={9} />
                )}
              </button>
            ) : (
              <span className="w-[9px]" />
            )}
            <span
              className={`text-[11px] sm:text-xs ${hasChildren ? "text-black font-black uppercase tracking-wider" : "text-gray-600 font-medium"}`}
            >
              {isOpen && hasChildren ? (
                <FaFolderOpen
                  className="inline mr-1.5 text-gray-400"
                  size={11}
                />
              ) : (
                <FaFolder className="inline mr-1.5 text-gray-300" size={11} />
              )}
              {category.name}
            </span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button
              onClick={() => {
                setSelectedCategory(category);
                setUpdatingName(category.name);
                setModalVisible(true);
              }}
              className="p-1 text-gray-400 hover:text-black rounded-sm"
            >
              <CiEdit size={14} />
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
  // Handle Image Upload
  const uploadImage = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);
    try {
      const { data } = await axios.post(`${API_URL}${UPLOAD_URL}`, formData);
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
        updatedCategory: { name: updatingName, image: imageUrl },
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

  // Reusable Styles
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4">
          <div className="max-w-[1500px] mx-auto">
            {/* Header */}
            <div className="mb-8 border-l-4 border-black pl-4 sm:pl-6 py-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                Category / <span className="text-red-600">Management</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                Organize your store hierarchy
              </p>
            </div>

            {/* Create Form Card */}
            <div className="bg-white border border-gray-200 p-4 sm:p-5 rounded-sm mb-6">
              <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                <FaPlus size={10} /> Create New Category
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Category Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g. Electronics"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Select Parent</label>
                    <select
                      value={parent}
                      onChange={(e) => setParent(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">None (Main Category)</option>
                      {categories && renderTreeOptions(categories)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Category Image</label>
                    <label className="flex items-center gap-2 w-full border border-gray-200 rounded-sm px-3 py-2 cursor-pointer hover:border-black transition-colors bg-white text-xs text-gray-500">
                      <MdOutlineCloudUpload className="text-gray-400 text-base" />
                      <span className="truncate">
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

                {/* Image Preview Container */}
                <div className="h-[70px] flex items-center">
                  {image && (
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-14 h-14 rounded-sm object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm flex items-center justify-center gap-1 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {creating && <ButtonSpinner />}{" "}
                  {creating ? "Processing" : "Create Category"}
                </button>
              </form>
            </div>

            {/* Tree View & Table Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Tree View Section */}
              <div className="lg:col-span-1 bg-white border border-gray-200 p-4 sm:p-5 rounded-sm h-fit lg:sticky lg:top-28">
                <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                  <FaFolderOpen size={11} /> Hierarchy View
                </h2>
                <div className="max-h-[500px] overflow-y-auto pr-1">
                  {categories?.length > 0 ? (
                    categories.map((mainCat) => (
                      <TreeItem key={mainCat._id} category={mainCat} />
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-400 py-4 text-center uppercase font-bold">
                      No categories found.
                    </p>
                  )}
                </div>
              </div>

              {/* Table Section */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider">
                    All Categories
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          Image
                        </th>
                        <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {flatCategories.map((category) => (
                        <tr
                          key={category._id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-9 h-9 rounded-sm object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-sm bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300">
                                <FaFolder size={12} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-black uppercase tracking-wider">
                              {category.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider ${category.isSubCategory ? "bg-gray-100 text-gray-600 border border-gray-200" : "bg-black text-white"}`}
                            >
                              {category.isSubCategory ? "Sub" : "Main"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                title="Edit"
                                className="p-1.5 text-gray-400 hover:text-black rounded-sm transition-colors"
                                onClick={() => {
                                  setModalVisible(true);
                                  setSelectedCategory(category);
                                  setUpdatingName(category.name);
                                }}
                              >
                                <CiEdit size={14} />
                              </button>
                              <button
                                title="Delete"
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-sm transition-colors"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setModalVisible(true);
                                }}
                              >
                                <MdDeleteOutline size={14} />
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
                <header className="mb-5 border-b border-gray-200 pb-3">
                  <h2 className="text-sm font-black text-black uppercase tracking-wider">
                    Edit Category
                  </h2>
                  <p className="text-gray-400 text-[9px] mt-1 uppercase font-bold tracking-wider">
                    Update details or remove permanently.
                  </p>
                </header>

                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label className={labelClass}>Update Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="New category name"
                      value={updatingName}
                      onChange={(e) => setUpdatingName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Change Image</label>
                    <label className="flex items-center gap-2 w-full border border-gray-200 rounded-sm px-3 py-2 cursor-pointer hover:border-black transition-colors bg-white text-xs text-gray-500">
                      <MdOutlineCloudUpload className="text-gray-400 text-base" />
                      <span className="truncate">
                        {image ? image.name : "Choose new image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Preview Container */}
                  <div className="h-[85px] flex gap-4 items-center border-t border-b border-gray-100 py-2">
                    {selectedCategory?.image && !image && (
                      <div>
                        <p className="text-[8px] uppercase font-bold text-gray-400 mb-1">
                          Current
                        </p>
                        <img
                          src={selectedCategory.image}
                          alt="Current"
                          className="w-14 h-14 rounded-sm object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    {image && (
                      <div>
                        <p className="text-[8px] uppercase font-bold text-black mb-1">
                          New Preview
                        </p>
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-14 h-14 rounded-sm object-cover border border-black"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex justify-center items-center bg-black text-white py-2.5 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all disabled:bg-gray-400"
                    >
                      {updating && <ButtonSpinner />}{" "}
                      {updating ? "Updating" : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCategory}
                      disabled={deleting}
                      className="flex justify-center items-center bg-white text-red-600 border border-red-200 py-2.5 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
                    >
                      {deleting && <ButtonSpinner />}{" "}
                      {deleting ? "Deleting" : "Delete"}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
