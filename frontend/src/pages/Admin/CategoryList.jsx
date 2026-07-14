/* eslint-disable react/prop-types */
import { useState, memo } from "react";
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
import React from "react";

// Icons
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline, MdOutlineCloudUpload } from "react-icons/md";
import { FaFolder, FaFolderOpen, FaChevronRight, FaChevronDown, FaPlus } from "react-icons/fa";

const isDevelopment = import.meta.env.DEV;
const RENDER_BACKEND_URL = "https://bechabikri-1.onrender.com";
const API_URL = isDevelopment ? "" : RENDER_BACKEND_URL;
const UPLOAD_URL = "/api/upload";

// --- Sub Components (Memoized for Performance) ---

const ButtonSpinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-sm ${className}`} />
);

// Accordion Item Component
const AccordionItem = memo(function AccordionItem({ category, onEdit, onDelete, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const children = category.children || [];
  const hasChildren = children.length > 0;

  return (
    <article className={`border-b border-gray-200 last:border-b-0 ${depth > 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
      <div 
        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {hasChildren ? (
            <span className="text-gray-500 flex-shrink-0">
              {isOpen ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
            </span>
          ) : (
            <span className="w-[14px] flex-shrink-0" />
          )}
          
          <div className="flex-shrink-0">
            {category.image ? (
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-10 h-10 rounded-sm object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                {isOpen && hasChildren ? <FaFolderOpen size={16} /> : <FaFolder size={16} />}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-['Playfair_Display'] text-base font-bold text-black truncate">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 font-['Trebuchet_MS']">
              {depth === 0 ? "Main Category" : "Subcategory"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-sm transition-colors"
            aria-label="Edit Category"
          >
            <CiEdit size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
            aria-label="Delete Category"
          >
            <MdDeleteOutline size={18} />
          </button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="border-t border-gray-100">
          {children.map((child) => (
            <AccordionItem 
              key={child._id} 
              category={child} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </article>
  );
});

const CategoryList = () => {
  const { data: categories, isLoading, refetch } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  // Recursive function for Select Dropdown
  const renderTreeOptions = (cats, depth = 0) => {
    if (!cats || cats.length === 0) return null;
    return cats.map((c) => (
      <React.Fragment key={c._id}>
        <option value={c._id}>
          {"\u00A0\u00A0".repeat(depth * 2)} {depth > 0 ? "↳ " : ""} {c.name}
        </option>
        {c.children && c.children.length > 0 && renderTreeOptions(c.children, depth + 1)}
      </React.Fragment>
    ));
  };

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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    const imageUrl = await uploadImage();
    try {
      const result = await createCategory({ name, image: imageUrl, parent: parent || null }).unwrap();
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
  const inputClass = "w-full border border-gray-200 rounded-sm px-4 py-2.5 text-sm font-['Trebuchet_MS'] focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-sm font-bold text-gray-600 uppercase tracking-wider block mb-2 font-['Trebuchet_MS']";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-['Trebuchet_MS'] pt-24 pb-16">
      <AdminMenu />
      
      <main className="px-4 lg:pl-[260px] transition-all duration-300 pb-5">
        <div className="max-w-[1500px] mx-auto">
          
     

          {/* Create Form Card */}
          <section className="bg-white border border-gray-200 p-6 rounded-sm mb-6 shadow-sm">
            <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
              <FaPlus size={14} /> Create New Category
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <label className="flex items-center gap-2 w-full border border-gray-200 rounded-sm px-4 py-2.5 cursor-pointer hover:border-black transition-colors bg-white text-sm text-gray-600">
                    <MdOutlineCloudUpload className="text-gray-500 text-lg" />
                    <span className="truncate">{image ? image.name : "Choose an image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Image Preview & Submit */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="h-[80px] flex items-center">
                  {image && (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-16 h-16 rounded-sm object-cover border border-gray-200"
                    />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {creating && <ButtonSpinner />} {creating ? "Processing" : "Create Category"}
                </button>
              </div>
            </form>
          </section>

          {/* Accordion Categories List */}
          <section className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base font-['Playfair_Display'] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <FaFolderOpen size={16} /> All Categories
              </h2>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                    <Skeleton className="w-10 h-10 rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categories?.length > 0 ? (
              <div>
                {categories.map((mainCat) => (
                  <AccordionItem 
                    key={mainCat._id} 
                    category={mainCat} 
                    onEdit={(cat) => {
                      setSelectedCategory(cat);
                      setUpdatingName(cat.name);
                      setModalVisible(true);
                    }}
                    onDelete={(cat) => {
                      setSelectedCategory(cat);
                      setModalVisible(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-500 uppercase font-bold">No categories found.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal Component */}
      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setImage(null);
        }}
      >
        <div className="bg-white p-6 md:p-8 rounded-sm font-['Trebuchet_MS']">
          <header className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-['Playfair_Display'] font-bold text-black uppercase tracking-wider">
              Edit Category
            </h2>
            <p className="text-gray-500 text-sm mt-1 uppercase font-bold tracking-wider">
              Update details or remove permanently.
            </p>
          </header>

          <form onSubmit={handleUpdateCategory} className="space-y-6">
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
              <label className="flex items-center gap-2 w-full border border-gray-200 rounded-sm px-4 py-2.5 cursor-pointer hover:border-black transition-colors bg-white text-sm text-gray-600">
                <MdOutlineCloudUpload className="text-gray-500 text-lg" />
                <span className="truncate">{image ? image.name : "Choose new image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Container */}
            <div className="h-[90px] flex gap-6 items-center border-t border-b border-gray-100 py-4">
              {selectedCategory?.image && !image && (
                <div>
                  <p className="text-sm uppercase font-bold text-gray-400 mb-1">Current</p>
                  <img
                    src={selectedCategory.image}
                    alt="Current Category"
                    className="w-16 h-16 rounded-sm object-cover border border-gray-200"
                  />
                </div>
              )}
              {image && (
                <div>
                  <p className="text-sm uppercase font-bold text-black mb-1">New Preview</p>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="New Category Preview"
                    className="w-16 h-16 rounded-sm object-cover border border-black"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="submit"
                disabled={updating}
                className="flex justify-center items-center bg-black text-white py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-all disabled:bg-gray-400"
              >
                {updating && <ButtonSpinner />} {updating ? "Updating" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleting}
                className="flex justify-center items-center bg-white text-red-600 border border-red-200 py-3 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
              >
                {deleting && <ButtonSpinner />} {deleting ? "Deleting" : "Delete"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;