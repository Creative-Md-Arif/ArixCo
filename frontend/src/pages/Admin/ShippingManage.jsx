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
import AdminMenu from "./AdminMenu";
import bd from "@bd-geo-data/bd-location-data";

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

// Custom Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="flex items-center justify-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
    </div>
    <p className="text-[10px] font-black tracking-[0.5em] uppercase text-gray-400 animate-pulse">
      Loading Zones...
    </p>
  </div>
);

const ShippingManage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productSearch, setProductSearch] = useState("");

  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [selectedThanas, setSelectedThanas] = useState([]);

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
  const hasConflicts =
    categoryConflicts.length > 0 || productConflicts.length > 0;

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
    const normalizedDiv = normalizeDivision(selectedDivision);
    setFormData((prev) => {
      const updatedDivisions = prev.divisions.includes(normalizedDiv)
        ? prev.divisions
        : [...prev.divisions, normalizedDiv];
      const distsUnderDiv = bd
        .districtsOf(selectedDivision, "en")
        .map((d) => d.toUpperCase());
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
    const normalizedDist = selectedDistrict.trim().toUpperCase();
    setFormData((prev) => {
      const updatedDistricts = prev.districts.includes(normalizedDist)
        ? prev.districts
        : [...prev.districts, normalizedDist];
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
    )
      return toast.error("Zone name and at least one area are required");
    if (hasConflicts)
      return toast.error(
        "Some items are in both Applicable and Excluded lists. Please fix conflicts before saving.",
      );
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

  const inputClass =
    "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const selectClass = `${inputClass} cursor-pointer`;
  const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1500px] mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-l-4 border-black pl-4 sm:pl-6 py-2 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                  Shipping / <span className="text-red-600">Zones</span>
                </h1>
                <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                  Configure rates, weight logic, and restrictions
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
              >
                <FaPlus size={10} /> Create Zone
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : zones?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs border border-dashed border-gray-200 rounded-sm">
                No zones found. Create one!
              </div>
            ) : (
              <>
                {/* ============================================ */}
                {/* MOBILE VIEW: Card Layout (Visible < md) */}
                {/* ============================================ */}
                <div className="md:hidden space-y-4">
                  {zones?.map((zone) => (
                    <div
                      key={zone._id}
                      className="border border-gray-200 p-4 rounded-sm bg-white hover:border-black transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-black text-black uppercase tracking-wider text-sm">
                            {zone.zoneName}
                          </h3>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                            {zone.estimatedDays}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggle(zone)}
                          className={`text-xl ${zone.isActive ? "text-black" : "text-gray-300"}`}
                        >
                          {zone.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3 border-t border-b border-gray-100 py-2">
                        {zone.divisions?.map((div) => (
                          <span
                            key={div}
                            className="bg-gray-100 border border-gray-200 text-black px-1.5 py-0.5 text-[8px] font-bold uppercase"
                          >
                            {div}
                          </span>
                        ))}
                        {zone.districts?.map((dist) => (
                          <span
                            key={dist}
                            className="bg-gray-50 border border-gray-200 text-gray-700 px-1.5 py-0.5 text-[8px] uppercase"
                          >
                            {dist}
                          </span>
                        ))}
                        {zone.thanas?.slice(0, 3).map((thana) => (
                          <span
                            key={thana}
                            className="bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 text-[8px] capitalize"
                          >
                            {thana}
                          </span>
                        ))}
                        {zone.thanas?.length > 3 && (
                          <span className="text-[8px] text-gray-400 font-bold">
                            +{zone.thanas.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
                        <div>
                          <span className="text-gray-400 block">Base Cost</span>
                          <span className="font-black text-black">
                            ৳{zone.baseCost} ({zone.baseWeightKg}kg)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Extra/Kg</span>
                          <span className="font-black text-black">
                            ৳{zone.extraWeightCostPerKg}
                          </span>
                        </div>
                        {zone.freeShippingMinOrder && (
                          <div className="col-span-2">
                            <span className="text-green-600 font-bold">
                              Free Shipping over ৳{zone.freeShippingMinOrder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="flex-1 py-1.5 border border-gray-200 text-gray-600 hover:border-black hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                        >
                          <FaEdit size={9} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(zone._id)}
                          className="flex-1 py-1.5 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
                        >
                          <FaTrash size={9} /> Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ============================================ */}
                {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
                {/* ============================================ */}
                <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Zone Name
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Coverage
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Cost
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Status
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {zones?.map((zone) => (
                        <tr
                          key={zone._id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="font-black text-black uppercase tracking-wider text-xs">
                              {zone.zoneName}
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                              {zone.estimatedDays}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {zone.divisions?.map((div) => (
                                <span
                                  key={div}
                                  className="bg-gray-100 border border-gray-200 text-black px-1.5 py-0.5 text-[8px] font-bold uppercase"
                                >
                                  {div}
                                </span>
                              ))}
                              {zone.districts?.map((dist) => (
                                <span
                                  key={dist}
                                  className="bg-white border border-gray-200 text-gray-700 px-1.5 py-0.5 text-[8px] uppercase"
                                >
                                  {dist}
                                </span>
                              ))}
                              {zone.thanas?.slice(0, 3).map((thana) => (
                                <span
                                  key={thana}
                                  className="bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 text-[8px] capitalize"
                                >
                                  {thana}
                                </span>
                              ))}
                              {zone.thanas?.length > 3 && (
                                <span className="text-[8px] text-gray-400 font-bold">
                                  +{zone.thanas.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-[11px] text-gray-700 space-y-1">
                            <p className="font-bold text-black">
                              Base: ৳{zone.baseCost} ({zone.baseWeightKg}kg)
                            </p>
                            <p>Extra: ৳{zone.extraWeightCostPerKg}/kg</p>
                            {zone.freeShippingMinOrder && (
                              <p className="text-green-600 font-bold text-[9px] uppercase">
                                Free &gt;৳{zone.freeShippingMinOrder}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggle(zone)}
                              className={`text-xl ${zone.isActive ? "text-black" : "text-gray-300"}`}
                            >
                              {zone.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(zone)}
                                className="text-gray-400 hover:text-black transition-colors"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(zone._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-10 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-sm w-full max-w-3xl mb-10">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                {editingId ? "Update Zone" : "Create New Zone"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={submitHandler} className="p-5 space-y-6">
              {/* Section 1: Coverage Info */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                  Zone & Coverage Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Zone Name *</label>
                    <input
                      type="text"
                      name="zoneName"
                      value={formData.zoneName}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Days</label>
                    <input
                      type="text"
                      name="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 p-3 border border-gray-200 rounded-sm">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
                    Select Coverage Area *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">
                        বিভাগ / Division
                      </label>
                      <select
                        value={selectedDivision}
                        onChange={handleDivisionChange}
                        className={selectClass}
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
                          className="mt-1 text-[9px] bg-black text-white px-2 py-1 rounded-sm w-full hover:bg-red-600 transition-all font-bold uppercase"
                        >
                          + Add Entire Division (
                          {normalizeDivision(selectedDivision)})
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-gray-400 uppercase block mb-1">
                        জেলা / District
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        className={selectClass}
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
                          className="mt-1 text-[9px] bg-black text-white px-2 py-1 rounded-sm w-full hover:bg-red-600 transition-all font-bold uppercase"
                        >
                          + Add Entire District (
                          {selectedDistrict.toUpperCase()})
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedDistrict && thanas.length > 0 && (
                    <div className="border border-dashed border-gray-300 rounded-sm p-3 bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            onChange={handleSelectAllThanas}
                            checked={areAllThanasSelected}
                            className="accent-black w-3 h-3"
                          />
                          <span className="text-[9px] font-bold text-gray-700 uppercase">
                            Select All Thanas
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddSelectedThanas}
                          className="bg-black text-white px-3 py-1 rounded-sm text-[9px] font-bold hover:bg-red-600 transition-all flex items-center gap-1"
                        >
                          <FaPlus size={8} /> Add Selected (
                          {selectedThanas.length})
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        {thanas.map((thana) => (
                          <label
                            key={thana.en}
                            className="flex items-center gap-1.5 cursor-pointer bg-gray-50 p-1.5 rounded-sm border border-gray-200 hover:border-black transition-all text-[10px]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedThanas.includes(thana.en)}
                              onChange={() => handleThanaCheck(thana.en)}
                              className="accent-black w-3 h-3"
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
                      className="bg-black text-white px-2 py-1 rounded-sm text-[8px] flex items-center gap-1 font-bold uppercase"
                    >
                      <FaMapMarkerAlt size={7} /> {div} (Div)
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            divisions: prev.divisions.filter((d) => d !== div),
                          }))
                        }
                        className="text-white hover:text-red-400 ml-1"
                      >
                        <FaTimes size={8} />
                      </button>
                    </span>
                  ))}
                  {formData.districts.map((dist) => (
                    <span
                      key={dist}
                      className="bg-gray-800 text-white px-2 py-1 rounded-sm text-[8px] flex items-center gap-1 font-bold uppercase"
                    >
                      <FaMapMarkerAlt size={7} /> {dist} (Dist)
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            districts: prev.districts.filter((d) => d !== dist),
                          }))
                        }
                        className="text-white hover:text-red-400 ml-1"
                      >
                        <FaTimes size={8} />
                      </button>
                    </span>
                  ))}
                  {formData.thanas.map((thana) => (
                    <span
                      key={thana}
                      className="bg-gray-100 border border-gray-200 text-black px-2 py-1 rounded-sm text-[8px] flex items-center gap-1 capitalize font-bold"
                    >
                      <FaMapMarkerAlt size={7} /> {thana}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            thanas: prev.thanas.filter((t) => t !== thana),
                          }))
                        }
                        className="text-gray-500 hover:text-red-600 ml-1"
                      >
                        <FaTimes size={8} />
                      </button>
                    </span>
                  ))}
                  {formData.divisions.length === 0 &&
                    formData.districts.length === 0 &&
                    formData.thanas.length === 0 && (
                      <p className="text-[9px] text-gray-400 italic uppercase">
                        No areas added yet
                      </p>
                    )}
                </div>
              </div>

              {/* Section 2: Cost & Weight Logic */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                  Cost & Weight Logic
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Base Cost (৳)</label>
                    <input
                      type="number"
                      name="baseCost"
                      value={formData.baseCost}
                      onChange={handleInputChange}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Base Weight (Kg)</label>
                    <input
                      type="number"
                      name="baseWeightKg"
                      value={formData.baseWeightKg}
                      onChange={handleInputChange}
                      className={inputClass}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Extra Cost/Kg (৳)</label>
                    <input
                      type="number"
                      name="extraWeightCostPerKg"
                      value={formData.extraWeightCostPerKg}
                      onChange={handleInputChange}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Free Ship Min Order (৳)
                    </label>
                    <input
                      type="number"
                      name="freeShippingMinOrder"
                      value={formData.freeShippingMinOrder}
                      onChange={handleInputChange}
                      className={inputClass}
                      min="0"
                      placeholder="None"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Restrictions */}
              <div className="border border-gray-200 rounded-sm p-4">
                <h3 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2">
                  Restrictions (Optional)
                </h3>
                <p className="text-[8px] text-gray-400 mb-3 uppercase">
                  If left empty, rules apply to all products/categories.
                </p>

                {hasConflicts && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2">
                    <FaExclamationTriangle
                      className="text-red-500 mt-0.5 flex-shrink-0"
                      size={12}
                    />
                    <div>
                      <p className="text-[9px] font-bold text-red-700 uppercase">
                        Conflict Detected!
                      </p>
                      <p className="text-[9px] text-red-600">
                        Items are in both Applicable and Excluded lists. Fix
                        before saving.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>
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
                        className="text-[8px] text-black font-bold hover:underline uppercase"
                      >
                        {formData.applicableCategories.length ===
                        categories.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? (
                        <p className="text-[9px] text-gray-400 p-1">
                          No categories
                        </p>
                      ) : (
                        categories.map((cat) => {
                          const isConflict = categoryConflicts.includes(
                            cat._id.toString(),
                          );
                          return (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-[11px] ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.applicableCategories.includes(
                                  cat._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange(
                                    "applicableCategories",
                                    cat._id,
                                  )
                                }
                                className="accent-black w-3 h-3"
                              />
                              <span
                                className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}
                              >
                                {cat.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>Excluded Categories</label>
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
                        className="text-[8px] text-red-600 font-bold hover:underline uppercase"
                      >
                        {formData.excludedCategories.length ===
                        categories.length
                          ? "Unmark All"
                          : "Mark All"}
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {categories.length === 0 ? (
                        <p className="text-[9px] text-gray-400 p-1">
                          No categories
                        </p>
                      ) : (
                        categories.map((cat) => {
                          const isConflict = categoryConflicts.includes(
                            cat._id.toString(),
                          );
                          return (
                            <label
                              key={cat._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-[11px] ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.excludedCategories.includes(
                                  cat._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange(
                                    "excludedCategories",
                                    cat._id,
                                  )
                                }
                                className="accent-red-600 w-3 h-3"
                              />
                              <span
                                className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}
                              >
                                {cat.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>Applicable Products</label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "applicableProducts",
                            products,
                            formData.applicableProducts.length !==
                              products.length,
                          )
                        }
                        className="text-[8px] text-black font-bold hover:underline uppercase"
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
                      className={`${inputClass} mb-1 text-[11px]`}
                    />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? (
                        <p className="text-[9px] text-gray-400 p-1">
                          No products found
                        </p>
                      ) : (
                        products.map((prod) => {
                          const isConflict = productConflicts.includes(
                            prod._id.toString(),
                          );
                          return (
                            <label
                              key={prod._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-[11px] ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.applicableProducts.includes(
                                  prod._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange(
                                    "applicableProducts",
                                    prod._id,
                                  )
                                }
                                className="accent-black w-3 h-3"
                              />
                              <span
                                className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}
                              >
                                {prod.name} {isConflict && "⚠"}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>Excluded Products</label>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAllArray(
                            "excludedProducts",
                            products,
                            formData.excludedProducts.length !==
                              products.length,
                          )
                        }
                        className="text-[8px] text-red-600 font-bold hover:underline uppercase"
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
                      className={`${inputClass} mb-1 text-[11px]`}
                    />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-sm p-2 space-y-1 bg-white">
                      {products.length === 0 ? (
                        <p className="text-[9px] text-gray-400 p-1">
                          No products found
                        </p>
                      ) : (
                        products.map((prod) => {
                          const isConflict = productConflicts.includes(
                            prod._id.toString(),
                          );
                          return (
                            <label
                              key={prod._id}
                              className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-sm text-[11px] ${isConflict ? "bg-red-50 border border-red-200" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.excludedProducts.includes(
                                  prod._id.toString(),
                                )}
                                onChange={() =>
                                  handleArrayIdChange(
                                    "excludedProducts",
                                    prod._id,
                                  )
                                }
                                className="accent-red-600 w-3 h-3"
                              />
                              <span
                                className={`truncate ${isConflict ? "text-red-700 font-bold" : "text-gray-700"}`}
                              >
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

              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-xs font-bold text-gray-700 uppercase">
                    Active
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitBtnLoading || hasConflicts}
                  className="w-full bg-black text-white py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
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
