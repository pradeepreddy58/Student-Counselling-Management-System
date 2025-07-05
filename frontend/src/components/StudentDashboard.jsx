import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);

  const [colleges, setColleges] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [details, setDetails] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    desiredBranch: "",
  });
  const [files, setFiles] = useState({ tenth: null, inter: null });

  useEffect(() => {
    fetchColleges();
    fetchMyRequest();
  }, []);

  const fetchColleges = async () => {
    const res = await api.get("/api/colleges");
    setColleges(res.data);
  };

  const fetchMyRequest = async () => {
    try {
      const res = await api.get("/api/counselling/my", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setMyRequest(res.data);
    } catch {
      setMyRequest(null);
    }
  };

  const handleBook = async () => {
    if (!selectedCollege) {
      alert("Select a college");
      return;
    }
    await api.post(
      "/api/counselling",
      { studentId: user.userId, collegeId: selectedCollege },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    fetchMyRequest();
  };

  const handleUpload = async () => {
    if (
      !details.name ||
      !details.address ||
      !details.phoneNumber ||
      !details.desiredBranch ||
      !files.tenth ||
      !files.inter
    ) {
      alert("Please fill all fields and upload both certificates.");
      return;
    }

    const formData = new FormData();
    Object.entries(details).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("tenthCertificate", files.tenth);
    formData.append("interCertificate", files.inter);

    await api.put(`/api/counselling/${myRequest._id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.token}`,
      },
    });
    fetchMyRequest();
  };

  const handleDetailChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">🎓 Welcome, Student</h3>

      {!myRequest && (
        <>
          <div className="mb-3">
            <label className="form-label">Select College for Counselling:</label>
            <select
              className="form-select"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              <option value="">-- Select College --</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name} ({college.location})
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleBook} className="btn btn-primary">
            Book Counselling
          </button>
        </>
      )}

      {myRequest && (
        <div className="card mt-4 p-3 shadow-sm">
          <h5>Counselling Status: <span className="text-info">{myRequest.status}</span></h5>
          <p>Chosen College: <strong>{myRequest.collegeId?.name || "-"}</strong></p>
         


          {myRequest.status === "pending" && (
            <div className="alert alert-info mt-2">
              Waiting for admin approval…
            </div>
          )}

          {myRequest.status === "rejected" && (
            <div className="alert alert-danger mt-2">
              Sorry, your counselling request was rejected.
            </div>
          )}

          {myRequest.status === "approved" && !myRequest.uploadedDetails && (
            <>
              <h5 className="mt-3">Upload Your Details & Certificates</h5>
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="form-control mb-2"
                    onChange={handleDetailChange}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    className="form-control mb-2"
                    onChange={handleDetailChange}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    className="form-control mb-2"
                    onChange={handleDetailChange}
                  />
                </div>
                <div className="col-md-6">
                  <select
                    name="desiredBranch"
                    className="form-select mb-2"
                    onChange={handleDetailChange}
                  >
                    <option value="">-- Select Desired Branch --</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>
              <div className="mb-2">
                <label>10th Certificate</label>
                <input
                  type="file"
                  name="tenth"
                  className="form-control mb-2"
                  onChange={handleFileChange}
                />
              </div>
              <div className="mb-2">
                <label>Inter Certificate</label>
                <input
                  type="file"
                  name="inter"
                  className="form-control mb-2"
                  onChange={handleFileChange}
                />
              </div>
              <button onClick={handleUpload} className="btn btn-success">
                Upload Details
              </button>
            </>
          )}

          {myRequest.status === "assigned" && (
            <div className="mt-3">
              <h5 className="text-success">✅ Assigned College & Branch</h5>
              <p><strong>College:</strong> {myRequest.assignedCollegeId?.name}</p>
              <p><strong>Branch:</strong> {myRequest.assignedBranch}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
