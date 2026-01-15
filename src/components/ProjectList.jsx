import { useProjects } from "../context/ProjectContext";
import ErrorMessage from "./common/ErrorMessage";
import SkeletonList from "./common/SkeletonList";

const ProjectList = ({ selectable = false, selectedProjectId, onSelect }) => {
  const { projects, loading, error, refreshProjects } = useProjects();

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Projects</p>
          <p className="cardHint">Browse available projects</p>
        </div>

        <button
          type="button"
          className="button"
          onClick={refreshProjects}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && <SkeletonList rows={4} />}
      <ErrorMessage message={error} />
      {!loading && projects.length === 0 && !error && (
        <p className="helper">No projects found.</p>
      )}

      {!loading && projects.length > 0 && (
        <ul className="list">
          {projects.map((project) => {
            const isSelected = selectedProjectId === project._id;

            return (
              <li
                key={project._id}
                className="item"
                style={
                  selectable && isSelected
                    ? { outline: "2px solid var(--focus)" }
                    : undefined
                }
              >
                <div className="actions" style={{ justifyContent: "space-between" }}>
                  <div>
                    <p className="itemTitle">{project.title}</p>
                    <p className="itemMeta">{project.description}</p>
                  </div>

                  {selectable && (
                    <button
                      type="button"
                      className={isSelected ? "button buttonPrimary" : "button"}
                      onClick={() => onSelect?.(project)}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
