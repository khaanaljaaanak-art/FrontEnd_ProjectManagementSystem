import ProjectList from "../ProjectList";

const ProjectSelector = ({ selectedProjectId, onSelect }) => {
  return (
    <ProjectList
      selectable
      selectedProjectId={selectedProjectId}
      onSelect={onSelect}
    />
  );
};

export default ProjectSelector;
