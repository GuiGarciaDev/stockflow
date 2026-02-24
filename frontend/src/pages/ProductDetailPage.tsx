import { useParams, Link } from "react-router-dom";
import { useState, FormEvent } from "react";
import {
  useProduct,
  useAddRawMaterial,
  useRemoveRawMaterial,
} from "../hooks/useProducts";
import { useAllRawMaterials } from "../hooks/useRawMaterials";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const { data: product, isLoading } = useProduct(productId);
  const { data: allRawMaterials } = useAllRawMaterials();
  const addMutation = useAddRawMaterial();
  const removeMutation = useRemoveRawMaterial();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRmId, setSelectedRmId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRmId) return;
    await addMutation.mutateAsync({
      productId,
      data: { rawMaterialId: selectedRmId, quantityNeeded: quantity },
    });
    setShowAddForm(false);
    setSelectedRmId(0);
    setQuantity(1);
  };

  const handleRemove = async (associationId: number) => {
    if (confirm("Remove this raw material from the product?")) {
      await removeMutation.mutateAsync({ productId, associationId });
    }
  };

  // Filter out already-associated raw materials
  const availableRms =
    allRawMaterials?.filter(
      (rm) =>
        !product?.rawMaterials?.some((prm) => prm.rawMaterialId === rm.id),
    ) || [];

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/products" className="back-link">
            <HiOutlineArrowLeft /> Back to Products
          </Link>
          <h1>{product.name}</h1>
          <p className="page-subtitle">
            {product.description || "No description"}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 className="card-title">Product Info</h3>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Price</span>
              <span className="detail-value">
                R${" "}
                {product.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Stock</span>
              <span
                className={`badge ${product.stockQuantity > 0 ? "badge-green" : "badge-red"}`}
              >
                {product.stockQuantity} units
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(product.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">
              Raw Materials ({product.rawMaterials?.length || 0})
            </h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <HiOutlinePlus /> Add
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="inline-form">
              <select
                value={selectedRmId}
                onChange={(e) => setSelectedRmId(parseInt(e.target.value))}
                required
              >
                <option value={0}>Select raw material...</option>
                {availableRms.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                style={{ width: "80px" }}
              />
              <button type="submit" className="btn btn-sm btn-primary">
                Add
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </form>
          )}

          {product.rawMaterials && product.rawMaterials.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Qty Needed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {product.rawMaterials.map((rm) => (
                    <tr key={rm.id}>
                      <td className="font-medium">{rm.rawMaterialName}</td>
                      <td>{rm.quantityNeeded}</td>
                      <td>
                        <button
                          className="btn-icon btn-sm btn-danger"
                          onClick={() => handleRemove(rm.id)}
                        >
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center mt-4">
              No raw materials associated yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
