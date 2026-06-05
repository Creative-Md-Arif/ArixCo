import { NavLink } from "react-router-dom";
import { BsBagCheck, BsPersonCircle } from "react-icons/bs";
import { motion } from "framer-motion";

const Sidebar = () => {
  return (
    // ✅ Removed initial and animate props to prevent jumping on tab change
    <aside className="hidden lg:block w-80 h-fit bg-white border border-gray-200 rounded-2xl p-8">
      {/* Sidebar Header */}
      <div className="mb-10 px-4">
        <h2 className="font-mono font-black text-xs uppercase tracking-[0.3em] text-gray-500">
          User <span className="text-blue-600">Portal</span>
        </h2>
      </div>

      <nav className="space-y-3">
        {/* Profile Link */}
        <NavLink to="/profile">
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-4 py-4 px-6 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group ${
                isActive 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-600"
              }`}
            >
              <BsPersonCircle className={`text-lg transition-transform duration-500 ${isActive ? "text-blue-400 scale-110" : "group-hover:text-blue-600"}`} />
              <span className="font-mono text-sm font-black uppercase tracking-wider">
                My Profile
              </span>
            </motion.div>
          )}
        </NavLink>

        {/* Orders List Link */}
        <NavLink to="/user-orders">
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-4 py-4 px-6 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group ${
                isActive 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-600"
              }`}
            >
              <BsBagCheck className={`text-lg transition-transform duration-500 ${isActive ? "text-blue-400 scale-110" : "group-hover:text-blue-600"}`} />
              <span className="font-mono text-sm font-black uppercase tracking-wider">
                Order History
              </span>
            </motion.div>
          )}
        </NavLink>

        {/* Dynamic Help Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-xs font-mono font-black text-blue-600 uppercase tracking-wider">
              Support
            </p>
            <p className="text-sm text-gray-600 font-mono mt-2 leading-relaxed">
              Facing issues? Our tech team is online.
            </p>
          </div>
          {/* Background Decorative Circle */}
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-100/50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />
        </motion.div>
      </nav>
    </aside>
  );
};

export default Sidebar;