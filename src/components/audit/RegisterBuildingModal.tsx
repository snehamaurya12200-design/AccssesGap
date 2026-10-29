import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BuildingCategory } from '../../types';
import { X, Building2, Upload, Camera, Check } from 'lucide-react';
import { IMAGES } from '../../data/initialData';

interface RegisterBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBuildingId: string) => void;
}

const BUILDING_CATEGORIES: BuildingCategory[] = [
  'Government offices',
  'Hospitals and healthcare centres',
  'Educational institutions',
  'Public transport facilities',
  'Banks and public service centres',
  'Other public buildings',
];

export const RegisterBuildingModal: React.FC<RegisterBuildingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { registerBuilding, language } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<BuildingCategory>('Government offices');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Central Metro');
  const [district, setDistrict] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('Mon-Fri: 9:00 AM – 5:00 PM');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGES.civicCentre);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter the building or facility name.');
      return;
    }
    if (!address.trim()) {
      alert('Please enter the street address or locality.');
      return;
    }
    if (!district.trim()) {
      alert('Please enter the district or ward.');
      return;
    }

    const newId = registerBuilding({
      name,
      category,
      address,
      city,
      district,
      department: department.trim() || undefined,
      phone: phone.trim() || undefined,
      hours: hours.trim() || undefined,
      description: description.trim() || undefined,
      imageUrl,
    });

    onSuccess(newId);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-building-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-800" />
            <h2 id="register-building-title" className="text-base font-bold text-slate-900">
              {language === 'hi' ? 'नया सार्वजनिक भवन पंजीकृत करें' : 'Register New Public Building'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Building or Centre Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sub-Divisional Magistrate Office, West Ward"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Building Type / Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BuildingCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              >
                {BUILDING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Government Department / Service Category
              </label>
              <input
                type="text"
                placeholder="e.g. Revenue & Disaster Management"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Address / Locality <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50 Station Road, Near Central Bus Stand"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                District / Ward <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. West District / Ward 14"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                City / Municipality
              </label>
              <input
                type="text"
                placeholder="e.g. Central Metro"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Public Hours</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Building Description & Public Services Offered
            </label>
            <textarea
              rows={2}
              placeholder="Describe public counters, citizen services, floors, and general layout..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Exterior Photograph */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block font-semibold text-slate-800">
              Exterior Building Photograph (Optional)
            </label>
            <div className="flex items-center gap-4">
              <img
                src={imageUrl}
                alt="Selected building preview"
                className="w-20 h-14 object-cover rounded-lg border border-slate-300 bg-slate-100"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors font-medium">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setImageUrl(IMAGES.civicCentre)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
                >
                  Preset 1 (Civic)
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl(IMAGES.courthouse)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
                >
                  Preset 2 (Courthouse)
                </button>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs"
            >
              Register & Start Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
