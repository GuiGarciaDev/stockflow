import { useState } from "react";
import { adminService } from "../services/adminService";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineServerStack, HiOutlineShieldCheck } from "react-icons/hi2";

export default function AdminPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSeed = async () => {
    if (
      !confirm(
        "This will DELETE all existing data and re-seed the database. Are you sure?",
      )
    )
      return;

    setLoading(true);
    try {
      const res = await adminService.seed();
      setResult(res.data as Record<string, unknown>);
      toast.success("Database seeded successfully!");
    } catch {
      toast.error("Failed to seed database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin Panel</h1>
          <p className="page-subtitle">System administration</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="card admin-card">
          <div className="admin-card-icon">
            <HiOutlineServerStack />
          </div>
          <h3>Database Seed</h3>
          <p className="text-muted">
            Seed the database with sample data: 30+ products, 50+ raw materials,
            and random associations. This will{" "}
            <strong>delete all existing data</strong>.
          </p>
          <button
            className="btn btn-primary btn-full mt-4"
            onClick={handleSeed}
            disabled={loading}
          >
            {loading ? "Seeding..." : "Run Seed"}
          </button>

          {result && (
            <div className="seed-result">
              <h4>Seed Result</h4>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">Products</span>
                  <span className="result-value">
                    {String(result.products)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Raw Materials</span>
                  <span className="result-value">
                    {String(result.rawMaterials)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Associations</span>
                  <span className="result-value">
                    {String(result.associations)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Users</span>
                  <span className="result-value">{String(result.users)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card admin-card">
          <div className="admin-card-icon">
            <HiOutlineShieldCheck />
          </div>
          <h3>Security Info</h3>
          <p className="text-muted">
            Authentication uses HTTP-only secure cookies with SameSite=Strict
            policy.
          </p>
          <div className="security-badges">
            <span className="badge badge-green">HttpOnly Cookies</span>
            <span className="badge badge-green">SameSite Strict</span>
            <span className="badge badge-green">BCrypt Hashing</span>
            <span className="badge badge-green">JWT RS256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
