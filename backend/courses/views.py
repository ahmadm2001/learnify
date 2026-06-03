from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from core.models import Course
import requests
from django.conf import settings
from django.db.models import Avg
from .models import (
    Answer,
    Assessment,
    Assignment,
    AssignmentSubmission,
    Attempt,
    CartItem,
    Choice,
    CourseSection,
    Enrollment,
    CourseResource,
    Lecture,
    LectureFile,
    Question,
    CourseReview,
)
from .serializers import (
    AdminCourseSerializer,
    AssessmentSerializer,
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
    CartItemSerializer,
    CourseListSerializer,
    CourseSerializer,
    CourseResourceSerializer,
    LectureSerializer,
    CourseReviewSerializer,
)


def get_zoom_access_token():
    url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={settings.ZOOM_ACCOUNT_ID}"

    response = requests.post(
        url, auth=(settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)
    )

    return response.json().get("access_token")


def create_zoom_meeting(topic):
    access_token = get_zoom_access_token()

    url = "https://api.zoom.us/v2/users/me/meetings"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    data = {
        "topic": topic,
        "type": 2,
    }

    response = requests.post(url, json=data, headers=headers)

    print("ZOOM RESPONSE:", response.json())  # 👈 ADD THIS

    return response.json()


# =====================================================
# PERMISSIONS
# =====================================================


class IsTeacherApproved(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, "profile", None)
        if not profile:
            return False
        return profile.role in ("TEACHER_APPROVED", "ADMIN")


# =====================================================
# COURSES
# =====================================================


class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherApproved]

    def get_queryset(self):
        profile = getattr(self.request.user, "profile", None)
        if profile and profile.role == "ADMIN":
            return Course.objects.all()
        return Course.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


from django.db.models import Q
from urllib.parse import unquote


class CourseListView(APIView):
    permission_classes = []

    def get(self, request):
        qs = Course.objects.all().order_by("-created_at")

        search = request.query_params.get("search", "")
        search = unquote(search).strip()

        print("🔥 FINAL SEARCH:", repr(search))

        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(teacher__username__icontains=search)
                | Q(teacher__first_name__icontains=search)
                | Q(teacher__last_name__icontains=search)
            )

        serializer = CourseListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class CourseDetailView(APIView):
    """
    Course details (video + enrollment check)
    PDFs are NOT returned here
    """

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        serializer = CourseSerializer(course, context={"request": request})
        return Response(serializer.data)


# =====================================================
# 📚 COURSE CURRICULUM (SECTIONS + LECTURES)
# =====================================================
class CourseCurriculumView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        user = request.user

        # teacher/admin can see all
        if user.is_authenticated and (
            user == course.teacher
            or (getattr(user, "profile", None) and user.profile.role == "ADMIN")
        ):
            approved = True

        # approved student
        elif user.is_authenticated:
            approved = Enrollment.objects.filter(
                student=user,
                course=course,
                status="APPROVED",
            ).exists()

        # guest user
        else:
            approved = False

        sections = CourseSection.objects.filter(course=course).prefetch_related(
            "lectures"
        )

        response_data = []

        for index, section in enumerate(sections):
            lectures = section.lectures.all()

            lectures_data = LectureSerializer(
                lectures,
                many=True,
                context={"request": request},
            ).data

            for i, lec in enumerate(lectures):
                locked = False

                if not approved:
                    if index != 0:
                        locked = True

                lectures_data[i]["locked"] = locked

            response_data.append(
                {
                    "id": section.id,
                    "title": section.title,
                    "order": section.order,
                    "lectures": lectures_data,
                }
            )

        return Response(response_data)


# =====================================================
# ✅ COURSE RESOURCES (PDFs)
# =====================================================


