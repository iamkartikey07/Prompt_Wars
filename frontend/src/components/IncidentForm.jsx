import { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, Send, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeIncident } from '../api/client';

const MAX_IMAGE_SIZE_MB = 4;

export default function IncidentForm({ onResult, loading, setLoading }) {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() && !imageFile) {
      toast.error('Please describe the situation or upload an image');
      return;
    }

    setLoading(true);
    onResult(null);

    try {
      let imageBase64 = null;
      let imageMimeType = null;

      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        imageBase64 = base64;
        imageMimeType = imageFile.type;
      }

      const result = await analyzeIncident(description.trim() || null, imageBase64, imageMimeType);
      onResult(result);

      // Scroll to result
      setTimeout(() => {
        document.getElementById('guidance-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to analyze. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Emergency banner */}
      <div className="bg-red-950/40 border-b border-red-900/30 px-5 py-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300">
          <strong>In a life-threatening emergency, call 112 immediately.</strong>{' '}
          This tool provides guidance only — always seek professional help.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Situation description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Describe the situation
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. My friend fell and has a deep cut on their arm that won't stop bleeding..."
            rows={4}
            maxLength={2000}
            disabled={loading}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 transition"
          />
          <p className="text-xs text-gray-500 text-right mt-1">{description.length}/2000</p>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload image <span className="text-gray-500 font-normal">(optional)</span>
          </label>

          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-500 hover:border-gray-500 hover:text-gray-400 transition cursor-pointer disabled:opacity-50"
            >
              <ImageIcon size={28} />
              <span className="text-sm">Click to upload image of the situation</span>
              <span className="text-xs">JPG, PNG, WEBP up to 4MB</span>
            </button>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Uploaded situation"
                className="w-full max-h-64 object-cover rounded-xl border border-gray-700"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute top-2 right-2 w-8 h-8 bg-gray-900/80 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-900/80 transition"
              >
                <X size={16} />
              </button>
              <div className="mt-1 text-xs text-gray-500">{imageFile?.name}</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (!description.trim() && !imageFile)}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing situation…
            </>
          ) : (
            <>
              <Send size={18} />
              Get First-Aid Guidance
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove "data:image/...;base64," prefix — send only raw base64
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
