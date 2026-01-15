const SkeletonList = ({ rows = 4 }) => {
  return (
    <div className="skeletonList">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeletonRow" />
      ))}
    </div>
  );
};

export default SkeletonList;
