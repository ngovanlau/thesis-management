from datetime import datetime
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from theses import serializers, perms, configs, dao
from theses.models import *
from django.core.mail import send_mail


class ThesisViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Thesis.objects.all()
    serializer_class = serializers.ThesisSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated()]

    def get_permissions(self):
        if self.action in ['list']:
            return [permissions.OR(perms.IsAcademicManagerAuthenticated(), perms.IsLecturerAuthenticated())]

        if self.action in ['retrieve']:
            return [permissions.OR(
                permissions.OR(perms.IsAcademicManagerAuthenticated(), perms.IsStudentThesisOfAuthenticated()),
                perms.IsLecturerAuthenticated())]

        if self.action in ['add_score']:
            return [perms.IsMemberOfThesisAuthenticated()]

        return self.permission_classes

    def list(self, request, *args, **kwargs):
        return Response(serializers.ThesisDetailSerializer(self.get_queryset(), many=True).data)

    def retrieve(self, request, *args, **kwargs):
        return Response(serializers.ThesisDetailSerializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        data = request.data

        student_count = len(data.get('students'))
        if student_count < configs.MIN_STUDENT or student_count > configs.MAX_STUDENT:
            return Response({"message": "Khóa luận chỉ được thực hiện bởi 1 đển 2 sinh viên"},
                            status=status.HTTP_400_BAD_REQUEST)

        lecturer_count = len(data.get('lecturers'))
        if lecturer_count < configs.MIN_LECTURER or lecturer_count > configs.MAX_LECTURER:
            return Response({"message": "Khóa luận chỉ được hướng dẫn bởi 1 đển 2 giảng viên"},
                            status=status.HTTP_400_BAD_REQUEST)

        committee_id = data['committee']['id']
        committee = Committee.objects.get(id=committee_id)
        if committee.theses.count() >= configs.MAX_THESIS:
            return Response({"message": "Hội đồng đã chấm tối đa 5 khóa luận"}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    @action(methods=['post', 'get', 'patch'], url_path='scores', detail=True)
    def add_score(self, request, pk):
        if request.method == 'POST':
            user = request.user
            member = Member.objects.get(lecturer_id=user.id, committee_id=self.get_object().committee_id)
            s = Score.objects.create(thesis=self.get_object(), member=member,
                                     criteria_id=request.data.get('criteria_id'), score=request.data.get('score'))
            s.save()

            return Response(serializers.ThesisDetailSerializer(s.thesis).data, status=status.HTTP_201_CREATED)

        if request.method == 'GET':
            scores = self.get_object().scores

            return Response(serializers.ScoreDetailSerializer(scores, many=True).data, status=status.HTTP_200_OK)

        if request.method == 'PATCH':
            score = Score.objects.get(id=request.data['score_id'])
            score.score = request.data['score']
            score.save()

            return Response(serializers.ThesisDetailSerializer(score.thesis).data, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='active', detail=True)
    def update_active(self, request, pk):
        thesis = self.get_object()
        is_active = thesis.active
        thesis.active = False
        thesis.updated_date = datetime.now()

        return Response(serializers.ThesisDetailSerializer(thesis).data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='committee', detail=True)
    def add_committee(self, request, pk):
        committee_id = request.data.get('committee_id')

        committee = Committee.objects.get(id=committee_id)
        if committee.theses.count() >= configs.MAX_THESIS:
            return Response({"message": "Hội đồng đã chấm tối đa 5 khóa luận"}, status=status.HTTP_400_BAD_REQUEST)

        thesis = self.get_object()
        thesis.committee_id = committee_id
        thesis.save()

        return Response(serializers.ThesisDetailSerializer(thesis).data, status.HTTP_200_OK)


class CommitteeViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Committee.objects.all()
    serializer_class = serializers.CommitteeSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated()]

    def get_permissions(self):
        if self.action in ['retrieve', 'get_theses']:
            return [permissions.OR(perms.IsAcademicManagerAuthenticated(), perms.IsMemberOfCommitteeOfAuthenticated())]

        return self.permission_classes

    def retrieve(self, request, *args, **kwargs):
        return Response(serializers.CommitteeDetailSerializer(self.get_object()).data)

    def list(self, request, *args, **kwargs):
        return Response(serializers.CommitteeDetailSerializer(self.get_queryset(), many=True).data)

    def create(self, request, *args, **kwargs):
        data = request.data

        member_count = len(data.get('members'))
        if member_count < configs.MIN_MEMBER or member_count > configs.MAX_MEMBER:
            return Response({"message": "Hội đồng chỉ được từ 3 đến 5 thành viên"}, status=status.HTTP_400_BAD_REQUEST)

        lecturer_id = data.get('members')[2]['lecturer']['id']
        lecturer = Lecturer.objects.get(user_ptr_id=lecturer_id)
        committee_name = data.get('name')
        send_mail(
            'Thông báo từ Thesis Management App',
            'Anh/chị được phân công làm giáo viên phản biện cho hội đồng: {0}. Vui lòng đăng nhập Thessis Management App để biết thêm chi tiết!'.format(committee_name),
            'ngovanlau2003@gmail.com',
            [lecturer.email],
            fail_silently=False,
        )

        return super().create(request, *args, **kwargs)

    @action(methods=['get'], url_path='theses', detail=True)
    def get_theses(self, request, pk):
        theses = self.get_object().theses.filter(active=True)

        return Response(serializers.ThesisDetailSerializer(theses, many=True, context={'request': request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='active', detail=True)
    def update_action(self, request, pk):
        committee = self.get_object()
        committee.active = not committee.active
        committee.updated_date = datetime.now()

        committee.save()

        active = committee.active
        if active == False:
            theses = committee.theses.all()
            for thesis in theses:
                criteria_count = Criteria.objects.count()
                average = 0.0
                if criteria_count != 0:
                    for score in thesis.scores.all():
                        average = average + score.score

                    average = float(average / (criteria_count * committee.members.all().count()))

                    average = round(average, 2)
                emails = [student.email for student in thesis.students.all()]

                send_mail(
                    'Thông báo điểm khóa luận từ Thesis Management App',
                    'Khóa luận {0} của bạn đã đạt được: {1} điểm'.format(thesis.name, average),
                    'ngovanlau2003@gmail.com',
                    emails,
                    fail_silently=False,
                )

        return Response(serializers.CommitteeDetailSerializer(committee).data, status=status.HTTP_200_OK)


class StudentViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Student.objects.filter(is_active=True).all()
    serializer_class = serializers.StudentDetailSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated()]

    def get_permissions(self):
        if self.action in ['retrieve']:
            return [permissions.OR(perms.IsStudentOfAuthenticated(), perms.IsAcademicManagerAuthenticated())]

        return self.permission_classes

    @action(methods=['get'], url_path='thesis', detail=False)
    def get_thesis(self, request):
        student = request.user.student

        return Response(
            serializers.ThesisDetailSerializer(student.thesis, many=True, context={'request': request}).data,
            status=status.HTTP_200_OK)


class LecturerViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Lecturer.objects.filter(is_active=True).all()
    serializer_class = serializers.LecturerDetailSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated()]

    def get_permissions(self):
        if self.action in ['retrieve']:
            return [permissions.OR(perms.IsLecturerOfAuthenticated(), perms.IsAcademicManagerAuthenticated())]

        return self.permission_classes


class CriteriaViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Criteria.objects.filter(active=True).all()
    serializer_class = serializers.CriteriaDetailSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated()]

    def get_permissions(self):
        if self.action in ['list']:
            return [permissions.OR(perms.IsAcademicManagerAuthenticated(), perms.IsLecturerOfAuthenticated())]

        return self.permission_classes


