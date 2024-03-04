from .models import *
from rest_framework import serializers


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    faculty = FacultySerializer()
    fullname = serializers.SerializerMethodField(source='fullname')
    avatar = serializers.SerializerMethodField(source='avatar')

    def get_avatar(self, user):
        return user.avatar.url

    def get_fullname(self, user):
        return user.last_name + user.first_name


class MajorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Major
        fields = ['id', 'name']


class UserDetailSerializer(UserSerializer):
    major = serializers.SerializerMethodField(source='major')
    committees = serializers.SerializerMethodField(source='committees')

    def get_major(self, user):
        if user.role == 'student':
            return user.student.major.name

        return None

    def get_committees(self, user):
        if user.role == 'lecturer':
            committees = []
            for committee in user.lecturer.committees.all():
                data = {
                    'id': committee.id
                }
                committees.append(data)
            return committees

        return None

    class Meta:
        model = User
        fields = ['id', 'fullname', 'username', 'password', 'email', 'role', 'faculty', 'major', 'avatar', 'committees']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }


class StudentSerializer(UserSerializer):
    class Meta:
        model = Student
        fields = ['id']
        extra_kwargs = {
            'id': {
                'read_only': False
            },
        }


class StudentDetailSerializer(StudentSerializer):
    major = MajorSerializer()

    class Meta:
        model = StudentSerializer.Meta.model
        fields = StudentSerializer.Meta.fields + ['fullname', 'username', 'password', 'email', 'faculty', 'major', 'avatar', 'thesis_id']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }


class LecturerSerializer(UserSerializer):
    class Meta:
        model = Lecturer
        fields = ['id']
        extra_kwargs = {
            'id': {
                'read_only': False
            },
        }


class LecturerDetailSerializer(LecturerSerializer):
    class Meta:
        model = LecturerSerializer.Meta.model
        fields = LecturerSerializer.Meta.fields + ['fullname', 'username', 'password', 'email', 'faculty', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }


class CommitteeIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Committee
        fields = ['id']
        extra_kwargs = {
            'id': {
                'read_only': False
            },
        }


class ThesisSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True)
    lecturers = LecturerSerializer(many=True)
    committee = CommitteeIdSerializer()

    def create(self, validated_data):
        data = validated_data.copy()

        t = Thesis.objects.create(name=data['name'])

        for student in data['students']:
            stu = Student.objects.get(user_ptr_id=student['id'])
            t.students.add(stu)

        for lecturer in data['lecturers']:
            lec = Lecturer.objects.get(user_ptr_id=lecturer['id'])
            t.lecturers.add(lec)

        t.committee_id = data['committee']['id']

        t.save()

        return t

    class Meta:
        model = Thesis
        fields = ['id', 'name', 'students', 'lecturers', 'committee']


class MemberSerializer(serializers.ModelSerializer):
    lecturer = LecturerSerializer()

    class Meta:
        model = Member
        fields = ['lecturer', 'role']


class MemberDetailSerializer(MemberSerializer):
    lecturer = LecturerDetailSerializer()
    role = serializers.SerializerMethodField(source='role')

    def get_role(self, member):
        if member.role == MemberRole.CHAIRMAN.value:
            return 'Chủ tịch'
        if member.role == MemberRole.SECRETARY.value:
            return 'Thư kí'
        if member.role == MemberRole.CRITICAL_LECTURER.value:
            return 'Giảng viên phản biện'
        if member.role == MemberRole.MEMBER.value:
            return 'Thành viên'

    class Meta:
        model = MemberSerializer.Meta.model
        fields = MemberSerializer.Meta.fields + ['id']


class CommitteeSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True)

    def create(self, validated_data):
        data = validated_data.copy()

        c = Committee.objects.create(name=data['name'])

        for lecturer in data['members']:
            member = Member.objects.create(committee=c, lecturer_id=lecturer['lecturer']['id'], role=lecturer['role'])
            member.save()

        return c

    class Meta:
        model = Committee
        fields = ['name', 'members']


class CommitteeDetailSerializer(CommitteeSerializer):
    members = MemberDetailSerializer(many=True)

    class Meta:
        model = CommitteeSerializer.Meta.model
        fields = CommitteeSerializer.Meta.fields + ['created_date', 'updated_date', 'active', 'theses']


class CriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criteria
        fields = ['id']


class CriteriaDetailSerializer(CriteriaSerializer):
    class Meta:
        model = CriteriaSerializer.Meta.model
        fields = CriteriaSerializer.Meta.fields + ['name']


class ScoreSerializer(serializers.ModelSerializer):
    thesis = ThesisSerializer()
    member = MemberSerializer()

    class Meta:
        model = Score
        fields = ['thesis', 'member', 'criteria_id', 'score']


class ScoreDetailSerializer(serializers.ModelSerializer):
    lecturer_id = serializers.SerializerMethodField(source='lecturer_id')
    criteria = CriteriaDetailSerializer()

    def get_lecturer_id(self, score):
        return score.member.lecturer.id

    class Meta:
        model = Score
        fields = ['id', 'thesis_id', 'lecturer_id', 'criteria', 'score']


class ThesisDetailSerializer(serializers.ModelSerializer):
    students = StudentDetailSerializer(many=True)
    lecturers = LecturerDetailSerializer(many=True)
    committee = CommitteeDetailSerializer()
    average = serializers.SerializerMethodField(source='average')
    scores = ScoreDetailSerializer(many=True)

    def get_average(self, thesis):
        average = 0.0
        if thesis.commitee:
            criteria_count = Criteria.objects.count()

            if criteria_count != 0:
                for score in thesis.scores.all():
                    average = average + score.score

                average = float(average / (criteria_count * thesis.committee.members.all().count()))
                average = round(average, 2)

                return average

        return average

    class Meta:
        model = Thesis
        fields = ['id', 'name', 'students', 'lecturers', 'committee', 'average', 'created_date', 'updated_date', 'active', 'scores']