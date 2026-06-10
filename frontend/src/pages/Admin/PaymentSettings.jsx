/* eslint-disable no-unused-vars */
import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import AdminMenu from "./AdminMenu";
import {
  useGetPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from "../../redux/api/paymentApiSlice";
import { FaSave, FaTrash, FaPlus, FaEdit } from "react-icons/fa";

// Custom Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="flex items-center justify-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
    </div>
    <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-400 animate-pulse">
      Loading Methods...
    </p>
  </div>
);

const PaymentSettings = () => {
  const { data: methods, isLoading, refetch } = useGetPaymentMethodsQuery();
  const [updateMethod] = useUpdatePaymentMethodMutation();
  const [deleteMethod] = useDeletePaymentMethodMutation();

  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: "bKash",
    number: "",
    accountType: "Personal",
    accountName: "",
    instructions: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMethod(formData).unwrap();
      toast.success("Updated successfully");
      setEditingMethod(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (type) => {
    if (window.confirm("Deactivate this method?")) {
      try {
        await deleteMethod(type).unwrap();
        toast.success("Deactivated");
        refetch();
      } catch (err) {
        toast.error("Failed to deactivate");
      }
    }
  };

  if (isLoading) return <LoadingSpinner />;

  // Reusable Styles
  const inputClass = "w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass = "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-20 lg:pt-28 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1500px] mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Payment / <span className="text-red-600">Settings</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Manage gateways & accounts
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMethod("new");
                  setFormData({ type: "bKash", number: "", accountType: "Personal", accountName: "", instructions: "" });
                }}
                className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
              >
                <FaPlus size={10} /> Add Method
              </button>
            </div>

            {/* Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {methods?.map((method) => (
                <motion.div 
                  key={method.type} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="border border-gray-200 p-4 sm:p-5 rounded-sm bg-white hover:border-black transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-wider">{method.type}</h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mt-0.5">{method.accountName}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingMethod(method.type); setFormData(method); }} 
                        className="p-1.5 text-gray-400 hover:text-black transition-colors" 
                        title="Edit"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(method.type)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" 
                        title="Delete"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm">
                    <p className="font-black text-base sm:text-lg tracking-wider text-black">{method.number}</p>
                    <p className="text-[8px] text-gray-500 mt-1 font-bold uppercase">{method.accountType}</p>
                  </div>
                  {method.instructions && (
                    <p className="text-[10px] text-gray-500 mt-3 bg-white border border-dashed border-gray-200 p-2 rounded-sm">
                      <span className="font-bold text-gray-700 uppercase">Note:</span> {method.instructions}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Edit / Add Form */}
            {editingMethod && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="border border-gray-200 p-4 sm:p-6 rounded-sm bg-white"
              >
                <h2 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-wider mb-5 border-b border-gray-100 pb-2">
                  {editingMethod === "new" ? "Add New Method" : "Edit Method"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Payment Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={selectClass}
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Bank">Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Account Type</label>
                      <select
                        value={formData.accountType}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        className={selectClass}
                      >
                        <option value="Personal">Personal</option>
                        <option value="Agent">Agent</option>
                        <option value="Merchant">Merchant</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelClass}>Account Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 017XXXXXXXX"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Account Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Instructions (Optional)</label>
                    <textarea
                      placeholder="Payment instructions for customers..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className={`${inputClass} h-20 resize-none`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 bg-black text-white rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FaSave size={10} /> Save Method
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setEditingMethod(null)} 
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:border-black hover:text-black transition-colors w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;