class UserViewSet(viewsets.ViewSet):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(methods=['get'], url_path='current-user', url_name='current-user', detail=False)
    def current_user(self, request):
        return Response(serializers.UserDetailSerializer(request.user).data)

    @action(methods=['patch'], url_path='change-password', detail=False)
    def change_password(self, request):
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        if password and confirm_password and password == confirm_password:
            user = request.user
            user.set_password(request.data.get('password'))
            user.save()

            return Response(serializers.UserDetailSerializer(user).data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class MemberViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Member.objects.filter(active=True).all()
    serializer_class = serializers.MemberDetailSerializer
    permission_classes = [perms.IsAcademicManagerAuthenticated]

    @action(methods=['get'], url_path='scores', detail=True)
    def get_scores(self, request, pk):
        scores = self.get_object().scores.all()

        thesis_id = request.GET.get('thesis_id')
        criteria_id = request.GET.get('criteria_id')
        if thesis_id:
            scores = scores.filter(thesis_id=thesis_id).all()

        return Response(serializers.ScoreDetailSerializer(scores, many=True).data, status=status.HTTP_200_OK)


class StatsViewSet(viewsets.ViewSet):
    permission_classes = [perms.IsAcademicManagerAuthenticated]

    def list(self, request, *args, **kwargs):
        data = dao.get_score_by_year(request.data.get('year'))
        return Response(data, status=status.HTTP_200_OK)