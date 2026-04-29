import { useEffect, useState } from "react";
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../api/vendors";

const EMPTY_FORM = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // vendor object when editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVendors(page);
      setVendors(
        Array.isArray(data) ? data : (data?.items ?? data?.data ?? []),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (vendor) => {
    setEditTarget(vendor);
    setForm({
      name: vendor.name ?? "",
      contactName: vendor.contactName ?? "",
      phone: vendor.phone ?? "",
      email: vendor.email ?? "",
      address: vendor.address ?? "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    try {
      setSubmitting(true);
      if (editTarget) {
        await updateVendor(editTarget.id, { ...form, isActive: true });
      } else {
        await createVendor(form);
      }
      closeModal();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVendor(id);
      setDeleteId(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Vendors</h1>
          <p style={styles.pageSub}>
            Manage your supplier and vendor directory
          </p>
        </div>
        <button style={styles.btnPrimary} onClick={openCreate}>
          + Add Vendor
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button style={styles.errorClose} onClick={() => setError(null)}>
            x
          </button>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.stateBox}>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div style={styles.stateBox}>
            No vendors found. Add your first vendor.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Contact", "Phone", "Email", "Address", ""].map(
                  (h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <tr
                  key={v.id}
                  style={{
                    ...styles.tr,
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                >
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.vendorAvatar}>
                        {v.name?.[0]?.toUpperCase() ?? "V"}
                      </div>
                      <span style={{ fontWeight: 600 }}>{v.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{v.contactName || "—"}</td>
                  <td style={styles.td}>{v.phone || "—"}</td>
                  <td style={styles.td}>{v.email || "—"}</td>
                  <td style={styles.td}>{v.address || "—"}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={styles.actions}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => openEdit(v)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => setDeleteId(v.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Page {page}
        </span>
        <button style={styles.pageBtn} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editTarget ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button style={styles.modalClose} onClick={closeModal}>
                x
              </button>
            </div>

            <div style={styles.modalBody}>
              {[
                { label: "Company Name", name: "name", required: true },
                { label: "Contact Name", name: "contactName" },
                { label: "Phone", name: "phone" },
                { label: "Email", name: "email", type: "email" },
                { label: "Address", name: "address" },
              ].map(({ label, name, type = "text", required }) => (
                <div key={name} style={styles.fieldGroup}>
                  <label style={styles.label}>
                    {label}{" "}
                    {required && (
                      <span style={{ color: "var(--accent)" }}>*</span>
                    )}
                  </label>
                  <input
                    style={styles.input}
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={closeModal}>
                Cancel
              </button>
              <button
                style={{ ...styles.btnPrimary, opacity: submitting ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editTarget
                    ? "Save Changes"
                    : "Create Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: 400 }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Vendor</h2>
              <button
                style={styles.modalClose}
                onClick={() => setDeleteId(null)}
              >
                x
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                This action cannot be undone. The vendor will be permanently
                removed.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.btnSecondary}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                style={styles.btnDanger}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  pageTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: "-0.4px",
    marginBottom: 4,
  },
  pageSub: {
    color: "var(--text-muted)",
    fontSize: 13,
  },
  btnPrimary: {
    background: "var(--accent)",
    color: "#fff",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: "pointer",
    boxShadow: "var(--shadow-accent)",
    transition: "opacity 0.15s",
  },
  btnSecondary: {
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-strong)",
    cursor: "pointer",
  },
  btnDanger: {
    background: "#c0152a",
    color: "#fff",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: "pointer",
  },
  btnEdit: {
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid var(--border-strong)",
    cursor: "pointer",
  },
  btnDelete: {
    background: "rgba(192, 21, 42, 0.12)",
    color: "#e05565",
    fontFamily: "var(--font-body)",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(192, 21, 42, 0.25)",
    cursor: "pointer",
  },
  errorBanner: {
    background: "rgba(192, 21, 42, 0.12)",
    border: "1px solid rgba(192, 21, 42, 0.3)",
    color: "#e05565",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#e05565",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  tableCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  stateBox: {
    padding: "60px 32px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 13,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 20px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border)",
  },
  tr: {
    borderBottom: "1px solid var(--border)",
    transition: "background 0.1s",
  },
  td: {
    padding: "14px 20px",
    fontSize: 13,
    color: "var(--text-secondary)",
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  vendorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "var(--accent-muted)",
    border: "1px solid var(--accent-border)",
    color: "var(--accent)",
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  pageBtn: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-secondary)",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 16px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: 520,
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1px solid var(--border)",
  },
  modalTitle: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 16,
  },
  modalClose: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 700,
  },
  modalBody: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 24px",
    borderTop: "1px solid var(--border)",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    letterSpacing: "0.03em",
  },
  input: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.15s",
  },
};
