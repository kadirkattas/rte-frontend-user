import { useState } from "react";
import { CiCircleChevRight } from "react-icons/ci";

const FullPageFormModal = ({ isOpen, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("form");
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    accepted: false,
  });
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveTab("instructions"); // Form gönderildikten sonra talimat sayfasına geçiş
  };
  const handleContinue = () => {
    onSubmit(formData);
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#FCFCFC] flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col items-center justify-center p-6">
        {activeTab === "form" && (
          <div className="w-full h-full md:max-w-lg md:h-auto md:p-8 p-6 bg-gray-100 rounded-none md:rounded-lg shadow-none md:shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Bilgilerinizi Girin
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700">
                  Ad
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">
                  Soyad
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-lg">
                  <input
                    type="checkbox"
                    name="accepted"
                    checked={formData.accepted}
                    onChange={handleInputChange}
                    className="mr-3"
                    required
                  />
                  KVKK'yi onaylıyorum
                </label>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-[#0A2449] text-white px-8 py-3 text-lg rounded-md w-full hover:bg-[#0A2449]/90 transition"
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab === "instructions" && (
          <div className="w-full h-full md:max-w-lg xs:h-auto xs:p-20 p-6 bg-[#0A2449] rounded-none xs:rounded-lg shadow-none xs:shadow-lg flex flex-col justify-center text-white">
            <h2 className="text-3xl xs:text-4xl  font-bold mb-20 text-center">
              Mülakat Talimatları
            </h2>
            <p className="text-xl xs:text-2xl text-center leading-relaxed">
              Mülakata başlamadan önce kameranızı ve mikrofonunuzu hazır
              bulundurun. Her soru için belirlenen süreyi aşmamaya özen
              gösterin. Mülakat boyunca kamera önünde, sakin ve anlaşılır bir
              dille cevap vermeye çalışın.
            </p>
            <div className="flex justify-center mt-24">
              <button
                onClick={handleContinue}
                className="transform transition duration-300 ease-in-out hover:scale-110"
              >
                <CiCircleChevRight size={80} color="white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FullPageFormModal;
