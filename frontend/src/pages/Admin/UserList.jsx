/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
  FaCheck,
  FaSearch,
  FaTimesCircle,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const UserList = () => {
  const { data, refetch } = useGetUsersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editableUserId, setEditableUserId] = useState(null);

  const [editableUser, setEditableUser] = useState({
    username: "",
    email: "",
    isAdmin: false,
    isVerified: false,
  });

  const [filters, setFilters] = useState({ role: "all", status: "all" });

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const usersList = Array.isArray(data) ? data : data?.users || [];

  const sortedUsers = [...usersList].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filters.role === "all" ||
      (filters.role === "admin" && user.isAdmin) ||
      (filters.role === "user" && !user.isAdmin);
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "verified" && user.isVerified) ||
      (filters.status === "unverified" && !user.isVerified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === currentUsers.length
        ? []
        : currentUsers.map((u) => u._id),
    );
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} users?`,
      )
    ) {
      try {
        for (const id of selectedUsers) {
          await deleteUser(id).unwrap();
        }
        refetch();
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} users deleted successfully`);
      } catch (err) {
        toast.error(err?.data?.message || "Error deleting users");
      }
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        refetch();
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error(err?.data?.message || "Delete failed");
      }
    }
  };

  const startEdit = (user) => {
    setEditableUserId(user._id);
    setEditableUser({
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableUser({
      username: "",
      email: "",
      isAdmin: false,
      isVerified: false,
    });
  };

  const saveEdit = async () => {
    try {
      await updateUser({ userId: editableUserId, ...editableUser }).unwrap();
      refetch();
      cancelEdit();
      toast.success("User updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  // Reusable Input Style
  const inputClass =
    "w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all bg-white";
  const labelClass =
    "text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="min-h-screen bg-[#fdfdfd] font-mono pt-10 pb-16 transition-all duration-500">
      <div className="flex flex-col 2xl:flex-row">
        <AdminMenu />
        <div className="flex-1 px-4 sm:px-6 lg:px-12">
          <div className="max-w-[1500px] mx-auto">
            {/* Header Section */}
            <div className="mb-8 border-l-4 border-black pl-4 sm:pl-6 py-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tighter uppercase">
                User / <span className="text-red-600">Management</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1">
                Total Entities: {filteredUsers.length}
              </p>
            </div>

            {/* Controls Bar */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-sm bg-white">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input
                  type="text"
                  placeholder="SEARCH BY NAME OR EMAIL..."
                  className={`${inputClass} pl-9 uppercase tracking-wider text-xs`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <select
                  className={`${inputClass} text-[10px] font-bold uppercase tracking-widest cursor-pointer w-full md:w-auto`}
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">ALL STATUS</option>
                  <option value="verified">VERIFIED</option>
                  <option value="unverified">UNVERIFIED</option>
                </select>

                <select
                  className={`${inputClass} text-[10px] font-bold uppercase tracking-widest cursor-pointer w-full md:w-auto`}
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                >
                  <option value="all">ALL ROLES</option>
                  <option value="admin">ADMINS</option>
                  <option value="user">USERS</option>
                </select>

                {selectedUsers.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-black text-white hover:bg-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-sm w-full md:w-auto justify-center"
                  >
                    <FaTrash size={10} /> DELETE [{selectedUsers.length}]
                  </button>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* MOBILE VIEW: Card Layout (Visible < md) */}
            {/* ============================================ */}
            <div className="md:hidden space-y-4">
              {currentUsers.map((user) => (
                <div
                  key={user._id}
                  className={`border ${editableUserId === user._id ? "border-black" : "border-gray-200"} p-4 rounded-sm bg-white transition-colors`}
                >
                  {/* Top Section: Checkbox + Name/Role */}
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleSelectUser(user._id)}
                      className="accent-black w-4 h-4 mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      {editableUserId === user._id ? (
                        <input
                          value={editableUser.username}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              username: e.target.value,
                            })
                          }
                          className={`${inputClass} font-bold uppercase`}
                        />
                      ) : (
                        <h3 className="text-sm font-black text-black uppercase tracking-tight truncate">
                          {user.username}
                        </h3>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase rounded-sm border ${
                            user.isAdmin
                              ? "bg-black text-white border-black"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {user.isAdmin ? "ADMIN" : "USER"}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-[9px] font-bold uppercase ${user.isVerified ? "text-green-600" : "text-yellow-600"}`}
                        >
                          {user.isVerified ? (
                            <FaCheckCircle size={9} />
                          ) : (
                            <FaTimesCircle size={9} />
                          )}
                          <span>
                            {user.isVerified ? "VERIFIED" : "PENDING"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Email & Date */}
                  <div className="pl-7 mb-3 text-xs text-gray-500 space-y-1 border-b border-gray-100 pb-3">
                    {editableUserId === user._id ? (
                      <input
                        value={editableUser.email}
                        onChange={(e) =>
                          setEditableUser({
                            ...editableUser,
                            email: e.target.value,
                          })
                        }
                        className={`${inputClass} text-xs`}
                      />
                    ) : (
                      <p className="truncate">{user.email}</p>
                    )}
                    <p className="text-[10px] font-bold text-gray-400">
                      JOINED: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Edit Mode Checkboxes */}
                  {editableUserId === user._id && (
                    <div className="pl-7 flex gap-4 mb-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editableUser.isAdmin}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              isAdmin: e.target.checked,
                            })
                          }
                          className="accent-black"
                        />
                        <span className="text-[9px] font-bold uppercase">
                          Admin
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editableUser.isVerified}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              isVerified: e.target.checked,
                            })
                          }
                          className="accent-green-600"
                        />
                        <span className="text-[9px] font-bold uppercase">
                          Verified
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Bottom Section: Actions */}
                  <div className="pl-7 flex justify-end gap-2">
                    {editableUserId === user._id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-1"
                        >
                          <FaCheck size={9} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-1"
                        >
                          <FaTimes size={9} /> Cancel
                        </button>
                      </>
                    ) : (
                      !user.isAdmin && (
                        <>
                          <button
                            onClick={() => startEdit(user)}
                            className="p-2 text-gray-400 hover:text-black transition-colors"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            onClick={() => deleteHandler(user._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <FaTrash size={12} />
                          </button>
                        </>
                      )
                    )}
                  </div>
                </div>
              ))}

              {currentUsers.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-bold uppercase tracking-widest text-xs border border-dashed border-gray-200 rounded-sm">
                  NO USERS FOUND
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* DESKTOP VIEW: Table Layout (Visible >= md) */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-sm">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === currentUsers.length &&
                          currentUsers.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="accent-black w-4 h-4 cursor-pointer"
                      />
                    </th>
                    {[
                      { key: "username", label: "User" },
                      { key: "email", label: "Email" },
                      { key: "isAdmin", label: "Role" },
                      { key: "isVerified", label: "Status" },
                      { key: "createdAt", label: "Joined" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-pointer hover:text-black transition-colors"
                        onClick={() => requestSort(key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {label}
                          {sortConfig.key === key ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp className="text-black" />
                            ) : (
                              <FaSortDown className="text-black" />
                            )
                          ) : (
                            <FaSort className="text-gray-300" size={10} />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`group transition-colors ${selectedUsers.includes(user._id) ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                          className="accent-black w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <input
                            value={editableUser.username}
                            onChange={(e) =>
                              setEditableUser({
                                ...editableUser,
                                username: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        ) : (
                          <span className="text-sm font-bold text-black uppercase tracking-tight">
                            {user.username}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <input
                            value={editableUser.email}
                            onChange={(e) =>
                              setEditableUser({
                                ...editableUser,
                                email: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        ) : (
                          <span className="text-xs text-gray-500 tracking-tight">
                            {user.email}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editableUser.isAdmin}
                              onChange={(e) =>
                                setEditableUser({
                                  ...editableUser,
                                  isAdmin: e.target.checked,
                                })
                              }
                              className="accent-black"
                            />
                            <span className="text-[9px] font-bold uppercase">
                              Admin
                            </span>
                          </label>
                        ) : (
                          <span
                            className={`px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase rounded-sm border ${
                              user.isAdmin
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-400 border-gray-200"
                            }`}
                          >
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editableUserId === user._id ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editableUser.isVerified}
                              onChange={(e) =>
                                setEditableUser({
                                  ...editableUser,
                                  isVerified: e.target.checked,
                                })
                              }
                              className="accent-green-600"
                            />
                            <span className="text-[9px] font-bold uppercase">
                              Verified
                            </span>
                          </label>
                        ) : (
                          <div
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${user.isVerified ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {user.isVerified ? (
                              <FaCheckCircle />
                            ) : (
                              <FaTimesCircle />
                            )}
                            <span>
                              {user.isVerified ? "Verified" : "Pending"}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-[11px] font-bold text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                          {editableUserId === user._id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-sm transition-colors"
                                title="Save"
                              >
                                <FaCheck size={12} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                title="Cancel"
                              >
                                <FaTimes size={12} />
                              </button>
                            </>
                          ) : (
                            !user.isAdmin && (
                              <>
                                <button
                                  onClick={() => startEdit(user)}
                                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-sm transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit size={12} />
                                </button>
                                <button
                                  onClick={() => deleteHandler(user._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                      >
                        NO USERS FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            {totalPages > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>
                    Showing{" "}
                    <span className="text-black font-black">
                      {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredUsers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="text-red-600 font-black">
                      {filteredUsers.length}
                    </span>
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border border-gray-200 rounded-sm text-[10px] font-bold uppercase outline-none cursor-pointer text-black px-2 py-1 focus:ring-1 focus:ring-black"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size} Items
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                  >
                    <FaSortUp size={10} className="rotate-[-90deg]" />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 text-[11px] font-bold transition-all rounded-sm ${
                          currentPage === i + 1
                            ? "bg-black text-white"
                            : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 text-black hover:border-black disabled:opacity-20 disabled:hover:border-gray-200 disabled:cursor-not-allowed transition-all rounded-sm"
                  >
                    <FaSortUp size={10} className="rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
