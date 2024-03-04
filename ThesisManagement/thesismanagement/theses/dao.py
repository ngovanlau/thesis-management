from django.db.models import Count, Avg, ExpressionWrapper, F, fields, Sum
from datetime import datetime

# Lấy năm hiện tại
from theses.models import *


# # Tính tổng hợp điểm theo năm
# score_statistics = Score.objects.filter(thesis__created_date__year=current_year).aggregate(
#     total_scores=Count('id'),
#     average_score=Avg('score')
# )
#
#
#
# participation_frequency = Student.objects.values('major__name').annotate(
#     total_participants=Count('id')
# )


def get_score_by_year(year):
    query = Thesis.objects.prefetch_related('scores') \
        .annotate(sum=Sum('scores__score')) \
        .values('id', 'name', 'sum', 'committee_id').filter(created_date__year=year)

    data = query
    criteria_count = Criteria.objects.all().count()
    for item in data:
        member_count = Committee.objects.get(id=item['committee_id']).lecturers.count()
        if item['sum']:
            item['sum'] = round(float(item['sum'] / criteria_count / member_count), 2)
        else:
            item['sum'] = 0.0

    return data
