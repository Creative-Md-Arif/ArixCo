/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaMapMarkerAlt,
  FaTruck,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  useGetAllShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
} from "@redux/api/shippingApiSlice";

import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { useGetProductsQuery } from "@redux/api/productApiSlice";

// ✅ BD Location Data Import
import bd from "@bd-geo-data/bd-location-data";

// ✅ FIX: Division alias map — bd-geo-data "Chattogram" → DB "CHITTAGONG"
// Admin থেকে save করার সময় এই map দিয়ে normalize হবে
const DIVISION_ALIASES = {
  Chattogram: "CHITTAGONG",
  Barishal: "BARISAL",
  Cumilla: "COMILLA",
  Jashore: "JESSORE",
  Dhaka: "DHAKA",
  Khulna: "KHULNA",
  Mymensingh: "MYMENSINGH",
  Rajshahi: "RAJSHAHI",
  Rangpur: "RANGPUR",
  Sylhet: "SYLHET",
};

const normalizeDivision = (div) =>
  DIVISION_ALIASES[div] || div.trim().toUpperCase();

const initialFormState = {
  zoneName: "",
  divisions: [],
  districts: [],
  thanas: [],
  baseCost: 60,
  baseWeightKg: 1,
  extraWeightCostPerKg: 20,
  freeShippingMinOrder: "",
  estimatedDays: "3-5 Days",
  isActive: true,
  applicableCategories: [],
  applicableProducts: [],
  excludedCategories: [],
  excludedProducts: [],
};

const ShippingManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");

  // ✅ BD Location States
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [selectedThanas, setSelectedThanas] = useState([]);

  // RTK Query Hooks
  const { data: zones, isLoading, refetch } = useGetAllShippingZonesQuery();
  const [createZone, { isLoading: isCreating }] =
    useCreateShippingZoneMutation();
  const [updateZone, { isLoading: isUpdating }] =
    useUpdateShippingZoneMutation();
  const [deleteZone] = useDeleteShippingZoneMutation();

  const { data: categoriesData } = useFetchCategoriesQuery();
  const { data: productsData } = useGetProductsQuery({
    keyword: productSearch,
  });

  const categories = categoriesData?.categories || categoriesData || [];
  const products = productsData?.products || productsData || [];

  const divisionsEn = bd.allDivisions("en");
  const divisionsBn = bd.allDivisions("bn");

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ✅ FIX: Conflict detection — same ID applicable & excluded উভয়তে থাকলে warn করো
  const getConflictingIds = (applicableList, excludedList) =>
    applicableList.filter((id) => excludedList.includes(id));

  const categoryConflicts = getConflictingIds(
    formData.applicableCategories,
    formData.excludedCategories,
  );
  const productConflicts = getConflictingIds(
    formData.applicableProducts,
    formData.excludedProducts,
  );

  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setSelectedDivision("");
    setSelectedDistrict("");
    setDistricts([]);
    setThanas([]);
    setSelectedThanas([]);
    setIsModalOpen(true);
  };

  const handleEdit = (zone) => {
    setEditingId(zone._id);
    setFormData({
      zoneName: zone.zoneName,
      divisions: zone.divisions || [],
      districts: zone.districts || [],
      thanas: zone.thanas || [],
      baseCost: zone.baseCost,
      baseWeightKg: zone.baseWeightKg,
      extraWeightCostPerKg: zone.extraWeightCostPerKg,
      freeShippingMinOrder: zone.freeShippingMinOrder || "",
      estimatedDays: zone.estimatedDays,
      isActive: zone.isActive,
      applicableCategories: zone.applicableCategories?.map(String) || [],
      applicableProducts: zone.applicableProducts?.map(String) || [],
      excludedCategories: zone.excludedCategories?.map(String) || [],
      excludedProducts: zone.excludedProducts?.map(String) || [],
    });
    setSelectedDivision("");
    setSelectedDistrict("");
    setDistricts([]);
    setThanas([]);
    setSelectedThanas([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shipping zone?")) {
      try {
        await deleteZone(id).unwrap();
        toast.success("Zone deleted");
        refetch();
      } catch (err) {
        toast.error(err?.data?.error || "Failed to delete");
      }
    }
  };

  const handleToggle = async (zone) => {
    try {
      await updateZone({
        zoneId: zone._id,
        data: { isActive: !zone.isActive },
      }).unwrap();
      toast.success("Status updated");
      refetch();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDivisionChange = (e) => {
    const divEn = e.target.value;
    setSelectedDivision(divEn);
    setSelectedDistrict("");
    setThanas([]);
    setSelectedThanas([]);
    if (divEn) {
      setDistricts(bd.districtsOf(divEn, "en"));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (e) => {
    const distEn = e.target.value;
    setSelectedDistrict(distEn);
    setSelectedThanas([]);
    if (distEn) {
      const thanasEn = bd.thanasOf(distEn, "en");
      const thanasBn = bd.thanasOf(distEn, "bn");
      setThanas(thanasEn.map((tEn, i) => ({ en: tEn, bn: thanasBn[i] })));
    } else {
      setThanas([]);
    }
  };

  const handleAddEntireDivision = () => {
    if (!selectedDivision) return toast.error("Select a division first");
    // ✅ FIX: Division normalize করে UPPERCASE alias-এ save করো
    const normalizedDiv = normalizeDivision(selectedDivision);
    setFormData((prev) => {
      const updatedDivisions = prev.divisions.includes(normalizedDiv)
        ? prev.divisions
        : [...prev.divisions, normalizedDiv];
      // Division add করলে তার under-এর districts ও thanas সরিয়ে দাও (redundant)
      const distsUnderDiv = bd.districtsOf(selectedDivision, "en").map((d) => d.toUpperCase());
      const updatedDistricts = prev.districts.filter(
        (d) => !distsUnderDiv.includes(d.toUpperCase()),
      );
      let updatedThanas = prev.thanas;
      bd.districtsOf(selectedDivision, "en").forEach((dist) => {
        const thanasUnderDist = bd
          .thanasOf(dist, "en")
          .map((t) => t.toLowerCase());
        updatedThanas = updatedThanas.filter(
          (t) => !thanasUnderDist.includes(t),
        );
      });
      return {
        ...prev,
        divisions: updatedDivisions,
        districts: updatedDistricts,
        thanas: updatedThanas,
      };
    });
    toast.success(`${normalizedDiv} division added!`);
  };

  const handleAddEntireDistrict = () => {
    if (!selectedDistrict) return toast.error("Select a district first");
    // ✅ FIX: District UPPERCASE করে save
    const normalizedDist = selectedDistrict.trim().toUpperCase();
    setFormData((prev) => {
      const updatedDistricts = prev.districts.includes(normalizedDist)
        ? prev.districts
        : [...prev.districts, normalizedDist];
      // District add করলে তার under-এর thanas সরিয়ে দাও
      const thanasUnderDist = bd
        .thanasOf(selectedDistrict, "en")
        .map((t) => t.toLowerCase());
      const updatedThanas = prev.thanas.filter(
        (t) => !thanasUnderDist.includes(t),
      );
      return { ...prev, districts: updatedDistricts, thanas: updatedThanas };
    });
    toast.success(`${normalizedDist} district added!`);
  };

  const handleThanaCheck = (thanaEn) => {
    setSelectedThanas((prev) =>
      prev.includes(thanaEn)
        ? prev.filter((t) => t !== thanaEn)
        : [...prev, thanaEn],
    );
  };

  const handleSelectAllThanas = (e) => {
    if (e.target.checked) {
      setSelectedThanas(thanas.map((t) => t.en));
    } else {
      setSelectedThanas([]);
    }
  };

  const handleAddSelectedThanas = () => {
    if (selectedThanas.length === 0)
      return toast.error("Please select at least one thana");
    setFormData((prev) => {
      let newThanas = [...prev.thanas];
      selectedThanas.forEach((thanaEn) => {
        // ✅ FIX: Thana lowercase করে save
        const cityVal = thanaEn.toLowerCase().trim();
        if (!newThanas.includes(cityVal)) newThanas.push(cityVal);
      });
      return { ...prev, thanas: newThanas };
    });
    setSelectedThanas([]);
    toast.success("Thanas added successfully");
  };

  const handleSelectAllArray = (field, items, isChecked) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        [field]: items.map((i) => i._id.toString()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleArrayIdChange = (field, id) => {
    const strId = id.toString();
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(strId)) {
        return { ...prev, [field]: arr.filter((item) => item !== strId) };
      } else {
        return { ...prev, [field]: [...arr, strId] };
      }
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (
      !formData.zoneName ||
      (formData.divisions.length === 0 &&
        formData.districts.length === 0 &&
        formData.thanas.length === 0)
    ) {
      return toast.error("Zone name and at least one area are required");
    }

    // ✅ FIX: Conflict check — submit আগে warn করো
    if (categoryConflicts.length > 0 || productConflicts.length > 0) {
      return toast.error(
        "Some items are in both Applicable and Excluded lists. Please fix conflicts before saving.",
      );
    }

    const payload = {
      ...formData,
      baseCost: Number(formData.baseCost),
      baseWeightKg: Number(formData.baseWeightKg),
      extraWeightCostPerKg: Number(formData.extraWeightCostPerKg),
      freeShippingMinOrder: formData.freeShippingMinOrder
        ? Number(formData.freeShippingMinOrder)
        : null,
    };

    try {
      if (editingId) {
        await updateZone({ zoneId: editingId, data: payload }).unwrap();
        toast.success("Zone updated");
      } else {
        await createZone(payload).unwrap();
        toast.success("Zone created");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error || "Something went wrong");
    }
  };

  const submitBtnLoading = isCreating || isUpdating;
  const areAllThanasSelected =
    thanas.length > 0 && selectedThanas.length === thanas.length;
  const hasConflicts =
    categoryConflicts.length > 0 || productConflicts.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaTruck size={28} />
          <div>
            <h1 className="text-2xl font-bold">Manage Shipping Zones</h1>
            <p className="text-sm text-indigo-200">
              Configure rates, weight logic, and restrictions
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition flex items-center gap-2 shadow-md"
        >
          <FaPlus /> Create Zone
        </button>
      </div>

      {/* Zones List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : zones?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No zones found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4 font-semibold">Zone Name</th>
                  <th className="p-4 font-semibold">Coverage</th>
                  <th className="p-4 font-semibold">Cost</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones?.map((zone) => (
                  <tr
                    key={zone._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="p-4 font-bold text-gray-900">
                      {zone.zoneName}{" "}
                      <span className="font-normal text-xs text-gray-500 block">
                        {zone.estimatedDays}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {zone.divisions?.map((div) => (
                          <span
                            key={div}
                            className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase"
                          >
                            {div}
                          </span>
                        ))}
                        {zone.districts?.map((dist) => (
                          <span
                            key={dist}
                            className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs uppercase"
                          >
                            {dist}
                          </span>
                        ))}
                        {zone.thanas?.slice(0, 3).map((thana) => (
                          <span
                            key={thana}
                            className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs capitalize"
                          >
                            {thana}
                          </span>
                        ))}
                        {zone.thanas?.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            +{zone.thanas.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      <p>
                        Base: ৳{zone.baseCost} ({zone.baseWeightKg}kg)
                      </p>
                      <p>Extra: ৳{zone.extraWeightCostPerKg}/kg</p>
                      {zone.freeShippingMinOrder && (
                        <p className="text-green-600 text-xs">
                          Free &gt;৳{zone.freeShippingMinOrder}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(zone)}
                        className={`text-2xl ${zone.isActive ? "text-green-500" : "text-gray-300"}`}
                      >
                        {zone.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone._id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Update Zone" : "Create New Zone"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={submitHandler} className="p-6 space-y-6">
              {/* Section 1: Coverage Info */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">
                  Zone & Coverage Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Zone Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zoneName"
                      value={formData.zoneName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Estimated Days
                    </label>
                    <input
                      type="text"
                      name="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Select Coverage Area <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        বিভাগ / Division
                      </label>
                      <select
                        value={selectedDivision}
                        onChange={handleDivisionChange}
                        className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg outline-none text-sm"
                      >
                        <option value="">নির্বাচন করুন</option>
                        {divisionsEn.map((div, i) => (
                          <option key={div} value={div}>
                            {divisionsBn[i]} ({div})
                          </option>
                        ))}
                      </select>
                      {selectedDivision && (
                        <button
                          type="button"
                          onClick={handleAddEntireDivision}
                          className="mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded w-full hover:bg-indigo-200 transition font-semibold"
                        >
                          + Add Entire Division ({normalizeDivision(selectedDivision)})
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        জেলা / District
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        className="w-full border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg outline-none text-sm"
                        disabled={!selectedDivision}
                      >
                        <option value="">নির্বাচন করুন</option>
                        {districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      {selectedDistrict && (
                        <button
                          type="button"
                          onClick={handleAddEntireDistrict}
                          className="mt-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded w-full hover:bg-indigo-200 transition font-semibold"
                        >
                          + Add Entire District ({selectedDistrict.toUpperCase()})
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedDistrict && thanas.length > 0 && (
                    <div className="border border-dashed border-indigo-200 rounded-lg p-3 bg-indigo-50/30">
                      <div className="flex justify-between items-center mb-2 border-b border-indigo-100 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            onChange={handleSelectAllThanas}
                            checked={areAllThanasSelected}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-xs font-bold text-indigo-800">
                            Select All Thanas
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddSelectedThanas}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1"
                        >
                          <FaPlus size={8} /> Add Selected (
                          {selectedThanas.length})
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        {thanas.map((thana) => (
                          <label
                            key={thana.en}
                            className="flex items-center gap-1.5 cursor-pointer bg-white p-1.5 rounded border border-gray-100 hover:border-indigo-300 transition text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={selectedThanas.includes(thana.en)}
                              onChange={() => handleThanaCheck(thana.en)}
                              className="w-3 h-3 text-indigo-600 rounded"
                            />
                            <span className="text-gray-700 truncate">
                              {thana.bn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Added Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.divisions.map((div) => (
                    <span
                      key={div}
                      className="bg-purple-200 text-purple-900 px-2 py-1 rounded-md text-xs flex items-center gap-1 font-bold uppercase border border-purple-300"
                    >
                      <FaMapMarkerAlt size={8} /> {div} (Entire Division)
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            divisions: prev.divisions.filter((d) => d !== div),
                          }))
                        }
                        className="text-purple-600 hover:text-red-600 ml-1"
                      >
                        <FaTimes size={9} />
                      </button>
                    </span>
                  ))}
                  {formData.districts.map((dist) => (
                    <span
                      key={dist}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs flex items-center gap-1 font-bold uppercase"
                    >
                      <FaMapMarkerAlt size={8} /> {dist} (Entire District)
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            districts: prev.districts.filter((d) => d !== dist),
                          }))
                        }
                        className="text-blue-500 hover:text-red-500 ml-1"
                      >
                        <FaTimes size={9} />
                      </button>
                    </span>
                  ))}
                  {formData.thanas.map((thana) => (
                    <span
                      key={thana}
                      className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 capitalize font-medium"
                    >
                      <FaMapMarkerAlt size={8} /> {thana}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            thanas: prev.thanas.filter((t) => t !== thana),
                          }))
                        }
                        className="text-indigo-500 hover:text-red-500 ml-1"
                      >
                        <FaTimes size={9} />
                      </button>
                    </span>
                  ))}
                  {formData.divisions.length === 0 &&
                    formData.districts.length === 0 &&
                    formData.thanas.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        No areas added yet
                      </p>
                    )}
                </div>
              </div>

              {/* Section 2: Cost & Weight Logic */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">
                  Cost & Weight Logic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Base Cost (৳)
                    </label>
                    <input
                      type="number"
                      name="baseCost"
                      value={formData.baseCost}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Base Weight (Kg)
                    </label>
                    <input
                      type="number"
                      name="baseWeightKg"
                      value={formData.baseWeightKg}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg outline-none"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Extra Cost/Kg (৳)
                    </label>
                    <input
                      type="number"
                      name="extraWeightCostPerKg"
                      value={formData.extraWeightCostPerKg}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">
                      Free Shipping Min Order (৳)
                    </label>
                    <input
                      type="number"
                      name="freeShippingMinOrder"
                      value={formData.freeShippingMinOrder}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 bg-white px-3 py-2.5 rounded-lg outline-none"
                      min="0"
                      placeholder="Leave empty for none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Restrictions */}
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <h3 className="font-semibold text-gray-700 mb-1 border-b pb-2">
                  Restrictions (Optional)
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  If left empty, rules apply to all products/categories.
                </p>

                {/* ✅ FIX: Conflict Warning Banner */}
                {hasConflicts && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                    <div>
                      <p className="text-xs font-bold text-red-700">Conflict Detected!</p>
                      <p className="text-xs text-red-600">
                        {categoryConflicts.length > 0 && `${categoryConflicts.length} category(s) `}
                        {productConflicts.length > 0 && `${productConflicts.length} product(s) `}
                        are in both Applicable and Excluded lists. This will cause incorrect shipping calculation. Please remove them from one list.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applicable Categories */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Applicable Categories
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "applicableCategories",
                            categories,
                            formData.applicableCategories.length !==
                              categories.length,
                          )
                        }
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        {formData.applicableCategories.length ===
                        categories.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {categories.length === 0 ? (
                        <p className="text-xs text-gray-400 p-1">No categories</p>
                      ) : (
                        categories.map((cat) => {
                          const isConflict = categoryConflicts.includes(cat._id.toString());
                          return (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.applicableCategories.includes(
                                  cat._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange("applicableCategories", cat._id)
                                }
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                              <span className={`text-sm ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>
                                {cat.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Excluded Categories */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Excluded Categories
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "excludedCategories",
                            categories,
                            formData.excludedCategories.length !==
                              categories.length,
                          )
                        }
                        className="text-[10px] text-red-600 font-bold hover:underline"
                      >
                        {formData.excludedCategories.length === categories.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {categories.length === 0 ? (
                        <p className="text-xs text-gray-400 p-1">No categories</p>
                      ) : (
                        categories.map((cat) => {
                          const isConflict = categoryConflicts.includes(cat._id.toString());
                          return (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.excludedCategories.includes(
                                  cat._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange("excludedCategories", cat._id)
                                }
                                className="w-4 h-4 text-red-600 rounded"
                              />
                              <span className={`text-sm ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>
                                {cat.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Applicable Products */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Applicable Products
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "applicableProducts",
                            products,
                            formData.applicableProducts.length !== products.length,
                          )
                        }
                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                      >
                        {formData.applicableProducts.length === products.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg mb-1 text-sm outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {products.length === 0 ? (
                        <p className="text-xs text-gray-400 p-1">No products found</p>
                      ) : (
                        products.map((prod) => {
                          const isConflict = productConflicts.includes(prod._id.toString());
                          return (
                            <label
                              key={prod._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.applicableProducts.includes(
                                  prod._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange("applicableProducts", prod._id)
                                }
                                className="w-4 h-4 text-indigo-600 rounded"
                              />
                              <span className={`text-sm truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>
                                {prod.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Excluded Products */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Excluded Products
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "excludedProducts",
                            products,
                            formData.excludedProducts.length !== products.length,
                          )
                        }
                        className="text-[10px] text-red-600 font-bold hover:underline"
                      >
                        {formData.excludedProducts.length === products.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full border border-gray-200 bg-white px-3 py-2 rounded-lg mb-1 text-sm outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto border bg-white rounded-lg p-2 space-y-1">
                      {products.length === 0 ? (
                        <p className="text-xs text-gray-400 p-1">No products found</p>
                      ) : (
                        products.map((prod) => {
                          const isConflict = productConflicts.includes(prod._id.toString());
                          return (
                            <label
                              key={prod._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.excludedProducts.includes(
                                  prod._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange("excludedProducts", prod._id)
                                }
                                className="w-4 h-4 text-red-600 rounded"
                              />
                              <span className={`text-sm truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}>
                                {prod.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitBtnLoading || hasConflicts}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition flex justify-center items-center gap-2 shadow-md"
                >
                  {submitBtnLoading
                    ? "Processing..."
                    : hasConflicts
                      ? "Fix Conflicts to Save"
                      : editingId
                        ? "Update Zone"
                        : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManage;