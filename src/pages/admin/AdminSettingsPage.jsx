import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchSettings, updateSettings } from "../../services/adminService";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSettings();
      setSettings(data || null);
    } catch (_e) {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!settings) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await updateSettings({
        submissionEnabled: settings.submissionEnabled,
        maintenanceMode: settings.maintenanceMode,
      });
      setMessage("Settings saved.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">System Settings</p>
          <p className="cardHint">Global controls for availability and maintenance</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {message && <p className="helper">{message}</p>}
      {loading && <p className="helper">Loading settings…</p>}

      {settings && (
        <div className="row">
          <label className="actions">
            <input
              type="checkbox"
              checked={Boolean(settings.submissionEnabled)}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, submissionEnabled: e.target.checked }))
              }
              disabled={busy}
            />
            <span className="helper" style={{ margin: 0 }}>Allow student submissions</span>
          </label>

          <label className="actions">
            <input
              type="checkbox"
              checked={Boolean(settings.maintenanceMode)}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
              }
              disabled={busy}
            />
            <span className="helper" style={{ margin: 0 }}>Maintenance mode</span>
          </label>

          <button type="button" className="button buttonPrimary" onClick={save} disabled={busy}>
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
