import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, } from "react-redux";
import { useGetOrderDetailsQuery } from "@redux/api/orderApiSlice"; // ✅ আপনার RTK Query hook
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import Loader from "../../components/Loader"; // আপনার লোডার কম্পোনেন্ট

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tranId = searchParams.get("tran_id"); // এটি আমাদের Order ID


  const { data: order, isLoading, } = useGetOrderDetailsQuery(tranId, {
    skip: !tranId, 
    pollingInterval: 3000, 
  });




  useEffect(() => {
    dispatch(clearCartItems());
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("pendingOrderData");
  }, [dispatch]);

  // ✅ যদি পেমেন্ট Paid হয়ে যায়, তবে পলিং (বারবার রিকোয়েস্ট) বন্ধ করে দিচ্ছি
  useEffect(() => {
    if (order?.isPaid) {
      // পেমেন্ট সফল হয়ে গেছে, এখানে কিছু করার নেই, pollingInterface অটো বন্ধ হয়ে যাবে 
      // কারণ আমরা নিচে conditional rendering করেছি
    }
  }, [order]);

  if (!tranId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-red-500">Invalid Transaction!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center max-w-md w-full">
        
        {/* ✅ যদি এখনো লোড হচ্ছে বা পেমেন্ট Pending অবস্থায় থাকে */}
        {isLoading || !order?.isPaid ? (
          <>
            <FaHourglassHalf className="text-yellow-500 text-5xl mx-auto mb-4 animate-pulse" />
            <h1 className="text-xl font-mono font-black text-black uppercase mb-2">
              Verifying Payment...
            </h1>
            <p className="text-gray-500 font-mono text-sm mb-6">
              Please wait while we confirm your transaction with SSLCommerz.
            </p>
            <Loader /> {/* আপনার কাস্টম স্পিনার */}
          </>
        ) : (
          // ✅ পেমেন্ট সফল হলে এই অংশটি দেখাবে
          <>
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
                <p className="text-sm font-mono font-bold text-black mt-1">{order.orderId || tranId}</p>
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;