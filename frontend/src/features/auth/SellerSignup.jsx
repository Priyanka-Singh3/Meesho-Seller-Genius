import React, { useState, useRef, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import meeshoLogo from '../../assets/meeshoLogo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SellerSignup = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: enter mobile, 2: enter OTP
  const [error, setError] = useState({ mobile: '', otp: '' });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [whatsapp, setWhatsapp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const recaptchaRef = useRef(null);

  // Initialize RecaptchaVerifier only once
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    // Only initialize once and if auth is defined
    if (!window.recaptchaVerifier && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          'recaptcha-container',
          {
            size: 'normal',
            callback: () => {},
          },
          auth
        );
        window.recaptchaVerifier.render();
      } catch (err) {
        toast.error('Recaptcha initialization failed: ' + err.message);
      }
    }
  }, [auth]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError({ mobile: '', otp: '' });
    if (!mobile.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      setError({ ...error, mobile: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, '+91' + mobile, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err.message);
      setError({ ...error, mobile: err.message });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError({ ...error, otp: '' });
    if (!otp.match(/^\d{6}$/)) {
      toast.error('Please enter a valid 6-digit OTP.');
      setError({ ...error, otp: 'Please enter a valid 6-digit OTP.' });
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setSuccess(true);
      toast.success('Account Created!');
    } catch (err) {
      toast.error('Invalid OTP. Please try again.');
      setError({ ...error, otp: 'Invalid OTP. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#f8f7fa] font-sans" style={{ fontFamily: 'Mier book, sans-serif' }}>
      <ToastContainer position="top-center" autoClose={3000} />
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-12 py-8 bg-white max-w-xl">
        <img src={meeshoLogo} alt="Meesho Logo" className="top-0 w-72 mb-8" />
        <h1 className="text-2xl font-bold text-[#34313b] mb-1">Welcome to Meesho</h1>
        <p className="text-base text-[#7a7a7a] mb-8">Create your account to start selling</p>
        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-[#34313b]">Enter Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={10}
                className={`flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.mobile ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
                value={mobile}
                onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError({ ...error, mobile: '' }); }}
                disabled={step === 2}
                placeholder="Enter Mobile Number"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#e5e5e5] text-[#7a7a7a] font-semibold"
                disabled={step === 2 || loading || !mobile.match(/^\d{10}$/)}
                style={{ minWidth: 100 }}
              >
                {step === 1 ? 'Send OTP' : 'Sent'}
              </button>
            </div>
            {error.mobile && <span className="text-xs text-[#e53935] mt-1 block">{error.mobile}</span>}
          </div>
          {step === 2 && (
            <div>
              <label className="block mb-1 text-sm font-medium text-[#34313b]">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-[#9B177E] transition text-base ${error.otp ? 'border-[#e53935] bg-[#fff6f6]' : 'border-[#d3d3d3] bg-white'}`}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError({ ...error, otp: '' }); }}
                placeholder="Enter OTP"
              />
              {error.otp && <span className="text-xs text-[#e53935] mt-1 block">{error.otp}</span>}
            </div>
          )}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={whatsapp}
              onChange={e => setWhatsapp(e.target.checked)}
              className="accent-[#25d366] mr-2"
              id="whatsapp"
            />
            <label htmlFor="whatsapp" className="text-sm text-[#34313b]">I want to receive important updates on <span className="font-semibold text-[#25d366]">WhatsApp</span></label>
          </div>
          <button
            type="button"
            className="w-full p-3 rounded-lg mt-4 text-white font-semibold text-base"
            style={{ background: step === 2 && otp.length === 6 && !loading ? '#9B177E' : '#e5e5e5', cursor: (step === 2 && otp.length === 6 && !loading) ? 'pointer' : 'not-allowed' }}
            disabled={!(step === 2 && otp.length === 6 && !loading) || success}
            onClick={handleVerifyOtp}
          >
            {success ? 'Account Created!' : 'Create Account'}
          </button>
          <div id="recaptcha-container" ref={recaptchaRef} className="mt-2" />
        </form>
        <p className="text-xs text-[#7a7a7a] mt-4">By clicking you agree to our <a href="#" className="text-[#9B177E] underline">Terms & Conditions</a> and <a href="#" className="text-[#9B177E] underline">Privacy Policy</a></p>
      </div>
      {/* Right: Info/Checklist */}
      <div className="flex-1 flex flex-col px-12 py-8 bg-[#f8f7fa] border-l border-[#ececec] min-w-[350px]">
        {/* Top: Logo and Login */}
        <div className="items-center mb-8 w-full">
          <div className="justify-end items-center">
            <span className="text-sm text-[#7a7a7a] mr-2">Already a user?</span>
            <a href="/" className="text-center bg-[#9B177E] px-6 py-2 border-2 text-white rounded-lg font-bold text-base hover:bg-[#fbe9f2] transition-all" style={{ minWidth: 120, fontSize: '1.1rem' }}>Log in</a>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#34313b] mb-2">Grow your business faster by selling on Meesho</h2>
          <ul className="text-[#34313b] text-base mb-4 space-y-2">
            <li><span className="font-bold">11 lakh+</span> Suppliers are selling commission-free</li>
            <li><span className="font-bold">19000+</span> Pincodes supported for delivery</li>
            <li><span className="font-bold">Crore of</span> Customers buy across India</li>
            <li><span className="font-bold">700 +</span> Categories to sell</li>
          </ul>
        </div>
        <div>
          <h3 className="text-base font-bold text-[#34313b] mb-2">All you need to sell on Meesho is:</h3>
          <ul className="text-[#34313b] text-base space-y-2">
            <li><span className="inline-block w-4 h-4 bg-[#9B177E] rounded-full mr-2 align-middle"></span>Tax Details</li>
            <li><span className="inline-block w-4 h-4 bg-[#9B177E] rounded-full mr-2 align-middle"></span>Enrolment ID/UIN <span className="ml-2 px-2 py-0.5 bg-[#fbe9f2] text-[#9B177E] rounded text-xs">For Non-GST sellers</span> <span className="ml-1 px-2 py-0.5 bg-[#ffebee] text-[#e53935] rounded text-xs">New!</span></li>
            <li><span className="inline-block w-4 h-4 bg-[#9B177E] rounded-full mr-2 align-middle"></span>GSTIN <span className="ml-2 px-2 py-0.5 bg-[#ececec] text-[#34313b] rounded text-xs">Regular & Composition GST sellers</span></li>
            <li><span className="inline-block w-4 h-4 bg-[#9B177E] rounded-full mr-2 align-middle"></span>Bank Account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerSignup; 