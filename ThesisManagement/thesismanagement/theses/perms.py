from rest_framework import permissions
from .models import UserRole


class IsAcademicManagerAuthenticated(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        return bool(request.user.role == UserRole.ACADEMIC_MANAGER.value)


class IsLecturerAuthenticated(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        return bool(request.user.role == UserRole.LECTURER.value)


class IsStudentAuthenticated(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        return bool(request.user.role == UserRole.STUDENT.value)


class IsLecturerOfAuthenticated(IsLecturerAuthenticated):
    def has_object_permission(self, request, view, obj):
        return bool(self.has_permission(request, view) and obj.user_ptr == request.user)


class IsStudentOfAuthenticated(IsStudentAuthenticated):
    def has_object_permission(self, request, view, obj):
        return bool(self.has_permission(request, view) and obj.user_ptr == request.user)


class IsMemberOfCommitteeOfAuthenticated(IsLecturerAuthenticated):
    def has_object_permission(self, request, view, obj):
        is_member = False

        for member in obj.lecturers.all():
            if member.user_ptr == request.user:
                is_member = True
                break

        return self.has_permission(request, view) and is_member


class IsStudentThesisOfAuthenticated(IsStudentAuthenticated):
    def has_object_permission(self, request, view, obj):
        is_owner = False

        for student in obj.students.all():
            if student.user_ptr == request.user:
                is_owner = True
                break

        return self.has_permission(request, view) and is_owner


class IsLecturerThesisOfAuthenticated(IsLecturerAuthenticated):
    def has_object_permission(self, request, view, obj):
        is_lecturer = False

        for lecturer in obj.students.all():
            if lecturer.user_ptr == request.user:
                is_lecturer = True
                break

        return self.has_permission(request, view) and is_lecturer


class IsMemberOfThesisAuthenticated(IsMemberOfCommitteeOfAuthenticated):
    def has_object_permission(self, request, view, obj):

        if obj.committee is None:
            return False

        return bool(IsMemberOfCommitteeOfAuthenticated.has_object_permission(self, request, view, obj.committee))

