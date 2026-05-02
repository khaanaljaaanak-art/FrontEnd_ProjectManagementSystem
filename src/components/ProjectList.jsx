import { useProjects } from "../context/ProjectContext";
import ErrorMessage from "./common/ErrorMessage";

const ProjectListBody = ({
  projects,
  loading,
  error,
  selectable,
  selectedProjectId,
  onSelect,
  listId,
}) => (
  <>
    <ErrorMessage message={error} />

    {loading && (
      <p className="studentOverviewStatus" role="status">
        <span className="studentOverviewSpinner" aria-hidden />
        Loading projects…
      </p>
    )}

    {!loading && projects.length === 0 && !error && (
      <div className="studentOverviewEmpty studentOverviewEmpty--compact">
        <p className="studentOverviewEmpty__title">No projects listed</p>
        <p className="studentOverviewEmpty__text">
          When your administrator assigns available projects, they will show up here.
        </p>
      </div>
    )}

    {!loading && projects.length > 0 && (
      <ul className="studentSubmitProjectList" id={listId}>
        {projects.map((project) => {
          const isSelected = selectable && selectedProjectId === project._id;

          return (
            <li
              key={project._id}
              className={`studentSubmitProjectRow ${isSelected ? "studentSubmitProjectRow--selected" : ""}`}
            >
              <div className="studentSubmitProjectRow__main">
                <h3 className="studentSubmitProjectRow__title">{project.title}</h3>
                {project.description ? (
                  <p className="studentSubmitProjectRow__desc">{project.description}</p>
                ) : (
                  <p className="studentSubmitProjectRow__desc studentSubmitProjectRow__desc--muted">No description</p>
                )}
              </div>
              {selectable ? (
                <div className="studentSubmitProjectRow__actions">
                  <button
                    type="button"
                    className={
                      isSelected ? "button buttonPrimary studentSubmitProjectRow__cta" : "button studentSubmitProjectRow__cta"
                    }
                    onClick={() => onSelect?.(project)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    )}
  </>
);

const ProjectList = ({ selectable = false, selectedProjectId, onSelect, embedded = false, listId }) => {
  const { projects, loading, error, refreshProjects } = useProjects();

  if (embedded) {
    return (
      <div className="studentSubmitProjectEmbed">
        <div className="studentSubmitProjectEmbed__bar">
          <button type="button" className="button buttonRefresh" onClick={refreshProjects} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh list"}
          </button>
        </div>
        <ProjectListBody
          projects={projects}
          loading={loading}
          error={error}
          selectable={selectable}
          selectedProjectId={selectedProjectId}
          onSelect={onSelect}
          listId={listId}
        />
      </div>
    );
  }

  return (
    <section className="card studentOverviewCard studentSubmitProjectPanel" aria-labelledby="submit-projects-heading">
      <header className="studentOverviewCard__header studentOverviewCard__header--split">
        <div>
          <p className="studentOverviewCard__eyebrow">Workspace</p>
          <h2 id="submit-projects-heading" className="cardTitle">
            Projects
          </h2>
          <p className="cardHint">Choose the project you are submitting work for. Assessments load after you select.</p>
        </div>
        <button type="button" className="button buttonRefresh" onClick={refreshProjects} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh list"}
        </button>
      </header>

      <div className="studentOverviewCard__body">
        <ProjectListBody
          projects={projects}
          loading={loading}
          error={error}
          selectable={selectable}
          selectedProjectId={selectedProjectId}
          onSelect={onSelect}
          listId={listId}
        />
      </div>
    </section>
  );
};

export default ProjectList;
