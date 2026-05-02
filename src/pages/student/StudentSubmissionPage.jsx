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
  const hasAnyGrade =
    Boolean(mySubmission?.marks !== null && mySubmission?.marks !== undefined) ||
    (Array.isArray(mySubmission?.grades) && mySubmission.grades.length > 0) ||
    mySubmission?.status === "graded";
  const canResubmit =
    Boolean(mySubmission) &&
    Boolean(effectiveDeadline) &&
    !hasAnyGrade &&
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

      <section className="card studentOverviewCard studentSubmissionPortal" aria-labelledby="submission-portal-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Hand-in</p>
            <h2 id="submission-portal-heading" className="cardTitle">
              Submission portal
            </h2>
            <p className="cardHint">Upload or link your work, then submit before the assessment deadline.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          <div className="studentSubmissionSection">
            <AssessmentList
              className="studentSubmissionAssess"
              selectId="submission-assessment-select"
              assessments={assessments}
              loading={loadingAssessments}
              error={assessmentError}
              disabled={!selectedProject?._id}
              selectedAssessmentId={state.selectedAssessmentId}
              onSelect={(id) => dispatch({ type: "selectAssessment", assessmentId: id })}
              selectedAssessment={selectedAssessment}
              helper={!selectedProject?._id ? "Select a project first." : ""}
            />
          </div>

          {loadingMySubmission && state.selectedAssessmentId ? (
            <p className="studentOverviewStatus studentSubmissionSection" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Checking your submission…
            </p>
          ) : null}

          <ErrorMessage message={mySubmissionError || state.submitError} />

          {mySubmission ? (
            <article className="studentSubmissionCurrent">
              <h3 className="studentSubmissionCurrent__title">Current submission</h3>
              <dl className="studentSubmissionCurrent__dl">
                <div className="studentSubmissionCurrent__row">
                  <dt>Last sent</dt>
                  <dd>
                    {new Date(
                      mySubmission.lastSubmittedAt || mySubmission.submittedAt || mySubmission.createdAt
                    ).toLocaleString()}
                  </dd>
                </div>
                <div className="studentSubmissionCurrent__row">
                  <dt>Attempts</dt>
                  <dd>{mySubmission.attemptCount || 1}</dd>
                </div>
                <div className="studentSubmissionCurrent__row">
                  <dt>Status</dt>
                  <dd>
                    <span className="studentStatusPill">{mySubmission.status || "submitted"}</span>
                  </dd>
                </div>
              </dl>
              {hasAnyGrade ? (
                <p className="studentSubmissionCurrent__note">Resubmission is closed because this work has been graded.</p>
              ) : !canResubmit ? (
                <p className="studentSubmissionCurrent__note">The deadline has passed or resubmission is not available.</p>
              ) : null}
            </article>
          ) : null}

          <div className="studentSubmissionSection studentSubmissionSection--form">
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

          {state.submitMsg ? (
            <p className="studentOverviewBanner studentOverviewBanner--success studentSubmissionBanner">{state.submitMsg}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default StudentSubmissionPage;
