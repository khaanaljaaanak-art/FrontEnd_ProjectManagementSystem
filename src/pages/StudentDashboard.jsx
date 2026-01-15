import { useMemo, useReducer } from "react";
import Layout from "../components/Layout";
import {
  submitAssessment,
  submitAssessmentWithFiles,
  uploadSubmissionFiles,
} from "../services/submissionService";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useAssessments } from "../hooks/useAssessments";
import { useMySubmission } from "../hooks/useMySubmission";
import ProjectSelector from "../components/dashboard/ProjectSelector";
import AssessmentList from "../components/dashboard/AssessmentList";
import SubmissionForm from "../components/dashboard/SubmissionForm";
import ErrorMessage from "../components/common/ErrorMessage";

const StudentDashboard = () => {
  const { role } = useAuth();
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

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!state.selectedAssessmentId) {
      dispatch({ type: "submitFailed", message: "Select an assessment first." });
      return;
    }

    if (mySubmission) {
      dispatch({
        type: "submitFailed",
        message: "You have already submitted for this assessment.",
      });
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

      if (hasFiles) {
        if (state.files.length > 3) {
          dispatch({ type: "submitFailed", message: "You can upload at most 3 files." });
          return;
        }

        const { urls } = await uploadSubmissionFiles(state.files);
        const created = await submitAssessmentWithFiles({
          assessmentId: state.selectedAssessmentId,
          fileUrls: urls,
        });
        setMySubmission(created);
        dispatch({ type: "submitted", message: "Submitted successfully." });
      } else {
        const created = await submitAssessment({
          assessmentId: state.selectedAssessmentId,
          fileUrl: state.fileUrl,
        });
        setMySubmission(created);
        dispatch({ type: "submitted", message: "Submitted successfully." });
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (status === 409) {
        dispatch({
          type: "submitFailed",
          message: msg || "You already submitted for this assessment.",
        });
      } else if (status === 400) {
        dispatch({
          type: "submitFailed",
          message: msg || "Submission not allowed (check deadline).",
        });
      } else {
        dispatch({ type: "submitFailed", message: msg || "Submission failed." });
      }
    } finally {
      refreshMySubmission();
    }
  };

  return (
    <Layout
      title="Student Dashboard"
      subtitle="Pick a project, view assessments, and submit your work"
    >
      {role !== "student" && (
        <div className="card">
          <p className="helper">This page is designed for student accounts.</p>
        </div>
      )}

      {role === "student" && (
        <div className="grid grid2">
        <ProjectSelector
          selectedProjectId={state.selectedProjectId}
          onSelect={(p) =>
            dispatch({ type: "selectProject", projectId: p?._id || "" })
          }
        />

        <div className="card">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Submit Assessment</p>
              <p className="cardHint">Submit using a file URL (Drive/GitHub/etc.)</p>
            </div>
          </div>

          <div className="row" style={{ marginBottom: 12 }}>
            <AssessmentList
              assessments={assessments}
              loading={loadingAssessments}
              error={assessmentError}
              disabled={!selectedProject?._id}
              selectedAssessmentId={state.selectedAssessmentId}
              onSelect={(id) => dispatch({ type: "selectAssessment", assessmentId: id })}
              selectedAssessment={selectedAssessment}
              helper={!selectedProject?._id ? "Select a project from the left." : ""}
            />
          </div>

          {loadingMySubmission && state.selectedAssessmentId && (
            <p className="helper">Checking your submission…</p>
          )}
          <ErrorMessage message={mySubmissionError} />

          {mySubmission && (
            <div className="card" style={{ marginTop: 12, padding: 12 }}>
              <p className="cardTitle" style={{ margin: 0 }}>Your Submission</p>
              <p className="helper" style={{ marginTop: 6 }}>
                Submitted: {new Date(mySubmission.submittedAt || mySubmission.createdAt).toLocaleString()}
              </p>
              {(() => {
                const urls =
                  Array.isArray(mySubmission.fileUrls) && mySubmission.fileUrls.length > 0
                    ? mySubmission.fileUrls
                    : mySubmission.fileUrl
                      ? [mySubmission.fileUrl]
                      : [];

                return (
                  <div className="helper" style={{ marginTop: 6 }}>
                    Files:{" "}
                    {urls.map((url, idx) => (
                      <span key={url}>
                        <a href={url} target="_blank" rel="noreferrer">
                          Open {idx + 1}
                        </a>
                        {idx < urls.length - 1 ? " · " : ""}
                      </span>
                    ))}
                  </div>
                );
              })()}
              {mySubmission.marks !== null && mySubmission.marks !== undefined && (
                <p className="helper" style={{ marginTop: 6 }}>
                  Marks: {mySubmission.marks}
                </p>
              )}
              {mySubmission.feedback && (
                <p className="helper" style={{ marginTop: 6 }}>
                  Feedback: {mySubmission.feedback}
                </p>
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
            />
          </div>

          {state.submitError && <ErrorMessage message={state.submitError} />}
          {state.submitMsg && <p className="helper">{state.submitMsg}</p>}
        </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentDashboard;
