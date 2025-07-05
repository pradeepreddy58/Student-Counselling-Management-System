import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function UploadDetails() {
  const { id } = useParams(); // counselling request id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    desiredBranch: "",
  });

  const [tenthFile, setTenthFile] = useState(null);
  const [interFile, setInterFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("address", form.address);
    data.append("phoneNumber", form.phoneNumber);
    data.append("desiredBranch", form.desiredBranch);
    data.append("tenthCertificate", tenthFile);
    data.append("interCertificate", interFile);

    try {
      await api.put(`/api/counselling/${id}/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Details uploaded successfully!");
      navigate("/student");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload details");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h2 className="text-primary text-center mb-4">Upload Your Details</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Address</label>
            <input
              name="address"
              className="form-control"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Phone Number</label>
            <input
              name="phoneNumber"
              className="form-control"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Desired Branch</label>
            <input
              name="desiredBranch"
              className="form-control"
              placeholder="Desired Branch"
              value={form.desiredBranch}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">10th Certificate</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setTenthFile(e.target.files[0])}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Intermediate Certificate</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setInterFile(e.target.files[0])}
              required
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-success w-100">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
