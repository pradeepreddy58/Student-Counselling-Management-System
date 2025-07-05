import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminDashboard() {
  const [colleges, setColleges] = useState([]);
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    location: "",
    branches: "",
  });
  const [editCollege, setEditCollege] = useState(null);
  const [requests, setRequests] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);

  useEffect(() => {
    fetchColleges();
    fetchRequests();
    fetchPendingStudents();
  }, []);

  const fetchColleges = async () => {
    const res = await api.get("/api/colleges");
    setColleges(res.data);
  };

  const fetchRequests = async () => {
    const res = await api.get("/api/counselling");
    const enriched = res.data.map(r => ({
      ...r,
      _selectedCollege: "",
      _selectedBranch: "",
    }));
    setRequests(enriched);
  };

  const fetchPendingStudents = async () => {
    const res = await api.get("/api/auth/students/pending");
    setPendingStudents(res.data);
  };

  const handleApproveStudent = async (id) => {
    await api.put(`/api/auth/students/${id}/status`, { status: "approved" });
    fetchPendingStudents();
  };

  const handleRejectStudent = async (id) => {
    await api.put(`/api/auth/students/${id}/status`, { status: "rejected" });
    fetchPendingStudents();
  };

  const handleCollegeChange = (e) => {
    setCollegeForm({ ...collegeForm, [e.target.name]: e.target.value });
  };

  const handleAddCollege = async () => {
    const branchesArray = collegeForm.branches
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    await api.post("/api/colleges", {
      name: collegeForm.name,
      location: collegeForm.location,
      branches: branchesArray,
    });

    setCollegeForm({ name: "", location: "", branches: "" });
    fetchColleges();
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm("Are you sure you want to delete this college?")) return;

    await api.delete(`/api/colleges/${id}`);
    fetchColleges();
  };

  const handleEditCollege = (college) => {
    setEditCollege({
      ...college,
      branches: college.branches.join(", "),
    });
  };

  const handleUpdateCollege = async () => {
    const branchesArray = editCollege.branches
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    await api.put(`/api/colleges/${editCollege._id}`, {
      name: editCollege.name,
      location: editCollege.location,
      branches: branchesArray,
    });

    setEditCollege(null);
    fetchColleges();
  };

  const handleRequestAction = async (id, action) => {
    await api.put(`/api/counselling/${id}/${action}`);
    fetchRequests();
  };

  const handleAssign = async (id, collegeId, branch) => {
    if (!collegeId || !branch) {
      alert("Please select both college and branch.");
      return;
    }

    await api.put(`/api/counselling/${id}/assign`, { collegeId, branch });
    fetchRequests();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary fw-bold">Admin Dashboard</h2>

      {/* Pending Students */}
      <h4 className="text-secondary">👥 Pending Student Approvals</h4>
      {pendingStudents.length === 0 && (
        <p className="text-muted">No pending student registrations.</p>
      )}
      <div className="row mb-5">
        {pendingStudents.map(student => (
          <div key={student._id} className="col-md-4 mb-3">
            <div className="card shadow-sm p-3">
              <h6>{student.name}</h6>
              <p>{student.email}</p>
              <div>
                <button
                  className="btn btn-sm btn-success me-2"
                  onClick={() => handleApproveStudent(student._id)}
                >
                  Approve
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRejectStudent(student._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add College */}
      <div className="card shadow-sm p-4 mb-5">
        <h5 className="text-success">➕ Add New College</h5>
        <div className="row g-3 mt-2">
          <div className="col-md-3">
            <input
              type="text"
              name="name"
              placeholder="College Name"
              className="form-control"
              value={collegeForm.name}
              onChange={handleCollegeChange}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="form-control"
              value={collegeForm.location}
              onChange={handleCollegeChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              name="branches"
              placeholder="Branches (comma-separated)"
              className="form-control"
              value={collegeForm.branches}
              onChange={handleCollegeChange}
            />
          </div>
          <div className="col-md-2">
            <button
              onClick={handleAddCollege}
              className="btn btn-outline-success w-100"
            >
              Add College
            </button>
          </div>
        </div>
      </div>

      {/* Colleges List */}
      <h4 className="text-secondary">🎓 Colleges</h4>
      <div className="row mb-5">
        {colleges.map((college) => (
          <div key={college._id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h6 className="fw-bold">{college.name}</h6>
                <p className="mb-1 text-muted">{college.location}</p>
                <p className="mb-2 small">
                  <strong>Branches:</strong>{" "}
                  {college.branches.length > 0
                    ? college.branches.join(", ")
                    : "None"}
                </p>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleEditCollege(college)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCollege(college._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Counselling Requests */}
      <h4 className="text-secondary">📋 Counselling Requests</h4>
      {requests.length === 0 && (
        <p className="text-muted">No counselling requests yet.</p>
      )}

      {requests.map((req) => (
        <div key={req._id} className="card p-3 mb-3 shadow-sm">
          <p>
            <strong>Student:</strong> {req.studentId?.name} ({req.studentId?.email})
          </p>
          <p>
            <strong>Requested College:</strong> {req.collegeId?.name}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-primary">{req.status}</span>
          </p>

          {req.status === "pending" && (
            <>
              <button
                className="btn btn-success btn-sm me-2"
                onClick={() => handleRequestAction(req._id, "approve")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRequestAction(req._id, "reject")}
              >
                Reject
              </button>
            </>
          )}

          {req.status === "approved" && !req.assignedCollegeId && req.uploadedDetails && (
            <>
              <h6 className="mt-3">Uploaded Details</h6>
              <p>Name: {req.uploadedDetails.name}</p>
              <p>Phone: {req.uploadedDetails.phoneNumber}</p>
              <p>Desired Branch: {req.uploadedDetails.desiredBranch}</p>
              <p>
                10th Certificate:{" "}
                <a
                  href={`http://localhost:5000/${req.uploadedDetails.tenthCertificate}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </p>
              <p>
                Inter Certificate:{" "}
                <a
                  href={`http://localhost:5000/${req.uploadedDetails.interCertificate}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </p>

              <div className="row g-2 mt-2">
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={req._selectedCollege || ""}
                    onChange={(e) => {
                      const updatedRequests = requests.map(r =>
                        r._id === req._id
                          ? { ...r, _selectedCollege: e.target.value, _selectedBranch: "" }
                          : r
                      );
                      setRequests(updatedRequests);
                    }}
                  >
                    <option value="">Select College to Assign</option>
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={req._selectedBranch || ""}
                    onChange={(e) => {
                      const updatedRequests = requests.map(r =>
                        r._id === req._id
                          ? { ...r, _selectedBranch: e.target.value }
                          : r
                      );
                      setRequests(updatedRequests);
                    }}
                    disabled={!req._selectedCollege}
                  >
                    <option value="">Select Branch</option>
                    {colleges
                      .find(c => c._id === req._selectedCollege)?.branches.map(branch => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mt-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                      handleAssign(req._id, req._selectedCollege, req._selectedBranch)
                    }
                  >
                    Assign
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Edit College Modal */}
      {editCollege && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit College</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditCollege(null)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  value={editCollege.name}
                  onChange={(e) =>
                    setEditCollege({ ...editCollege, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  value={editCollege.location}
                  onChange={(e) =>
                    setEditCollege({ ...editCollege, location: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control"
                  value={editCollege.branches}
                  onChange={(e) =>
                    setEditCollege({ ...editCollege, branches: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditCollege(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleUpdateCollege}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
