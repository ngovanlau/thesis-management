from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from enum import Enum


class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Faculty(BaseModel):
    name = models.CharField(max_length=50, null=False, unique=True)

    class Meta:
        verbose_name_plural = 'Khoa'

    def __str__(self):
        return self.name


class UserRole(Enum):
    ACADEMIC_MANAGER = 'academic_manager'
    LECTURER = 'lecturer'
    STUDENT = 'student'


class User(AbstractUser):
    role = models.CharField(UserRole, max_length=20)
    avatar = CloudinaryField('avatar', null=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.RESTRICT, related_name='users', null=True)

    def __str__(self):
        return self.last_name + self.first_name


class AcademicManager(User):
    class Meta:
        verbose_name_plural = 'Giáo vụ'


class Lecturer(User):
    class Meta:
        verbose_name_plural = 'Giảng viên'


class Major(models.Model):
    name = models.CharField(max_length=50, null=False, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Nghành'


class Student(User):
    major = models.ForeignKey(Major, on_delete=models.RESTRICT, related_name='students')
    thesis = models.ForeignKey('Thesis', on_delete=models.RESTRICT, related_name='students', null=True)

    class Meta:
        verbose_name_plural = 'Sinh viên'


class Committee(BaseModel):
    name = models.CharField(max_length=100, null=False, unique=True)
    lecturers = models.ManyToManyField(Lecturer, related_name='committees', through='Member')

    class Meta:
        verbose_name_plural = 'Hội đồng bảo vệ khóa luận'

    def __str__(self):
        return self.name


class MemberRole(Enum):
    CHAIRMAN = 'chairman'
    SECRETARY = 'secretary'
    CRITICAL_LECTURER = 'critical_lecturer'
    MEMBER = 'member'


class Member(BaseModel):
    role = models.CharField(MemberRole, default=MemberRole.MEMBER, max_length=20)
    committee = models.ForeignKey(Committee, on_delete=models.RESTRICT, related_name='members')
    lecturer = models.ForeignKey(Lecturer, on_delete=models.RESTRICT, related_name='members')

    class Meta:
        unique_together = ('role', 'committee', 'lecturer')
        verbose_name_plural = 'Thành viên'


class Thesis(BaseModel):
    name = models.CharField(max_length=255, null=False)
    lecturers = models.ManyToManyField(Lecturer, related_name='theses')
    committee = models.ForeignKey(Committee, on_delete=models.RESTRICT, related_name='theses', null=True)
    criteria = models.ManyToManyField('Criteria', through='Score', related_name='theses')

    class Meta:
        verbose_name_plural = 'Khóa luận tốt nghiệp'

    def __str__(self):
        return self.name


class Criteria(BaseModel):
    name = models.CharField(max_length=255, null=False, unique=True)

    class Meta:
        verbose_name_plural = 'Các tiêu chí chấm điểm'

    def __str__(self):
        return self.name


class Score(BaseModel):
    score = models.FloatField(default=0.0, validators=[MaxValueValidator(limit_value=10.0),
                                                       MinValueValidator(limit_value=0.0)])
    thesis = models.ForeignKey(Thesis, on_delete=models.RESTRICT, related_name='scores')
    criteria = models.ForeignKey(Criteria, on_delete=models.RESTRICT, related_name='scores')
    member = models.ForeignKey(Member, on_delete=models.RESTRICT, related_name='scores')

    def __str__(self):
        return self.thesis.name + ' - ' + ' - ' + self.member.lecturer.last_name + ' ' + self.member.lecturer.first_name + self.criteria.name + ' - '

    class Meta:
        unique_together = ('thesis', 'criteria', 'member')
        verbose_name_plural = 'Điểm'
