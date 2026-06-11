import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCartItems } from "../../redux/features/cart/cartSlice"; // ✅ আপনার কার্ট Slice এর পাথ অনুযায়ী ইম্পোর্ট করুন
import { FaCheckCircle } from "react-icons/fa";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tranId = searchParams.get("tran_id");

  // ✅ পেজে ঢোকার সাথে সাথে কার্ট ক্লিয়ার করে দিচ্ছি
  useEffect(() => {
    dispatch(clearCartItems());
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("pendingOrderData");
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center max-w-md w-full">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-mono font-black text-black uppercase mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-500 font-mono text-sm mb-6">
          Your transaction has been processed successfully.
        </p>
        
        {tranId && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Transaction ID</p>
            <p className="text-sm font-mono font-bold text-black mt-1">{tranId}</p>
          </div>
        )}

        <p className="text-gray-400 font-mono text-xs mb-8">
          Your order status will be updated shortly.
        </p>
        
        <button
          onClick={() => navigate(`/order/${tranId}`)}
          className="w-full bg-black text-white font-mono font-bold text-xs uppercase tracking-widest py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          View Order Details
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 border border-gray-300 text-gray-600 font-mono font-bold text-xs uppercase tracking-widest py-3 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;