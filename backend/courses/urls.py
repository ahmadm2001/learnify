from django.urls import path
from .views import (
    AdminCourseListView,
    AdminDeleteCourseView,
    AssessmentAttemptStatusView,
    AssessmentGradingView,
    AssessmentStatusView,
    AssessmentSubmissionsView,
    AssessmentUpdateView,
    CourseListView,
    CourseDetailView,
    CourseListCreateView,
    AddToCartView,
    CartListView,
    CartItemDeleteView,
    DeleteAssignmentView,
    DeleteCourseSectionView,
    DeleteLectureFileView,
    DeleteLectureView,
    DeleteScheduledSessionView,
    EditLectureView,
    EndLiveLectureView,
    EnrollRequestView,
    ApproveEnrollmentView,
    GradeAnswerView,
    InstructorAssignmentsView,
    InstructorQuizListView,
    InstructorScheduledLecturesView,
    JoinLiveLectureView,
    LectureDetailView,
    PendingEnrollmentsView,
    ScheduleLectureView,
    StartLiveLectureView,
    StudentAssignmentDetailView,
    UnsubmitAssignmentView,
    UpdateAssignmentView,
    UpdateScheduledSessionView,
    UploadLectureFileView,
    my_enrolled_courses,
    UploadCourseResourceView,
    CourseResourcesView,
    CourseCurriculumView,
    AddCourseSectionView,
    AddLectureView,
    AssessmentCreateView,
    AssessmentByLectureView,
    SubmitAttemptView,
    StartAttemptView,
    AssessmentDetailView,
    CreateAssignmentView,
    CourseAssignmentsView,
    SubmitAssignmentView,
    AssignmentSubmissionsView,
    GradeSubmissionView,
    StudentAssignmentsView,
    PaymentSuccessView,
    CourseChatbotView,
    CourseReviewCreateUpdateView,
    CourseReviewListView,
    MyCourseReviewView,
    CourseReviewDeleteView,
)

