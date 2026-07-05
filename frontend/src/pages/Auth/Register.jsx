import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "@redux/api/usersApiSlice";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ফিল্ড ভিত্তিক এরর স্টেট ম্যানেজমেন্ট
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    server: ""
  });

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // এরর রিসেট করা হচ্ছে
    let hasError = false;
    const newErrors = { username: "", email: "", password: "", confirmPassword: "", server: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Enter a valid email";
      hasError = true;
    }

    if (password.length < 8) {
      newErrors.password = "Password must be 8+ characters";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await register({ username, email, password }).unwrap();
      toast.success("Registration successful! Check email for OTP.");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      const errorMessage = err?.data?.message || err?.error || "Registration failed";
      setErrors((prev) => ({ ...prev, server: errorMessage }));
    }
  };

  return (
    <section
     className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] px-4 font-trebuchet"
      style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
    >
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>

      <div className="w-full min-w-[280px] max-w-[320px] sm:max-w-[420px] max-h-full overflow-y-auto animate-in fade-in zoom-in duration-500">
        {/* শ্যাডো সম্পূর্ণ রিমোভেড এবং বর্ডার ক্লিন রাখা হয়েছে */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-gray-500 text-[12px] font-normal">
                Join our community and start shopping
              </p>
            </div>

            <form onSubmit={submitHandler} className="space-y-3">
              {/* Name Input */}
              <div className="group">
                <label className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaUser size={12} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                    }}
                    placeholder="Username"
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${
                      errors.username
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="group">
                <label className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaEnvelope size={12} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="arixgear@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 bg-gray-50 border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaLock size={12} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-[12px] font-medium text-gray-600 mb-1 ml-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-[#007EFC] transition-colors">
                    <FaLock size={12} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-[#007EFC]"
                    } rounded-lg text-gray-700 text-[13px] focus:bg-white outline-none transition-all duration-200`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[12px] mt-1 ml-0.5 font-medium animate-in fade-in duration-200">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Server Response Error */}
              {errors.server && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-600 text-[12px] font-medium animate-in fade-in duration-200">
                  {errors.server}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-[#007EFC] text-white font-bold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-1 group"
              >
                <span className="absolute inset-0 bg-gradient-to-b from-[#006ee0] to-[#005cb8] translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none text-[14px]">
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </span>
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-[12px] font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#007EFC] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Helper Footer */}
        <p className="text-center text-gray-400 text-[11px] mt-3 px-2">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default Register;