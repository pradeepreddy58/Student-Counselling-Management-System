export default function Home() {
  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(135deg, #6fb1fc, #4364f7)",
        color: "#fff",
      }}
    >
      <div className="text-center px-4">
        <h1 className="display-4 fw-bold mb-3">
          Welcome to <span >Student Counselling System</span>
        </h1>
        <p className="lead mb-4">
          Your academic journey starts here. Please <strong>login</strong> or <strong>signup</strong> to continue.
        </p>
        <a href="/login" className="btn btn-light btn-lg me-3 shadow">
          Login
        </a>
        <a href="/register" className="btn btn-outline-light btn-lg shadow">
          Register
        </a>
      </div>
    </div>
  );
}
