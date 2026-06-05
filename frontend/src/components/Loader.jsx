const Loader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div
          className="absolute inset-0 border-[1.5px] border-dashed border-gray-200 rounded-full"
          style={{ animation: "spin 14s linear infinite" }}
        />

        <div
          className="absolute inset-[10px] border-[1.5px] border-dashed border-yellow-600/50 rounded-full"
          style={{ animation: "spinRev 9s linear infinite" }}
        />

        <span className="z-10 text-4xl font-black font-mono tracking-tighter text-gray-900">
          A<span className="text-red-600">G</span>
        </span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spinRev { to { transform: rotate(-360deg); } }
      `}</style>
    </div>
  );
};

export default Loader;