class CourseResourcesView(APIView):
    """
    GET /api/courses/<id>/resources/
    Only APPROVED students can see PDFs
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        is_approved = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status="APPROVED",
        ).exists()

        if not is_approved:
            return Response([], status=200)

        resources = CourseResource.objects.filter(course=course).order_by(
            "-uploaded_at"
        )

        serializer = CourseResourceSerializer(
            resources,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


# =====================================================
# CART
# =====================================================


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        # 🔥 BLOCK if already purchased
        already_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status="APPROVED",
        ).exists()

        if already_enrolled:
            return Response(
                {"message": "You already own this course"},
                status=400,
            )

        if CartItem.objects.filter(user=request.user, course=course).exists():
            return Response({"message": "Already in cart"}, status=200)

        CartItem.objects.create(user=request.user, course=course)
        return Response({"message": "Added to cart"}, status=201)


class CartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user).select_related("course")

        serializer = CartItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)


class CartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        item = get_object_or_404(CartItem, pk=pk, user=request.user)
        item.delete()
        return Response(status=204)


# =====================================================
# ENROLLMENT
# =====================================================


class EnrollRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )

        if not created:
            return Response({"detail": f"Already {enrollment.status.lower()}"})

        return Response({"detail": "Enrollment request sent"}, status=201)


class ApproveEnrollmentView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, course_id, student_id):
        course = get_object_or_404(Course, pk=course_id)

        if course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        enrollment = Enrollment.objects.filter(
            course=course,
            student_id=student_id,
            status="PENDING",
        ).first()

        if not enrollment:
            return Response({"detail": "No pending enrollment"}, status=404)

        enrollment.status = "APPROVED"
        enrollment.save()

        return Response({"detail": "Student approved"})


class PendingEnrollmentsView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request):
        courses = Course.objects.filter(teacher=request.user)

        enrollments = Enrollment.objects.filter(
            course__in=courses,
            status="PENDING",
        ).select_related("student", "course")

        data = [
            {
                "id": e.id,
                "student_id": e.student.id,
                "student_name": e.student.username,
                "course_id": e.course.id,
                "course_title": e.course.title,
                "status": e.status,
            }
            for e in enrollments
        ]

        return Response(data)


# =====================================================
# STUDENT — MY COURSES
# =====================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_enrolled_courses(request):
    enrollments = Enrollment.objects.filter(
        student=request.user,
        status="APPROVED",
    ).select_related("course")

    data = [
        {
            "course_id": e.course.id,
            "title": e.course.title,
            "description": e.course.description,
            "teacher_name": e.course.teacher.username,
        }
        for e in enrollments
    ]

    return Response(data)


# =====================================================
# TEACHER — UPLOAD PDF
# =====================================================


class UploadCourseResourceView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        if course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        file = request.FILES.get("file")
        title = request.data.get("title")

        if not file:
            return Response({"detail": "File required"}, status=400)

        CourseResource.objects.create(
            course=course,
            title=title or file.name,
            file=file,
        )

        return Response({"detail": "PDF uploaded"}, status=201)


# =====================================================
# 🧑‍🏫 TEACHER — ADD SECTION
# =====================================================
class AddCourseSectionView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        if course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        title = request.data.get("title")
        order = request.data.get("order", 0)

        if not title:
            return Response({"detail": "Title required"}, status=400)

        section = CourseSection.objects.create(course=course, title=title, order=order)

        return Response({"detail": "Section created", "id": section.id}, status=201)


# =====================================================
# 🎥 TEACHER — ADD LECTURE
# =====================================================
class AddLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, section_id):
        section = get_object_or_404(CourseSection, pk=section_id)
        course = section.course

        if course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        title = request.data.get("title")
        video = request.FILES.get("video")  # uploaded file
        video_url = request.data.get("video_url")  # YouTube link
        pdf = request.FILES.get("pdf")
        order = request.data.get("order", 0)
        is_preview = request.data.get("is_preview", "false").lower() == "true"
        duration = request.data.get("duration", "")

        # Title is required
        if not title:
            return Response({"detail": "Title required"}, status=400)

        # Must provide either video file OR video_url
        if not video and not video_url:
            return Response(
                {"detail": "Video file OR YouTube URL required"},
                status=400,
            )

        lecture = Lecture.objects.create(
            section=section,
            title=title,
            video=video if video else None,
            video_url=video_url if video_url else None,
            order=order,
            is_preview=is_preview,
            duration=duration,
            pdf=pdf,
        )

        return Response(
            {"detail": "Lecture added", "id": lecture.id},
            status=201,
        )


class DeleteCourseSectionView(APIView):
    permission_classes = [IsTeacherApproved]

    def delete(self, request, pk):
        section = get_object_or_404(CourseSection, pk=pk)

        if section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        section.delete()
        return Response({"detail": "Section deleted"}, status=204)


class EditLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def patch(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        lecture.title = request.data.get("title", lecture.title)

        if "video" in request.FILES:
            lecture.video = request.FILES["video"]

        if request.data.get("video_url"):
            lecture.video_url = request.data["video_url"]

        # ✅ THIS WAS MISSING
        if "pdf" in request.FILES:
            lecture.pdf = request.FILES["pdf"]

        lecture.save()
        return Response({"detail": "Lecture updated"})


class DeleteLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def delete(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        lecture.delete()
        return Response({"detail": "Lecture deleted"})


class AssessmentCreateView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request):
        serializer = AssessmentSerializer(data=request.data)

        if serializer.is_valid():
            assessment = serializer.save(created_by=request.user)

            lecture = assessment.lecture
            course = lecture.section.course

            # =========================
            # 🔥 EMAIL ALL STUDENTS
            # =========================
            try:
                students = Enrollment.objects.filter(
                    course=course, status="APPROVED"
                ).select_related("student")

                for enroll in students:
                    student = enroll.student

                    html_content = render_to_string(
                        "emails/quiz_created.html",
                        {
                            "username": student.username,
                            "course_title": course.title,
                            "quiz_title": assessment.title,
                        },
                    )

                    msg = EmailMultiAlternatives(
                        subject="New Quiz Available 📝",
                        body="New quiz available",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[student.email],
                    )

                    msg.attach_alternative(html_content, "text/html")
                    msg.send()

            except Exception as e:
                print("Quiz create email error:", e)

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


class AssessmentByLectureView(generics.ListAPIView):
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lecture_id = self.kwargs["lecture_id"]
        return Assessment.objects.filter(lecture_id=lecture_id)


class StartAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id)

        submitted_attempts = Attempt.objects.filter(
            assessment=assessment, student=request.user, submitted_at__isnull=False
        ).count()

        max_attempts = assessment.max_attempts

        if submitted_attempts >= max_attempts:
            last_attempt = (
                Attempt.objects.filter(
                    assessment=assessment,
                    student=request.user,
                    submitted_at__isnull=False,
                )
                .order_by("-submitted_at")
                .first()
            )

            return Response(
                {
                    "detail": "No attempts remaining",
                    "score": last_attempt.score if last_attempt else 0,
                    "submitted_at": last_attempt.submitted_at if last_attempt else None,
                },
                status=403,
            )

        attempt = Attempt.objects.create(assessment=assessment, student=request.user)

        return Response({"attempt_id": attempt.id})


from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Attempt, Question, Choice, Answer


class SubmitAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, attempt_id):
        attempt = get_object_or_404(Attempt, id=attempt_id, student=request.user)

        if attempt.submitted_at:
            return Response({"detail": "Already submitted"}, status=400)

        answers_data = request.data.get("answers")

        # ✅ Validation
        if not isinstance(answers_data, list) or len(answers_data) == 0:
            return Response(
                {"detail": "No answers received. Check frontend payload."},
                status=400,
            )

        total_score = 0
        has_text_questions = False

        # =========================
        # PROCESS ANSWERS
        # =========================
        for item in answers_data:
            question_id = item.get("question_id")
            if not question_id:
                continue

            question = get_object_or_404(
                Question, id=question_id, assessment=attempt.assessment
            )

            # =========================
            # MCQ
            # =========================
            if question.question_type == "MCQ":
                choice_id = item.get("choice_id")
                choice = None

                if choice_id:
                    choice = get_object_or_404(Choice, id=choice_id, question=question)

                Answer.objects.update_or_create(
                    attempt=attempt,
                    question=question,
                    defaults={
                        "selected_choice": choice,
                        "answer_text": "",
                    },
                )

                if choice and choice.is_correct:
                    total_score += question.marks

            # =========================
            # TEXT
            # =========================
            else:
                has_text_questions = True

                Answer.objects.update_or_create(
                    attempt=attempt,
                    question=question,
                    defaults={
                        "selected_choice": None,
                        "answer_text": item.get("answer_text", ""),
                    },
                )

        # =========================
        # FINALIZE ATTEMPT
        # =========================
        attempt.score = total_score
        attempt.submitted_at = timezone.now()

        if has_text_questions:
            attempt.status = "PENDING"
        else:
            attempt.status = "GRADED"
            attempt.graded_at = timezone.now()

        attempt.save()

        # =========================
        # 🔥 EMAIL TEACHER
        # =========================
        try:
            course = attempt.assessment.lecture.section.course
            teacher = course.teacher

            html_content = render_to_string(
                "emails/quiz_submitted.html",
                {
                    "teacher_name": teacher.username,
                    "student_name": request.user.username,
                    "quiz_title": attempt.assessment.title,
                    "course_title": course.title,
                    "score": total_score,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Quiz Submitted 📥",
                body="A student submitted a quiz",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[teacher.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("❌ Quiz submit email error:", e)

        # =========================
        # RESPONSE
        # =========================
        return Response(
            {
                "score": total_score,
                "status": attempt.status,
                "message": (
                    "Submitted. Waiting for instructor grading."
                    if attempt.status == "PENDING"
                    else "Submitted and auto-graded."
                ),
            },
            status=200,
        )


class AssessmentUpdateView(RetrieveUpdateAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsTeacherApproved]


# =====================================================
# 📘 STUDENT — VIEW QUIZ DETAIL (WITH QUESTIONS)
# =====================================================
from rest_framework.generics import RetrieveAPIView
from .serializers import AssessmentSerializer


class AssessmentDetailView(RetrieveAPIView):
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Teacher can see their own quizzes
        if hasattr(user, "profile") and user.profile.role in [
            "TEACHER_APPROVED",
            "ADMIN",
        ]:
            return Assessment.objects.all()

        # Students can only see quizzes of courses they are enrolled in
        return Assessment.objects.filter(
            lecture__section__course__enrollments__student=user,
            lecture__section__course__enrollments__status="APPROVED",
        )


# =====================================================
# 📊 CHECK STUDENT ATTEMPT STATUS
# =====================================================
class AssessmentAttemptStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id)

        attempt = (
            Attempt.objects.filter(
                assessment=assessment,
                student=request.user,
                submitted_at__isnull=False,  # ✅ only submitted
            )
            .order_by("-submitted_at")
            .first()
        )

        if not attempt:
            return Response({"attempted": False})

        return Response(
            {
                "attempted": True,
                "score": attempt.score,
                "submitted_at": attempt.submitted_at,
            }
        )


class AssessmentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id)

        attempts = Attempt.objects.filter(
            assessment=assessment, student=request.user, submitted_at__isnull=False
        ).order_by("-submitted_at")

        max_attempts = assessment.max_attempts
        attempts_used = attempts.count()
        remaining = max(max_attempts - attempts_used, 0)

        if attempts_used == 0:
            return Response(
                {
                    "attempted": False,
                    "status": "NOT_ATTEMPTED",
                    "remaining_attempts": max_attempts,
                    "max_attempts": max_attempts,
                    "attempts_used": 0,
                    "all_attempts_used": False,
                }
            )

        last_attempt = attempts.first()

        return Response(
            {
                "attempted": True,
                "status": last_attempt.status,  # 🔥 VERY IMPORTANT
                "score": last_attempt.score,
                "submitted_at": last_attempt.submitted_at,
                "remaining_attempts": remaining,
                "max_attempts": max_attempts,
                "attempts_used": attempts_used,
                # 🔥 ONLY TRUE IF GRADED + NO ATTEMPTS LEFT
                "all_attempts_used": remaining == 0,
            }
        )


class CreateAssignmentView(APIView):
    permission_classes = [IsTeacherApproved]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)
        course = lecture.section.course

        data = request.data.copy()
        data["lecture"] = lecture.id

        serializer = AssignmentSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            assignment = serializer.save()

            # =========================
            # 🔥 SEND EMAIL TO ALL STUDENTS
            # =========================
            try:
                students = Enrollment.objects.filter(
                    course=course, status="APPROVED"
                ).select_related("student")

                for enroll in students:
                    student = enroll.student

                    html_content = render_to_string(
                        "emails/assignment_created.html",
                        {
                            "username": student.username,
                            "course_title": course.title,
                            "assignment_title": assignment.title,
                            "due_date": assignment.due_date,
                        },
                    )

                    msg = EmailMultiAlternatives(
                        subject="New Assignment Added 📚",
                        body="New assignment available",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[student.email],
                    )

                    msg.attach_alternative(html_content, "text/html")
                    msg.send()

            except Exception as e:
                print("Assignment email error:", e)

            return Response(serializer.data, status=201)

        print(serializer.errors)
        return Response(serializer.errors, status=400)


class CourseAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        assignments = Assignment.objects.filter(
            lecture__section__course_id=course_id
        ).order_by("-created_at")

        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class SubmitAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)
        course = assignment.lecture.section.course
        teacher = course.teacher

        submission, created = AssignmentSubmission.objects.get_or_create(
            assignment=assignment, student=request.user
        )

        submission.file = request.FILES.get("file")
        submission.save()

        # =========================
        # 🔥 EMAIL TEACHER
        # =========================
        try:
            html_content = render_to_string(
                "emails/assignment_submitted.html",
                {
                    "teacher_name": teacher.username,
                    "student_name": request.user.username,
                    "assignment_title": assignment.title,
                    "course_title": course.title,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Assignment Submitted 📥",
                body="Student submitted assignment",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[teacher.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Submit email error:", e)

        return Response({"message": "Assignment submitted"})


class AssignmentSubmissionsView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)

        if assignment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        subs = assignment.submissions.all()
        serializer = AssignmentSubmissionSerializer(
            subs, many=True, context={"request": request}
        )
        return Response(serializer.data)


class GradeSubmissionView(APIView):
    permission_classes = [IsTeacherApproved]

    def patch(self, request, submission_id):
        submission = get_object_or_404(AssignmentSubmission, id=submission_id)

        if submission.assignment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        submission.grade = request.data.get("grade")
        submission.feedback = request.data.get("feedback", "")
        submission.save()

        # =========================
        # 🔥 EMAIL STUDENT
        # =========================
        try:
            html_content = render_to_string(
                "emails/assignment_graded.html",
                {
                    "username": submission.student.username,
                    "assignment_title": submission.assignment.title,
                    "grade": submission.grade,
                    "feedback": submission.feedback,
                },
            )

            msg = EmailMultiAlternatives(
                subject="Assignment Graded ✅",
                body="Your assignment has been graded",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[submission.student.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Grade email error:", e)

        return Response({"message": "Graded successfully"})


class InstructorAssignmentsView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request):
        assignments = (
            Assignment.objects.filter(lecture__section__course__teacher=request.user)
            .select_related("lecture__section__course")
            .order_by("-created_at")
        )

        data = [
            {
                "id": a.id,
                "title": a.title,
                "points": a.points,
                "due_date": a.due_date,
                "lecture_title": a.lecture.title,
                "course_title": a.lecture.section.course.title,
            }
            for a in assignments
        ]

        return Response(data)


class UpdateAssignmentView(APIView):
    permission_classes = [IsTeacherApproved]

    def patch(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)

        if assignment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        assignment.title = request.data.get("title", assignment.title)
        assignment.instructions = request.data.get(
            "instructions", assignment.instructions
        )
        assignment.points = request.data.get("points", assignment.points)
        assignment.due_date = request.data.get("due_date", assignment.due_date)
        assignment.save()

        return Response({"message": "Assignment updated"})


class DeleteAssignmentView(APIView):
    permission_classes = [IsTeacherApproved]

    def delete(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)

        if assignment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        assignment.delete()
        return Response({"message": "Assignment deleted"}, status=204)


# =====================================================
# 🎓 STUDENT — VIEW MY ASSIGNMENTS
# =====================================================
class StudentAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get courses student is APPROVED in
        enrolled_courses = Enrollment.objects.filter(
            student=request.user, status="APPROVED"
        ).values_list("course_id", flat=True)

        # Get assignments from those courses
        assignments = (
            Assignment.objects.filter(lecture__section__course_id__in=enrolled_courses)
            .select_related("lecture__section__course")
            .order_by("-created_at")
        )

        data = []

        for a in assignments:
            submitted = AssignmentSubmission.objects.filter(
                assignment=a, student=request.user
            ).exists()

            data.append(
                {
                    "id": a.id,
                    "title": a.title,
                    "course_title": a.lecture.section.course.title,
                    "lecture_title": a.lecture.title,
                    "points": a.points,
                    "due_date": a.due_date,
                    "created_at": a.created_at,
                    "status": "Submitted" if submitted else "Pending",
                }
            )

        return Response(data)


# =====================================================
# 🎓 STUDENT — ASSIGNMENT DETAIL
# =====================================================
# views.py


class StudentAssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(Assignment, id=assignment_id)

        course = assignment.lecture.section.course
        is_enrolled = Enrollment.objects.filter(
            student=request.user, course=course, status="APPROVED"
        ).exists()

        if not is_enrolled:
            return Response({"detail": "Not enrolled"}, status=403)

        submission = AssignmentSubmission.objects.filter(
            assignment=assignment, student=request.user
        ).first()

        data = {
            "id": assignment.id,
            "title": assignment.title,
            "instructions": assignment.instructions,
            "points": assignment.points,
            "due_date": assignment.due_date,
            "course_title": course.title,
            "teacher_name": course.teacher.username,
            # ✅ INSTRUCTOR FILE (attachment)
            "attachment": (
                request.build_absolute_uri(assignment.attachment.url)
                if assignment.attachment
                else None
            ),
            # ✅ SUBMISSION INFO (student file)
            "submitted": True if submission else False,
            "submission_file": (
                request.build_absolute_uri(submission.file.url)
                if submission and submission.file
                else None
            ),
            # ✅ Grade + feedback
            "grade": submission.grade if submission else None,
            "feedback": submission.feedback if submission else "",
        }

        return Response(data)


class UnsubmitAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, assignment_id):
        submission = AssignmentSubmission.objects.filter(
            assignment_id=assignment_id, student=request.user
        ).first()

        if not submission:
            return Response({"detail": "No submission found"}, status=404)

        submission.delete()
        return Response({"message": "Submission removed"})


class UploadLectureFileView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        files = request.FILES.getlist("files")

        for f in files:
            LectureFile.objects.create(lecture=lecture, file=f)

        return Response({"detail": "Files uploaded"})


class DeleteLectureFileView(APIView):
    permission_classes = [IsTeacherApproved]

    def delete(self, request, file_id):
        lecture_file = get_object_or_404(LectureFile, id=file_id)

        if lecture_file.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        lecture_file.file.delete(save=False)
        lecture_file.delete()

        return Response({"detail": "PDF removed"}, status=204)


class GradeAnswerView(APIView):
    permission_classes = [IsTeacherApproved]

    def patch(self, request, answer_id):
        answer = get_object_or_404(Answer, id=answer_id)

        # ✅ Security check
        if answer.attempt.assessment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        marks = request.data.get("marks")
        if marks is None:
            return Response({"detail": "Marks required"}, status=400)

        # =========================
        # SAVE MARKS
        # =========================
        answer.marks_awarded = int(marks)
        answer.save()

        attempt = answer.attempt
        total = 0

        # =========================
        # RECALCULATE TOTAL SCORE
        # =========================
        for ans in attempt.answers.all():
            if ans.selected_choice and ans.selected_choice.is_correct:
                total += ans.question.marks
            elif ans.marks_awarded is not None:
                total += ans.marks_awarded

        attempt.score = total

        # =========================
        # CHECK IF FULLY GRADED
        # =========================
        all_text_graded = not attempt.answers.filter(
            question__question_type="TEXT", marks_awarded__isnull=True
        ).exists()

        was_graded_before = attempt.status == "GRADED"

        if all_text_graded:
            attempt.status = "GRADED"
            attempt.graded_at = timezone.now()

        attempt.save()

        # =========================
        # 🔥 SEND EMAIL (ONLY ONCE)
        # =========================
        if attempt.status == "GRADED" and not was_graded_before:
            try:
                student = attempt.student
                course = attempt.assessment.lecture.section.course

                html_content = render_to_string(
                    "emails/quiz_graded.html",
                    {
                        "username": student.username,
                        "quiz_title": attempt.assessment.title,
                        "course_title": course.title,
                        "score": attempt.score,
                    },
                )

                msg = EmailMultiAlternatives(
                    subject="Quiz Graded ✅",
                    body="Your quiz has been graded",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[student.email],
                )

                msg.attach_alternative(html_content, "text/html")
                msg.send()

            except Exception as e:
                print("❌ Quiz graded email error:", e)

        # =========================
        # RESPONSE
        # =========================
        return Response(
            {
                "message": "Answer graded successfully",
                "total_score": total,
                "attempt_status": attempt.status,
            }
        )


class AssessmentGradingView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id)

        # Security
        course_teacher = assessment.lecture.section.course.teacher
        if course_teacher != request.user and request.user.profile.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        attempts = (
            Attempt.objects.filter(assessment=assessment, submitted_at__isnull=False)
            .select_related("student")
            .prefetch_related("answers__question")
            .order_by("-submitted_at")
        )

        pending_count = attempts.filter(status="PENDING").count()

        submissions = []

        for attempt in attempts:
            answers_list = []

            for ans in attempt.answers.all():
                if ans.question.question_type != "TEXT":
                    continue

                answers_list.append(
                    {
                        "answer_id": ans.id,
                        "question_text": ans.question.text,
                        "student_answer": ans.answer_text,
                        "marks_awarded": ans.marks_awarded,
                        "max_marks": ans.question.marks,
                    }
                )

            submissions.append(
                {
                    "attempt_id": attempt.id,
                    "student": attempt.student.username,
                    "submitted_at": attempt.submitted_at,
                    "status": attempt.status,
                    "score": attempt.score,
                    "answers": answers_list,
                }
            )

        return Response(
            {
                "pending_count": pending_count,  # 🔥 THIS IS NEW
                "submissions": submissions,  # 🔥 renamed (clean)
            },
            status=200,
        )


class InstructorQuizListView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request):
        quizzes = Assessment.objects.filter(
            lecture__section__course__teacher=request.user
        ).distinct()

        data = []

        for quiz in quizzes:
            submitted_count = Attempt.objects.filter(
                assessment=quiz, submitted_at__isnull=False
            ).count()

            data.append(
                {
                    "id": quiz.id,
                    "title": quiz.title,
                    "lecture": quiz.lecture.title,
                    "course": quiz.lecture.section.course.title,
                    "submissions": submitted_count,
                }
            )

        return Response(data)


class AssessmentSubmissionsView(APIView):
    permission_classes = [IsTeacherApproved]

    def get(self, request, assessment_id):
        assessment = get_object_or_404(Assessment, id=assessment_id)

        # Security: only course teacher
        if assessment.lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        attempts = Attempt.objects.filter(
            assessment=assessment, submitted_at__isnull=False
        ).select_related("student")

        data = []
        pending_count = 0

        for a in attempts:
            if a.status == "PENDING":
                pending_count += 1

            data.append(
                {
                    "attempt_id": a.id,
                    "student": a.student.username,
                    "submitted_at": a.submitted_at,
                    "status": a.status,
                    "score": a.score,
                }
            )

        return Response({"submissions": data, "pending_count": pending_count})


from django.utils import timezone


class StartLiveLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        # ✅ Check teacher
        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        # ✅ Create Zoom meeting
        meeting = create_zoom_meeting(lecture.title)

        join_url = meeting.get("join_url")
        start_url = meeting.get("start_url")

        # ❌ Safety check (IMPORTANT)
        if not join_url:
            return Response({"detail": "Zoom meeting failed"}, status=500)

        # ✅ Save lecture live data
        lecture.is_live = True
        lecture.live_join_url = join_url
        lecture.live_start_url = start_url
        lecture.live_started_at = timezone.now()
        lecture.save()

        # =========================
        # 🔥 EMAIL ALL STUDENTS
        # =========================
        try:
            course = lecture.section.course

            students = Enrollment.objects.filter(
                course=course, status="APPROVED"
            ).select_related("student")

            for enroll in students:
                student = enroll.student

                # ❌ skip if no email
                if not student.email:
                    continue

                html_content = render_to_string(
                    "emails/live_started.html",
                    {
                        "username": student.username,
                        "course_title": course.title,
                        "lecture_title": lecture.title,
                        "join_url": join_url,
                    },
                )

                msg = EmailMultiAlternatives(
                    subject="🔴 Live Class Started Now!",
                    body="Live session started",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[student.email],
                )

                msg.attach_alternative(html_content, "text/html")
                msg.send()

        except Exception as e:
            print("❌ Live email error:", e)

        return Response(
            {"message": "Live started", "start_url": start_url, "join_url": join_url}
        )


class EndLiveLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        # 🔥 CLEAN EVERYTHING
        lecture.is_live = False
        lecture.live_join_url = None
        lecture.live_start_url = None

        lecture.save()

        return Response({"message": "Live ended & link removed"})


from rest_framework.generics import RetrieveAPIView


class LectureDetailView(RetrieveAPIView):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


from datetime import timedelta
from django.utils import timezone


class JoinLiveLectureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        # ✅ check enrollment
        is_enrolled = Enrollment.objects.filter(
            student=request.user, course=lecture.section.course, status="APPROVED"
        ).exists()

        if not is_enrolled:
            return Response({"detail": "Not enrolled"}, status=403)

        now = timezone.now()

        # =====================================================
        # 🔵 1. HANDLE SCHEDULED MEETING
        # =====================================================
        if lecture.scheduled_time:
            start = lecture.scheduled_time
            end = lecture.end_time

            if not end:
                return Response({"detail": "Session end time is missing"}, status=400)

            # ⏳ not started yet
            if now < start:
                return Response({"detail": "Meeting not started"}, status=400)

            # ⛔ expired
            if now > end:
                lecture.is_live = False
                lecture.live_join_url = None
                lecture.live_start_url = None
                lecture.save()
                return Response({"detail": "Meeting expired"}, status=400)

            # ✅ within time → make it live automatically
            lecture.is_live = True

        # =====================================================
        # 🔴 2. HANDLE NORMAL LIVE (manual start)
        # =====================================================
        if not lecture.is_live:
            return Response({"detail": "Meeting not started"}, status=400)

        # 🔥 AUTO EXPIRE AFTER 50 MINUTES (manual sessions)
        if lecture.live_started_at:
            expire_time = lecture.live_started_at + timedelta(minutes=50)

            if now > expire_time:
                lecture.is_live = False
                lecture.live_join_url = None
                lecture.live_start_url = None
                lecture.save()

                return Response({"detail": "Meeting expired"}, status=400)

        # =====================================================
        # ❌ FINAL SAFETY CHECK
        # =====================================================
        if not lecture.live_join_url:
            return Response({"detail": "Meeting expired"}, status=400)

        # ✅ SUCCESS
        return Response({"join_url": lecture.live_join_url})


from django.utils.dateparse import parse_datetime
from django.utils import timezone


class ScheduleLectureView(APIView):
    permission_classes = [IsTeacherApproved]

    def post(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        start_time = request.data.get("start_time")
        end_time = request.data.get("end_time")

        if not start_time or not end_time:
            return Response({"error": "Start & End time required"}, status=400)

        start_dt = parse_datetime(start_time)
        end_dt = parse_datetime(end_time)

        if not start_dt or not end_dt:
            return Response({"detail": "Invalid date/time format"}, status=400)

        # ✅ timezone fix
        if timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())

        if timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())

        now = timezone.now()

        if timezone.is_naive(now):
            now = timezone.make_aware(now, timezone.get_current_timezone())

        if start_dt < now:
            return Response({"detail": "Cannot schedule in past"}, status=400)

        if end_dt <= start_dt:
            return Response({"detail": "End time must be after start"}, status=400)

        # =========================
        # OVERLAP CHECK
        # =========================
        teacher = lecture.section.course.teacher

        existing_sessions = Lecture.objects.filter(
            section__course__teacher=teacher, scheduled_time__isnull=False
        ).exclude(id=lecture.id)

        for session in existing_sessions:
            existing_start = session.scheduled_time
            existing_end = session.end_time

            if not existing_start or not existing_end:
                continue

            if timezone.is_naive(existing_start):
                existing_start = timezone.make_aware(
                    existing_start, timezone.get_current_timezone()
                )

            if timezone.is_naive(existing_end):
                existing_end = timezone.make_aware(
                    existing_end, timezone.get_current_timezone()
                )

            overlap = not (end_dt <= existing_start or start_dt >= existing_end)

            if overlap:
                return Response(
                    {"detail": "Time slot conflict"},
                    status=400,
                )

        # =========================
        # SAVE
        # =========================
        lecture.scheduled_time = start_dt
        lecture.end_time = end_dt
        lecture.is_live = False
        lecture.live_join_url = None
        lecture.live_start_url = None
        lecture.live_started_at = None
        lecture.duration_minutes = int((end_dt - start_dt).total_seconds() // 60)
        lecture.save()

        # =========================
        # 🔥 SEND EMAIL TO STUDENTS
        # =========================
        try:
            course = lecture.section.course

            students = Enrollment.objects.filter(
                course=course, status="APPROVED"
            ).select_related("student")

            print("📢 Students found:", students.count())

            for enroll in students:
                student = enroll.student

                if not student.email:
                    print("❌ Missing email:", student.username)
                    continue

                html_content = render_to_string(
                    "emails/live_scheduled.html",
                    {
                        "username": student.username,
                        "course_title": course.title,
                        "lecture_title": lecture.title,
                        "start_time": lecture.scheduled_time,
                        "end_time": lecture.end_time,
                    },
                )

                msg = EmailMultiAlternatives(
                    subject="📅 Live Session Scheduled",
                    body="Live session scheduled",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[student.email],
                )

                msg.attach_alternative(html_content, "text/html")
                msg.send()

                print("✅ Sent to:", student.email)

        except Exception as e:
            print("❌ Email error:", e)

        return Response({"message": "Scheduled successfully"})


class InstructorScheduledLecturesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lectures = Lecture.objects.filter(
            section__course__teacher=request.user, scheduled_time__isnull=False
        ).order_by("scheduled_time")

        data = []

        for lec in lectures:
            data.append(
                {
                    "id": lec.id,
                    "title": lec.section.course.title,
                    "scheduled_time": lec.scheduled_time,
                    "end_time": lec.end_time,
                    "is_live": lec.is_live,
                }
            )

        return Response(data)


class DeleteScheduledSessionView(APIView):
    permission_classes = [IsTeacherApproved]

    def delete(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        # ✅ Remove only scheduled/live session data
        lecture.scheduled_time = None
        lecture.end_time = None
        lecture.duration_minutes = None

        lecture.is_live = False
        lecture.live_join_url = None
        lecture.live_start_url = None
        lecture.live_started_at = None

        lecture.save()

        return Response({"message": "Scheduled session removed"}, status=200)


from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Lecture


class UpdateScheduledSessionView(APIView):
    permission_classes = [IsTeacherApproved]

    def patch(self, request, lecture_id):
        lecture = get_object_or_404(Lecture, id=lecture_id)

        # ✅ check teacher
        if lecture.section.course.teacher != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        # ✅ get data
        scheduled_time = request.data.get("scheduled_time")
        end_time = request.data.get("end_time")

        if not scheduled_time or not end_time:
            return Response({"detail": "Start & End time required"}, status=400)

        # ✅ parse datetime
        start_dt = parse_datetime(scheduled_time)
        end_dt = parse_datetime(end_time)

        if not start_dt or not end_dt:
            return Response({"detail": "Invalid datetime format"}, status=400)

        # =====================================================
        # 🔥 FIX TIMEZONE (MAIN FIX)
        # =====================================================
        if timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())

        if timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())

        # ✅ normalize NOW (IMPORTANT)
        now = timezone.now()

        if timezone.is_naive(now):
            now = timezone.make_aware(now, timezone.get_current_timezone())

        # =====================================================
        # ✅ VALIDATIONS
        # =====================================================
        if start_dt < now:
            return Response({"detail": "Cannot schedule in past"}, status=400)

        if end_dt <= start_dt:
            return Response({"detail": "End must be after start"}, status=400)

        # =====================================================
        # 🔥 OVERLAP CHECK
        # =====================================================
        teacher = lecture.section.course.teacher

        existing_sessions = Lecture.objects.filter(
            section__course__teacher=teacher, scheduled_time__isnull=False
        ).exclude(id=lecture.id)

        for session in existing_sessions:
            existing_start = session.scheduled_time
            existing_end = session.end_time

            if not existing_start or not existing_end:
                continue

            # ✅ FIX timezone here also
            if timezone.is_naive(existing_start):
                existing_start = timezone.make_aware(
                    existing_start, timezone.get_current_timezone()
                )

            if timezone.is_naive(existing_end):
                existing_end = timezone.make_aware(
                    existing_end, timezone.get_current_timezone()
                )

            overlap = not (end_dt <= existing_start or start_dt >= existing_end)

            if overlap:
                return Response(
                    {"detail": "You already have a session in this time slot"},
                    status=400,
                )

        # =====================================================
        # ✅ SAVE
        # =====================================================
        lecture.scheduled_time = start_dt
        lecture.end_time = end_dt
        lecture.duration_minutes = int((end_dt - start_dt).total_seconds() // 60)

        lecture.save()

        return Response({"message": "Session updated successfully"})


# =====================================================
# 🛠 ADMIN — ALL COURSES
# =====================================================
class AdminCourseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ✅ only admin allowed
        if request.user.profile.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        courses = Course.objects.all().order_by("-created_at")
        serializer = AdminCourseSerializer(
            courses, many=True, context={"request": request}
        )
        return Response(serializer.data)


# =====================================================
# 🗑 ADMIN — DELETE COURSE
# =====================================================
class AdminDeleteCourseView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.profile.role != "ADMIN":
            return Response({"detail": "Not allowed"}, status=403)

        course = get_object_or_404(Course, pk=pk)
        course.delete()

        return Response({"message": "Course deleted"})


class PaymentSuccessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        # 🔥 CHECK: already purchased
        already_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status="APPROVED",
        ).exists()

        if already_enrolled:
            return Response(
                {"message": "You already purchased this course"},
                status=400,
            )

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )

        enrollment.status = "APPROVED"
        enrollment.save()

        CartItem.objects.filter(user=request.user, course=course).delete()

        # ✅ SEND ENROLLMENT EMAIL
        try:
            html_content = render_to_string(
                "emails/course_enrollment_success.html",
                {
                    "username": request.user.username,
                    "course_title": course.title,
                    "course_description": course.description,
                    "teacher_name": (
                        course.teacher.get_full_name().strip()
                        or course.teacher.username
                    ),
                    "course_price": (
                        f"${course.price}" if getattr(course, "price", None) else "Free"
                    ),
                    "course_link": f"http://localhost:5173/courses/{course.id}",
                },
            )

            msg = EmailMultiAlternatives(
                subject="Enrollment Successful 🎓",
                body="You have successfully enrolled in a course.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[request.user.email],
            )

            msg.attach_alternative(html_content, "text/html")
            msg.send()

        except Exception as e:
            print("Enrollment email error:", e)

        return Response(
            {
                "message": "Payment successful. Access granted.",
                "course_id": course.id,
            }
        )


from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class CourseChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        course_id = request.data.get("course_id")
        lecture_title = (request.data.get("lecture_title") or "").strip()

        if not message:
            return Response({"detail": "Message is required"}, status=400)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found"}, status=404)

        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",  # 🔥 cheap + good
                messages=[
                    {
                        "role": "system",
                        "content": f"""