urlpatterns = [
    # =====================================================
    # 🛠 ADMIN COURSES
    # =====================================================
    path("admin/courses/", AdminCourseListView.as_view()),
    path("admin/courses/<int:pk>/delete/", AdminDeleteCourseView.as_view()),
    # =====================================================
    # 👩‍🏫 TEACHER / ADMIN — COURSE MANAGEMENT
    # =====================================================
    path("manage/", CourseListCreateView.as_view()),
    path("ai/chat/", CourseChatbotView.as_view(), name="course-ai-chat"),
    # =====================================================
    # 🛒 CART
    # =====================================================
    path("cart/add/<int:pk>/", AddToCartView.as_view()),
    path("cart/", CartListView.as_view()),
    path("cart/item/<int:pk>/", CartItemDeleteView.as_view()),
    # =====================================================
    # 🎓 ENROLLMENT
    # =====================================================
    path("enroll/<int:pk>/", EnrollRequestView.as_view()),
    path(
        "enroll/approve/<int:course_id>/<int:student_id>/",
        ApproveEnrollmentView.as_view(),
    ),
    path("enroll/pending/", PendingEnrollmentsView.as_view()),
    path("enroll/my-courses/", my_enrolled_courses),
    # =====================================================
    # 📂 COURSE RESOURCES (PDFs)
    # =====================================================
    path("courses/<int:pk>/resources/", CourseResourcesView.as_view()),
    path("courses/<int:pk>/resources/upload/", UploadCourseResourceView.as_view()),
    path("courses/<int:course_id>/review/", CourseReviewCreateUpdateView.as_view()),
    path("courses/<int:course_id>/reviews/", CourseReviewListView.as_view()),
    path("courses/<int:course_id>/my-review/", MyCourseReviewView.as_view()),
    path("courses/<int:course_id>/review/delete/", CourseReviewDeleteView.as_view()),
    # =====================================================
    # 🌍 PUBLIC COURSES
    # =====================================================
    path("courses/", CourseListView.as_view()),
    path("courses/<int:pk>/", CourseDetailView.as_view()),
    # =====================================================
    # 💰 PAYMENT
    # =====================================================
    path("payment/success/<int:course_id>/", PaymentSuccessView.as_view()),
    # =====================================================
    # 📚 CURRICULUM (Sections + Lectures)
    # =====================================================
    path("courses/<int:pk>/curriculum/", CourseCurriculumView.as_view()),
    path("courses/<int:pk>/sections/add/", AddCourseSectionView.as_view()),
    path("sections/<int:section_id>/lectures/add/", AddLectureView.as_view()),
    path("courses/sections/<int:pk>/delete/", DeleteCourseSectionView.as_view()),
    path("lectures/<int:lecture_id>/edit/", EditLectureView.as_view()),
    path("lectures/<int:lecture_id>/delete/", DeleteLectureView.as_view()),
    path("lectures/<int:lecture_id>/start-live/", StartLiveLectureView.as_view()),
    path("lectures/<int:lecture_id>/end-live/", EndLiveLectureView.as_view()),
    path("lectures/<int:pk>/", LectureDetailView.as_view()),
    path("lectures/<int:lecture_id>/join-live/", JoinLiveLectureView.as_view()),
    path("lectures/<int:lecture_id>/schedule/", ScheduleLectureView.as_view()),
    path("instructor/scheduled/", InstructorScheduledLecturesView.as_view()),
    path(
        "lectures/<int:lecture_id>/delete-session/",
        DeleteScheduledSessionView.as_view(),
    ),
    path(
        "lectures/<int:lecture_id>/update-session/",
        UpdateScheduledSessionView.as_view(),
    ),
    # =====================================================
    # 🧠 QUIZ / ASSESSMENTS
    # =====================================================
    # Instructor creates a quiz
    path("assessments/", AssessmentCreateView.as_view()),
    # Get quiz list by lecture
    path("lectures/<int:lecture_id>/assessments/", AssessmentByLectureView.as_view()),
    # 👨‍🎓 Student fetches quiz details
    path("assessments/<int:pk>/", AssessmentDetailView.as_view()),
    # 👩‍🏫 Teacher updates quiz
    path("assessments/<int:pk>/edit/", AssessmentUpdateView.as_view()),
    # 🎯 Student starts quiz attempt
    path("assessments/<int:assessment_id>/start/", StartAttemptView.as_view()),
    # 📤 Student submits quiz
    path("attempts/<int:attempt_id>/submit/", SubmitAttemptView.as_view()),
    # 📊 Student attempt status (simple)
    path(
        "assessments/<int:assessment_id>/status/", AssessmentAttemptStatusView.as_view()
    ),
    # 📈 Student attempt status (detailed)
    path(
        "assessments/<int:assessment_id>/full-status/", AssessmentStatusView.as_view()
    ),
    # =====================================================
    # 📝 ASSIGNMENTS
    # =====================================================
    # 👩‍🏫 Teacher creates assignment for a lecture
    path("lectures/<int:lecture_id>/assignments/", CreateAssignmentView.as_view()),
    # 👨‍🎓 Student sees all assignments for a course
    path("courses/<int:course_id>/assignments/", CourseAssignmentsView.as_view()),
    path("student/assignments/", StudentAssignmentsView.as_view()),
    # 👨‍🎓 Student submits assignment
    path("assignments/<int:assignment_id>/submit/", SubmitAssignmentView.as_view()),
    path("assignments/<int:assignment_id>/unsubmit/", UnsubmitAssignmentView.as_view()),
    path(
        "student/assignments/<int:assignment_id>/",
        StudentAssignmentDetailView.as_view(),
    ),
    # 👩‍🏫 Teacher views student submissions
    path(
        "assignments/<int:assignment_id>/submissions/",
        AssignmentSubmissionsView.as_view(),
    ),
    # 👩‍🏫 Teacher grades a submission
    path("submissions/<int:submission_id>/grade/", GradeSubmissionView.as_view()),
    path("instructor/assignments/", InstructorAssignmentsView.as_view()),
    path("assignments/<int:assignment_id>/edit/", UpdateAssignmentView.as_view()),
    path("assignments/<int:assignment_id>/delete/", DeleteAssignmentView.as_view()),
    path(
        "lectures/<int:lecture_id>/files/upload/",
        UploadLectureFileView.as_view(),
    ),
    path(
        "lecture-files/<int:file_id>/delete/",
        DeleteLectureFileView.as_view(),
    ),
    path("answers/<int:answer_id>/grade/", GradeAnswerView.as_view()),
    path("assessments/<int:assessment_id>/grading/", AssessmentGradingView.as_view()),
    path("instructor/quizzes/", InstructorQuizListView.as_view()),
    path(
        "assessments/<int:assessment_id>/submissions/",
        AssessmentSubmissionsView.as_view(),
    ),
]
