import { useMemo, useReducer } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAssessments } from "../../hooks/useAssessments";
import { useMySubmission } from "../../hooks/useMySubmission";
import {
  submitAssessment,
  submitAssessmentWithFiles,
  uploadSubmissionFiles,
} from "../../services/submissionService";
import ProjectSelector from "../../components/dashboard/ProjectSelector";
import AssessmentList from "../../components/dashboard/AssessmentList";
import SubmissionForm from "../../components/dashboard/SubmissionForm";
import ErrorMessage from "../../components/common/ErrorMessage";

const StudentSubmissionPage = () => {
  const { projects } = useProjects();

  const initialState = {
    selectedProjectId: "",
    selectedAssessmentId: "",
    fileUrl: "",
    files: [],
    submitting: false,
    submitMsg: "",
    submitError: "",
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "selectProject":
        return {
          ...state,
          selectedProjectId: action.projectId,
          selectedAssessmentId: "",
          submitMsg: "",
          submitError: "",
        };
      case "selectAssessment":
        return {
          ...state,
          selectedAssessmentId: action.assessmentId,
          submitMsg: "",
          submitError: "",
        };
      case "setFileUrl":
        return { ...state, fileUrl: action.value };
      case "setFiles":
        return { ...state, files: action.files };
      case "submitting":
        return { ...state, submitting: true, submitMsg: "", submitError: "" };
      case "submitted":
        return {
          ...state,
          submitting: false,
          fileUrl: "",
          files: [],
          submitMsg: action.message,
          submitError: "",
        };
      case "submitFailed":
        return {
          ...state,
          submitting: false,
          submitMsg: "",
          submitError: action.message,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === state.selectedProjectId) || null,
    [projects, state.selectedProjectId]
  );

  const {
    assessments,
    loading: loadingAssessments,
    error: assessmentError,
  } = useAssessments(state.selectedProjectId);

  const selectedAssessment = useMemo(
    () => assessments.find((a) => a._id === state.selectedAssessmentId) || null,
    [assessments, state.selectedAssessmentId]
  );

  const {
    submission: mySubmission,
    loading: loadingMySubmission,
    error: mySubmissionError,
    refresh: refreshMySubmission,
    setSubmission: setMySubmission,
  } = useMySubmission(state.selectedAssessmentId);

  const effectiveDeadline = selectedAssessment?.extendedDeadline || selectedAssessment?.deadline;
  const canResubmit =
    Boolean(mySubmission) &&
    Boolean(effectiveDeadline) &&
    Date.now() <= new Date(effectiveDeadline).getTime();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!state.selectedAssessmentId) {
      dispatch({ type: "submitFailed", message: "Select an assessment first." });
      return;
    }

    dispatch({ type: "submitting" });
    try {
      const hasFiles = Array.isArray(state.files) && state.files.length > 0;
      const hasUrl = Boolean(state.fileUrl && state.fileUrl.trim());

      if (!hasFiles && !hasUrl) {
        dispatch({
          type: "submitFailed",
          message: "Provide a file URL or upload up to 3 files.",
        });
        return;
      }

      let created;
      if (hasFiles) {
        if (state.files.length > 3) {
          dispatch({ type: "submitFailed", message: "You can upload at most 3 files." });
          return;
        }

        const { urls } = await uploadSubmissionFiles(state.files);
        created = await submitAssessmentWithFiles({
          assessmentId: state.selectedAssessmentId,
          fileUrls: urls,
        });
      } else {
        created = await submitAssessment({
          assessmentId: state.selectedAssessmentId,
          fileUrl: state.fileUrl,
        });
      }

      setMySubmission(created);
      dispatch({
        type: "submitted",
        message: mySubmission ? "Resubmitted successfully." : "Submitted successfully.",
      });
    } catch (e) {
      const msg = e?.response?.data?.message;
      dispatch({ type: "submitFailed", message: msg || "Submission failed." });
    } finally {
      refreshMySubmission();
    }
  };

  return (
    <div className="grid grid2">
      <ProjectSelector
        selectedProjectId={state.selectedProjectId}
        onSelect={(project) =>
          dispatch({ type: "selectProject", projectId: project?._id || "" })
        }
      />

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Dedicated Submission Portal</p>
            <p className="cardHint">Upload, edit, and resubmit before deadline</p>
          </div>
        </div>

        <AssessmentList
          assessments={assessments}
          loading={loadingAssessments}
          error={assessmentError}
          disabled={!selectedProject?._id}
          selectedAssessmentId={state.selectedAssessmentId}
          onSelect={(id) => dispatch({ type: "selectAssessment", assessmentId: id })}
          selectedAssessment={selectedAssessment}
          helper={!selectedProject?._id ? "Select a project first." : ""}
        />

        {loadingMySubmission && state.selectedAssessmentId && (
          <p className="helper">Checking your submission…</p>
        )}

        <ErrorMessage message={mySubmissionError || state.submitError} />

        {mySubmission && (
          <div className="card" style={{ marginTop: 12, padding: 12 }}>
            <p className="cardTitle" style={{ margin: 0 }}>Current Submission</p>
            <p className="helper" style={{ marginTop: 6 }}>
              Latest: {new Date(mySubmission.lastSubmittedAt || mySubmission.submittedAt || mySubmission.createdAt).toLocaleString()}
            </p>
            <p className="helper">Attempts: {mySubmission.attemptCount || 1}</p>
            <p className="helper">Status: {mySubmission.status || "submitted"}</p>
            {!canResubmit && (
              <p className="helper">Deadline passed or unavailable. Resubmission closed.</p>
            )}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <SubmissionForm
            selectedProject={selectedProject}
            selectedAssessment={selectedAssessment}
            selectedAssessmentId={state.selectedAssessmentId}
            fileUrl={state.fileUrl}
            onChangeFileUrl={(value) => dispatch({ type: "setFileUrl", value })}
            files={state.files}
            onChangeFiles={(fileList) =>
              dispatch({
                type: "setFiles",
                files: fileList ? Array.from(fileList).slice(0, 10) : [],
              })
            }
            onSubmit={onSubmit}
            submitting={state.submitting}
            alreadySubmitted={Boolean(mySubmission)}
            allowResubmit={canResubmit}
          />
        </div>

        {state.submitMsg && <p className="helper">{state.submitMsg}</p>}
      </div>
    </div>
  );
};

export default StudentSubmissionPage;
