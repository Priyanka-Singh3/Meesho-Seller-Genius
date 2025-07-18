import React from 'react';

const FormActions = ({ isFormValid, loading, handleReset }) => (
  <div className="flex gap-2 mt-2">
    <button
      type="submit"
      className={`font-semibold px-4 py-2 flex-1 border border-[#9B177E] ${isFormValid && !loading ? 'bg-[#9B177E] text-white hover:bg-[#7a125f] transition cursor-pointer' : 'bg-[#f8e6f8] text-[#9B177E] cursor-not-allowed'}`}
      style={{ borderRadius: 0 }}
      disabled={!isFormValid || loading}
    >
      {loading ? 'Generating...' : 'Generate Post'}
    </button>
    <button type="button" className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 hover:bg-gray-300 transition flex-1 border border-gray-400" style={{ borderRadius: 0 }} onClick={handleReset} disabled={loading}>
      Reset
    </button>
  </div>
);

export default FormActions; 