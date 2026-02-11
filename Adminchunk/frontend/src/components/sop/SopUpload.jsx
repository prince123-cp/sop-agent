import { useState } from 'react';
import { uploadSop } from '../../api/sop.api';

const SopUpload = ({ onUploadSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    version: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const selectedFile = files?.[0] || null;
      const suggestedName =
        selectedFile && !formData.name
          ? selectedFile.name.replace(/\.pdf$/i, '')
          : formData.name;
      setFormData({ ...formData, file: selectedFile, name: suggestedName });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.name.trim() || !formData.department.trim() || !formData.version.trim() || !formData.file) {
        setMessage('Required fields: SOP Name, Department, Version, and PDF file.');
        setLoading(false);
        return;
      }

      if (formData.file.type !== 'application/pdf') {
        setMessage('Sirf PDF file upload karein.');
        setLoading(false);
        return;
      }

      if (formData.file.size > 10 * 1024 * 1024) {
        setMessage('PDF size 10MB se kam honi chahiye.');
        setLoading(false);
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name.trim());
      uploadFormData.append('department', formData.department.trim());
      uploadFormData.append('version', formData.version.trim());
      uploadFormData.append('pdf', formData.file);

      await uploadSop(uploadFormData);
      setMessage('SOP uploaded successfully!');
      setFormData({
        name: '',
        department: '',
        version: '',
        file: null,
      });
      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess();
      }
    } catch (error) {
      const errorMessage = error?.message || 'Error uploading SOP. Please try again.';
      setMessage(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
        <p className="font-semibold">Upload ke liye required information:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>SOP Name</li>
          <li>Department</li>
          <li>Version (example: v1.0)</li>
          <li>PDF file only (max 10MB)</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">SOP Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Version</label>
        <input
          type="text"
          name="version"
          value={formData.version}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">PDF File</label>
        <input
          type="file"
          name="file"
          accept=".pdf"
          onChange={handleChange}
          required
          className="mt-1 block w-full"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload SOP'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
};

export default SopUpload;
