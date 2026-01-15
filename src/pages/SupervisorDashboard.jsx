import { useMemo, useReducer, useState } from "react";
import Layout from "../components/Layout";
import { createProject } from "../services/projectService";
import { createAssessment } from "../services/assessmentService";
import {
  gradeSubmission,
} from "../services/submissionService";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useAssessments } from "../hooks/useAssessments";
import { useSubmissions } from "../hooks/useSubmissions";
import ProjectSelector from "../components/dashboard/ProjectSelector";
import AssessmentList from "../components/dashboard/AssessmentList";
import SubmissionTable from "../components/dashboard/SubmissionTable";
import CreateProjectForm from "../components/dashboard/CreateProjectForm";
import CreateAssessmentForm from "../components/dashboard/CreateAssessmentForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ErrorMessage from "../components/common/ErrorMessage";

const SupervisorDashboard = () => {
  const { role } = useAuth();
  const { projects, refreshProjects } = useProjects();

  const initialState = {
    selectedProjectId: "",
    selectedAssessmentId: "",
    newProject: { title: "", description: "" },
    newAssessment: { title: "", deadline: "" },
    grading: {},
    messages: { project: "", assessment: "" },
    errors: { project: "", assessment: "", submission: "" },
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "selectProject":
        return {
          ...state,
          selectedProjectId: action.projectId,
          selectedAssessmentId: "",
          errors: { ...state.errors, assessment: "", submission: "" },
          messages: { ...state.messages, assessment: "" },
        };
      case "selectAssessment":
        return {
          ...state,
          selectedAssessmentId: action.assessmentId,
          errors: { ...state.errors, submission: "" },
        };
      case "setNewProject":
        return { ...state, newProject: action.value };
      case "setNewAssessment":
        return { ...state, newAssessment: action.value };
      case "setGradingDraft":
        return {
          ...state,
          grading: { ...state.grading, [action.submissionId]: action.value },
        };
      case "setMessage":
        return { ...state, messages: { ...state.messages, ...action.value } };
      case "setError":
        return { ...state, errors: { ...state.errors, ...action.value } };
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
    refresh: refreshAssessments,
  } = useAssessments(state.selectedProjectId);

  const selectedAssessment = useMemo(
    () => assessments.find((a) => a._id === state.selectedAssessmentId) || null,
    [assessments, state.selectedAssessmentId]
  );

  const {
    submissions,
    loading: loadingSubmissions,
    error: submissionError,
    refresh: refreshSubmissions,
    setSubmissions,
  } = useSubmissions(state.selectedAssessmentId);

  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [gradingBusy, setGradingBusy] = useState(false);

  const [confirm, setConfirm] = useState({ open: false, kind: "", payload: null });

  const onCreateProject = async (e) => {
    e.preventDefault();
    dispatch({ type: "setMessage", value: { project: "" } });
    dispatch({ type: "setError", value: { project: "" } });

    setConfirm({ open: true, kind: "createProject", payload: null });
  };

  const onCreateAssessment = async (e) => {
    e.preventDefault();
    dispatch({ type: "setMessage", value: { assessment: "" } });
    dispatch({ type: "setError", value: { assessment: "" } });

    if (!selectedProject?._id) {
      dispatch({ type: "setError", value: { assessment: "Select a project first." } });
      return;
    }

    setConfirm({ open: true, kind: "createAssessment", payload: null });
  };

  const onGrade = async (submissionId) => {
    const draft = state.grading[submissionId] || { marks: "", feedback: "" };
    const marksNumber = draft.marks === "" ? null : Number(draft.marks);
    if (marksNumber === null || Number.isNaN(marksNumber)) {
      dispatch({ type: "setError", value: { submission: "Enter valid marks to grade." } });
      return;
    }

    dispatch({ type: "setError", value: { submission: "" } });
    setConfirm({ open: true, kind: "gradeSubmission", payload: { submissionId } });
  };

  const runConfirmed = async () => {
    if (!confirm.open) return;

    if (confirm.kind === "createProject") {
      setCreatingProject(true);
      try {
        await createProject({
          title: state.newProject.title.trim(),
          description: state.newProject.description.trim(),
        });
        dispatch({ type: "setNewProject", value: { title: "", description: "" } });
        dispatch({ type: "setMessage", value: { project: "Project created." } });
        await refreshProjects();
      } catch (e) {
        dispatch({ type: "setError", value: { project: "Failed to create project." } });
      } finally {
        setCreatingProject(false);
        setConfirm({ open: false, kind: "", payload: null });
      }
      return;
    }

    if (confirm.kind === "createAssessment") {
      if (!selectedProject?._id) {
        dispatch({ type: "setError", value: { assessment: "Select a project first." } });
        setConfirm({ open: false, kind: "", payload: null });
        return;
      }

      setCreatingAssessment(true);
      try {
        await createAssessment({
          projectId: selectedProject._id,
          title: state.newAssessment.title.trim(),
          deadline: state.newAssessment.deadline,
        });
        dispatch({ type: "setNewAssessment", value: { title: "", deadline: "" } });
        dispatch({ type: "setMessage", value: { assessment: "Assessment created." } });
        await refreshAssessments();
      } catch (e) {
        dispatch({
          type: "setError",
          value: { assessment: "Failed to create assessment." },
        });
      } finally {
        setCreatingAssessment(false);
        setConfirm({ open: false, kind: "", payload: null });
      }
      return;
    }

    if (confirm.kind === "gradeSubmission") {
      const submissionId = confirm.payload?.submissionId;
      const draft = state.grading[submissionId] || { marks: "", feedback: "" };
      const marksNumber = draft.marks === "" ? null : Number(draft.marks);
      if (marksNumber === null || Number.isNaN(marksNumber)) {
        dispatch({ type: "setError", value: { submission: "Enter valid marks to grade." } });
        setConfirm({ open: false, kind: "", payload: null });
        return;
      }

      setGradingBusy(true);
      try {
        const updated = await gradeSubmission(submissionId, {
          marks: marksNumber,
          feedback: draft.feedback || "",
        });
        setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      } catch (e) {
        dispatch({ type: "setError", value: { submission: "Failed to grade submission." } });
      } finally {
        setGradingBusy(false);
        setConfirm({ open: false, kind: "", payload: null });
        refreshSubmissions();
      }
    }
  };

  return (
    <Layout
      title="Supervisor Dashboard"
      subtitle="Follow the steps: project → assessments → submissions"
    >
      {role !== "supervisor" && (
        <div className="card">
          <p className="helper">This page is designed for supervisor accounts.</p>
        </div>
      )}

      {role === "supervisor" && (
        <div className="workflow">
          <section>
            <div className="workflowHeader">
              <div>
                <div className="workflowHeaderLeft">
                  <span className="stepBadge">Step 1</span>
                  <h2 className="workflowTitle">Select or Create a Project</h2>
                </div>
                <p className="workflowHint">
                  Create a project if needed, then select it to manage assessments and submissions.
                </p>
              </div>
            </div>

            <div className="grid grid2" style={{ marginTop: 12 }}>
              <ProjectSelector
                selectedProjectId={state.selectedProjectId}
                onSelect={(p) =>
                  dispatch({ type: "selectProject", projectId: p?._id || "" })
                }
              />

              <CreateProjectForm
                draft={state.newProject}
                onChange={(value) => dispatch({ type: "setNewProject", value })}
                onSubmit={onCreateProject}
                submitting={creatingProject}
                message={state.messages.project}
                error={state.errors.project}
              />
            </div>
          </section>

          <hr className="divider" />

          <section>
            <div className="workflowHeader">
              <div>
                <div className="workflowHeaderLeft">
                  <span className="stepBadge">Step 2</span>
                  <h2 className="workflowTitle">Create Assessments for the Selected Project</h2>
                </div>
                <p className="workflowHint">
                  Assessments are always created under the currently selected project.
                </p>
              </div>
            </div>

            <div className="grid grid2" style={{ marginTop: 12 }}>
              <CreateAssessmentForm
                selectedProject={selectedProject}
                draft={state.newAssessment}
                onChange={(value) => dispatch({ type: "setNewAssessment", value })}
                onSubmit={onCreateAssessment}
                submitting={creatingAssessment}
                message={state.messages.assessment}
                error={state.errors.assessment || assessmentError}
                loadingAssessments={loadingAssessments}
                assessmentsEmpty={assessments.length === 0}
              />

              <div className="card">
                <div className="cardHeader">
                  <div>
                    <p className="cardTitle">Current Selection</p>
                    <p className="cardHint">This is the project you’re working on</p>
                  </div>
                </div>

                {!selectedProject?._id ? (
                  <p className="helper" style={{ margin: 0 }}>
                    No project selected. Complete Step 1.
                  </p>
                ) : (
                  <div>
                    <p className="itemTitle" style={{ margin: 0 }}>
                      {selectedProject.title}
                    </p>
                    <p className="itemMeta">{selectedProject.description}</p>
                    <p className="helper" style={{ margin: 0 }}>
                      Next: create an assessment, then proceed to Step 3.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <hr className="divider" />

          <section>
            <div className="workflowHeader">
              <div>
                <div className="workflowHeaderLeft">
                  <span className="stepBadge">Step 3</span>
                  <h2 className="workflowTitle">View and Grade Student Submissions</h2>
                </div>
                <p className="workflowHint">
                  Select an assessment to view submissions, then enter marks and feedback.
                </p>
              </div>
            </div>

            <div className="grid grid2" style={{ marginTop: 12 }}>
              <div className="card">
                <div className="cardHeader">
                  <div>
                    <p className="cardTitle">Select Assessment</p>
                    <p className="cardHint">Choose an assessment under the selected project</p>
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
                  helper={!selectedProject?._id ? "Complete Step 1 first." : ""}
                />
              </div>

              <div className="card">
                <div className="cardHeader">
                  <div>
                    <p className="cardTitle">Submissions</p>
                    <p className="cardHint">Review and save grades for each student</p>
                  </div>
                </div>

                {!state.selectedAssessmentId && (
                  <p className="helper" style={{ margin: 0 }}>
                    Select an assessment to load submissions.
                  </p>
                )}

                <ErrorMessage message={state.errors.submission || submissionError} />
                {loadingSubmissions && <p className="helper">Loading submissions…</p>}

                {!loadingSubmissions && state.selectedAssessmentId && submissions.length === 0 && (
                  <p className="helper">No submissions yet for this assessment.</p>
                )}

                <SubmissionTable
                  submissions={submissions}
                  grading={state.grading}
                  onChangeDraft={(submissionId, value) =>
                    dispatch({ type: "setGradingDraft", submissionId, value })
                  }
                  onSave={onGrade}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={
          confirm.kind === "createProject"
            ? "Create this project?"
            : confirm.kind === "createAssessment"
              ? "Create this assessment?"
              : "Save grade changes?"
        }
        message={
          confirm.kind === "createProject"
            ? "Please confirm you want to create this project."
            : confirm.kind === "createAssessment"
              ? "Please confirm you want to create this assessment."
              : "Please confirm you want to save marks and feedback."
        }
        confirmLabel={
          confirm.kind === "createProject"
            ? "Create Project"
            : confirm.kind === "createAssessment"
              ? "Create Assessment"
              : "Save Grade"
        }
        busy={creatingProject || creatingAssessment || gradingBusy}
        onCancel={() => setConfirm({ open: false, kind: "", payload: null })}
        onConfirm={runConfirmed}
      />
    </Layout>
  );
};

export default SupervisorDashboard;