You are an expert instructor.

Course: {course.title}
Lecture: {lecture_title}

Explain in simple words with examples.
""",
                    },
                    {"role": "user", "content": message},
                ],
            )

            reply = completion.choices[0].message.content

            return Response({"reply": reply})

        except Exception as e:
            print("❌ OPENAI ERROR:", e)
            return Response({"detail": "AI error"}, status=500)


class CourseReviewCreateUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=course,
            status="APPROVED",
        ).exists()

        if not is_enrolled:
            return Response(
                {"detail": "Only approved enrolled students can rate this course"},
                status=403,
            )

        rating = request.data.get("rating")
        comment = request.data.get("comment", "").strip()

        if rating is None:
            return Response({"detail": "Rating is required"}, status=400)

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response({"detail": "Rating must be a number"}, status=400)

        if rating < 1 or rating > 5:
            return Response({"detail": "Rating must be between 1 and 5"}, status=400)

        review, created = CourseReview.objects.update_or_create(
            student=request.user,
            course=course,
            defaults={
                "rating": rating,
                "comment": comment,
            },
        )

        avg_rating = course.reviews.aggregate(avg=Avg("rating"))["avg"] or 0
        course.rating = round(avg_rating, 1)
        course.save(update_fields=["rating"])

        serializer = CourseReviewSerializer(review, context={"request": request})

        return Response(
            {
                "message": "Review submitted" if created else "Review updated",
                "average_rating": course.rating,
                "review": serializer.data,
            },
            status=200,
        )


class CourseReviewListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        reviews = course.reviews.select_related("student").order_by("-created_at")
        serializer = CourseReviewSerializer(
            reviews,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "course_id": course.id,
                "course_title": course.title,
                "average_rating": course.rating,
                "reviews_count": reviews.count(),
                "reviews": serializer.data,
            }
        )


class MyCourseReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        review = CourseReview.objects.filter(
            student=request.user,
            course_id=course_id,
        ).first()

        if not review:
            return Response({"review": None}, status=200)

        serializer = CourseReviewSerializer(review, context={"request": request})
        return Response(serializer.data, status=200)


class CourseReviewDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id):
        review = CourseReview.objects.filter(
            student=request.user,
            course_id=course_id,
        ).first()

        if not review:
            return Response({"detail": "Review not found"}, status=404)

        course = review.course
        review.delete()

        avg_rating = course.reviews.aggregate(avg=Avg("rating"))["avg"] or 0
        course.rating = round(avg_rating, 1)
        course.save(update_fields=["rating"])

        return Response({"message": "Review deleted successfully"}, status=200)
