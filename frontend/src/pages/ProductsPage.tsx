import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useProducts";
import { Product, ProductRequest } from "../services/productService";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import "../styles/tables.css";
import "../styles/forms.css";

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const { data, isLoading } = useProducts(page, 10, search);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [form, setForm] = useState<ProductRequest>({
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
  });

  const openCreate = () => {
    setForm({ name: "", description: "", price: 0, stockQuantity: 0 });
    setEditProduct(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stockQuantity: p.stockQuantity,
    });
    setEditProduct(p);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      await updateMutation.mutateAsync({ id: editProduct.id, data: form });
    } else {
      await createMutation.mutateAsync(form);
    }
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
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
          <h1>Products</h1>
          <p className="page-subtitle">Manage your furniture products</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> New Product
        </button>
      </div>

      <div className="card">
        <form className="search-bar" onSubmit={handleSearch}>
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
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
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Materials</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td>
                        R${" "}
                        {p.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge ${p.stockQuantity > 0 ? "badge-green" : "badge-red"}`}
                        >
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td>{p.rawMaterials?.length || 0}</td>
                      <td>
                        <div className="action-btns">
                          <Link
                            to={`/products/${p.id}`}
                            className="btn-icon btn-sm"
                            title="View details"
                          >
                            <HiOutlineEye />
                          </Link>
                          <button
                            className="btn-icon btn-sm"
                            onClick={() => openEdit(p)}
                            title="Edit"
                          >
                            <HiOutlinePencil />
                          </button>
                          <button
                            className="btn-icon btn-sm btn-danger"
                            onClick={() => handleDelete(p.id)}
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
                        No products found
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
            <h2>{editProduct ? "Edit Product" : "New Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="pname">Name</label>
                <input
                  id="pname"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pdesc">Description</label>
                <textarea
                  id="pdesc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pprice">Price (R$)</label>
                  <input
                    id="pprice"
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
                  <label htmlFor="pstock">Stock</label>
                  <input
                    id="pstock"
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
                  {editProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
