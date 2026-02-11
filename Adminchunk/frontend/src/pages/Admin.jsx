import { useState } from 'react';
import SopUpload from '../components/sop/SopUpload';
import SopList from '../components/sop/SopList';

const Admin = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshList(!refreshList);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload SOP</h2>
          <SopUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Uploaded SOPs</h2>
          <SopList key={refreshList} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
