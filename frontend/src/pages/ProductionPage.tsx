import {
  useProductionSuggestions,
  useConfirmProduction,
} from "../hooks/useProduction";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { HiOutlineBolt, HiOutlineCheckCircle } from "react-icons/hi2";
import "../styles/production.css";

export default function ProductionPage() {
  const { data, isLoading, refetch } = useProductionSuggestions();
  const confirmMutation = useConfirmProduction();
  const { user } = useSelector((s: RootState) => s.auth);
  const isAdmin = user?.role === "ADMIN";

  const handleConfirm = async () => {
    if (confirm("This will deduct raw materials from stock. Are you sure?")) {
      await confirmMutation.mutateAsync();
      refetch();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Production Suggestions</h1>
          <p className="page-subtitle">
            Optimized production plan based on available raw materials
          </p>
        </div>
        {isAdmin && data && data.products.length > 0 && (
          <button
            className="btn btn-primary btn-confirm"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
          >
            <HiOutlineCheckCircle />
            {confirmMutation.isPending ? "Confirming..." : "Confirm Production"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-center">
          <div className="loading-spinner" />
        </div>
      ) : data && data.products.length > 0 ? (
        <>
          <div className="production-summary">
            <div className="summary-card grand-total">
              <HiOutlineBolt className="summary-icon" />
              <div>
                <span className="summary-label">Grand Total Value</span>
                <span className="summary-value">
                  R${" "}
                  {data.grandTotalValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <span className="summary-label">Producible Products</span>
              <span className="summary-value">{data.products.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total Units</span>
              <span className="summary-value">
                {data.products.reduce((sum, p) => sum + p.quantityPossible, 0)}
              </span>
            </div>
          </div>

          <div className="production-grid">
            {data.products.map((p, i) => (
              <div key={p.productId} className="production-card">
                <div className="production-rank">#{i + 1}</div>
                <h3 className="production-name">{p.productName}</h3>
                <div className="production-details">
                  <div className="production-detail">
                    <span className="detail-label">Quantity</span>
                    <span className="detail-value">
                      {p.quantityPossible} units
                    </span>
                  </div>
                  <div className="production-detail">
                    <span className="detail-label">Unit Price</span>
                    <span className="detail-value">
                      R${" "}
                      {p.unitPrice.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="production-detail total">
                    <span className="detail-label">Total Value</span>
                    <span className="detail-value text-accent">
                      R${" "}
                      {p.totalValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <HiOutlineBolt className="empty-icon" />
          <h3>No Production Possible</h3>
          <p>
            Not enough raw materials to produce any products. Add more materials
            or create product associations.
          </p>
        </div>
      )}
    </div>
  );
}
