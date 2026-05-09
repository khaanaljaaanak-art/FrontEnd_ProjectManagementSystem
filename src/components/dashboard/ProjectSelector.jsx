import ProjectList from "../ProjectList";

// Project refresh is redundant with Provider mount-load for normal flows; pass suppressRefresh={false} to show it.
const ProjectSelector = ({
  selectedProjectId,
  onSelect,
  embedded = false,
  suppressRefresh = true,
}) => {
  return (
    <ProjectList
      embedded={embedded}
      suppressRefresh={suppressRefresh}
      selectable
      selectedProjectId={selectedProjectId}
      onSelect={onSelect}
    />
  );
};

export default ProjectSelector;
