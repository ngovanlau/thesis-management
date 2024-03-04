from django.urls import path, include
from rest_framework import routers
from theses import views


router = routers.DefaultRouter()
router.register('theses', views.ThesisViewSet, basename='theses')
router.register('committees', views.CommitteeViewSet, basename='committees')
router.register('students', views.StudentViewSet, basename='students')
router.register('lecturers', views.LecturerViewSet, basename='lecturers')
router.register('criteria', views.CriteriaViewSet, basename='criteria')
router.register('users', views.UserViewSet, basename='users')
router.register('members', views.MemberViewSet, basename='members')
router.register('stats', views.StatsViewSet, basename='stats')

urlpatterns = [
    path('', include(router.urls))
]