import ProjectList from "../ProjectList";

const ProjectSelector = ({ selectedProjectId, onSelect, embedded = false }) => {
  return (
    <ProjectList
      embedded={embedded}
      selectable
      selectedProjectId={selectedProjectId}
      onSelect={onSelect}
    />
  );
};

export default ProjectSelector;
