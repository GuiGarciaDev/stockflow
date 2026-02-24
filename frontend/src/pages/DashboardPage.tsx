import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useProducts } from "../hooks/useProducts";
import { useRawMaterials } from "../hooks/useRawMaterials";
import { useProductionSuggestions } from "../hooks/useProduction";
import {
  HiOutlineCube,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const { data: products } = useProducts(0, 1);
  const { data: rawMaterials } = useRawMaterials(0, 1);
  const { data: production } = useProductionSuggestions();

  const stats = [
    {
      label: "Total Products",
      value: products?.totalElements ?? "—",
      icon: HiOutlineCube,
      color: "var(--accent-blue)",
    },
    {
      label: "Raw Materials",
      value: rawMaterials?.totalElements ?? "—",
      icon: HiOutlineBeaker,
      color: "var(--accent-green)",
    },
    {
      label: "Producible Items",
      value: production?.products?.length ?? "—",
      icon: HiOutlineBolt,
      color: "var(--accent-orange)",
    },
    {
      label: "Production Value",
      value: production?.grandTotalValue
        ? `R$ ${production.grandTotalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "—",
      icon: HiOutlineCurrencyDollar,
      color: "var(--accent-purple)",
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {production && production.products.length > 0 && (
        <div className="card mt-6">
          <h2 className="card-title">Top Production Suggestions</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {production.products.slice(0, 5).map((p) => (
                  <tr key={p.productId}>
                    <td className="font-medium">{p.productName}</td>
                    <td>{p.quantityPossible}</td>
                    <td>
                      R${" "}
                      {p.unitPrice.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-accent">
                      R${" "}
                      {p.totalValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
