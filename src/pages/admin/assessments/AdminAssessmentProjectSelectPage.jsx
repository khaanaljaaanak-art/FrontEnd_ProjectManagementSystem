import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";

const AdminAssessmentProjectSelectPage = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  return (
    <div className="workflow">
      <header className="workflowHeader">
        <div>
          <div className="workflowHeaderLeft">
            <span className="stepBadge">Step 1</span>
            <h3 className="workflowTitle">Select Project</h3>
          </div>
          <p className="workflowHint">
            Assessments are managed per project. Pick the project you want to manage timelines for.
          </p>
        </div>
      </header>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Project Selection</p>
            <p className="cardHint">Choose a project to continue</p>
          </div>
        </div>

        <div className="row">
          <select
            className="select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Choose a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>

          {selectedProject ? (
            <div className="item" style={{ marginTop: 4 }}>
              <p className="itemTitle">{selectedProject.title}</p>
              <p className="itemMeta">{selectedProject.description || "No description provided."}</p>
            </div>
          ) : null}
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button
            type="button"
            className="button buttonPrimary"
            disabled={!selectedProjectId}
            onClick={() => navigate(`/admin/assessments/${selectedProjectId}/timeline`)}
          >
            View assessments
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAssessmentProjectSelectPage;

