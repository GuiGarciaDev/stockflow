import { useState, FormEvent } from "react";
import {
  useRawMaterials,
  useCreateRawMaterial,
  useUpdateRawMaterial,
  useDeleteRawMaterial,
} from "../hooks/useRawMaterials";
import {
  RawMaterial,
  RawMaterialRequest,
} from "../services/rawMaterialService";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import "../styles/tables.css";
import "../styles/forms.css";

export default function RawMaterialsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RawMaterial | null>(null);
  const { data, isLoading } = useRawMaterials(page, 10, search);
  const createMutation = useCreateRawMaterial();
  const updateMutation = useUpdateRawMaterial();
  const deleteMutation = useDeleteRawMaterial();

  const [form, setForm] = useState<RawMaterialRequest>({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    unit: "un",
  });

  const openCreate = () => {
    setForm({
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      unit: "un",
    });
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (rm: RawMaterial) => {
    setForm({
      name: rm.name,
      description: rm.description || "",
      price: rm.price,
      stockQuantity: rm.stockQuantity,
      unit: rm.unit,
    });
    setEditItem(rm);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, data: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this raw material?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Raw Materials</h1>
          <p className="page-subtitle">Manage your raw materials inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> New Material
        </button>
      </div>

      <div className="card">
        <form className="search-bar" onSubmit={handleSearch}>
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-sm">
            Search
          </button>
        </form>

        {isLoading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((rm) => (
                    <tr key={rm.id}>
                      <td className="font-medium">{rm.name}</td>
                      <td>{rm.unit}</td>
                      <td>
                        R${" "}
                        {rm.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${rm.stockQuantity > 0 ? "badge-green" : "badge-red"}`}
                        >
                          {rm.stockQuantity}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-icon btn-sm"
                            onClick={() => openEdit(rm)}
                            title="Edit"
                          >
                            <HiOutlinePencil />
                          </button>
                          <button
                            className="btn-icon btn-sm btn-danger"
                            onClick={() => handleDelete(rm.id)}
                            title="Delete"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.content.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        No raw materials found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-sm"
                  disabled={data.first}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {data.page + 1} of {data.totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? "Edit Raw Material" : "New Raw Material"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="rmname">Name</label>
                <input
                  id="rmname"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="rmdesc">Description</label>
                <textarea
                  id="rmdesc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rmprice">Price (R$)</label>
                  <input
                    id="rmprice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rmstock">Stock</label>
                  <input
                    id="rmstock"
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rmunit">Unit</label>
                  <select
                    id="rmunit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="un">un</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="pç">pç</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
