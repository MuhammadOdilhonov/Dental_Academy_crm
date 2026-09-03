from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import CustomUser, Visitor, Transaction
from .serializers import (
    CustomUserSerializer, 
    CustomTokenObtainPairSerializer, 
    VisitorSerializer, 
    TransactionSerializer
)
from .permissions import VisitorPermission, TransactionPermission, IsDirector


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)


from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 500

    def get_page_size(self, request):
        if request.query_params.get('all') == 'true':
            return None
        return super().get_page_size(request)


from django.utils import timezone
import datetime

def filter_by_period(queryset, request, date_field='created_at'):
    period = request.query_params.get('period', 'all')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    now = timezone.now()
    today = now.date()

    if period == 'today':
        return queryset.filter(**{f"{date_field}__date": today})
    elif period == 'yesterday':
        yesterday = today - datetime.timedelta(days=1)
        return queryset.filter(**{f"{date_field}__date": yesterday})
    elif period == 'week':
        start_of_week = today - datetime.timedelta(days=today.weekday())
        return queryset.filter(**{f"{date_field}__date__gte": start_of_week})
    elif period == 'month':
        start_of_month = today.replace(day=1)
        return queryset.filter(**{f"{date_field}__date__gte": start_of_month})
    elif period == 'custom' and (start_date or end_date):
        kwargs = {}
        if start_date:
            kwargs[f"{date_field}__date__gte"] = start_date
        if end_date:
            kwargs[f"{date_field}__date__lte"] = end_date
        return queryset.filter(**kwargs)

    return queryset


class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    permission_classes = [VisitorPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['gender', 'category']
    search_fields = ['full_name', 'comment']
    ordering_fields = ['created_at', 'full_name', 'age']

    def get_queryset(self):
        qs = Visitor.objects.all()
        return filter_by_period(qs, self.request, 'created_at')


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [TransactionPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'payment_method', 'currency', 'expense_category', 'visitor']
    search_fields = ['custom_source_name', 'expense_category', 'comment', 'visitor__full_name']
    ordering_fields = ['created_at', 'amount']

    def get_queryset(self):
        qs = Transaction.objects.all().select_related('visitor', 'created_by')
        return filter_by_period(qs, self.request, 'created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DashboardStatsView(APIView):
    permission_classes = [IsDirector]

    def get(self, request):
        trans_qs = filter_by_period(Transaction.objects.all(), request, 'created_at')
        vis_qs = filter_by_period(Visitor.objects.all(), request, 'created_at')

        # 1. Financial stats UZS
        inflow_uzs = trans_qs.filter(type='INFLOW', currency='UZS').aggregate(s=Sum('amount'))['s'] or 0
        outflow_uzs = trans_qs.filter(type='OUTFLOW', currency='UZS').aggregate(s=Sum('amount'))['s'] or 0
        net_profit_uzs = inflow_uzs - outflow_uzs

        # 1. Financial stats USD
        inflow_usd = trans_qs.filter(type='INFLOW', currency='USD').aggregate(s=Sum('amount'))['s'] or 0
        outflow_usd = trans_qs.filter(type='OUTFLOW', currency='USD').aggregate(s=Sum('amount'))['s'] or 0
        net_profit_usd = inflow_usd - outflow_usd

        # Balances by payment method - UZS
        cash_in_uzs = trans_qs.filter(type='INFLOW', currency='UZS', payment_method='CASH').aggregate(s=Sum('amount'))['s'] or 0
        cash_out_uzs = trans_qs.filter(type='OUTFLOW', currency='UZS', payment_method='CASH').aggregate(s=Sum('amount'))['s'] or 0
        cash_balance_uzs = cash_in_uzs - cash_out_uzs

        card_in_uzs = trans_qs.filter(type='INFLOW', currency='UZS', payment_method='CARD').aggregate(s=Sum('amount'))['s'] or 0
        card_out_uzs = trans_qs.filter(type='OUTFLOW', currency='UZS', payment_method='CARD').aggregate(s=Sum('amount'))['s'] or 0
        card_balance_uzs = card_in_uzs - card_out_uzs

        mobile_in_uzs = trans_qs.filter(type='INFLOW', currency='UZS', payment_method='MOBILE').aggregate(s=Sum('amount'))['s'] or 0
        mobile_out_uzs = trans_qs.filter(type='OUTFLOW', currency='UZS', payment_method='MOBILE').aggregate(s=Sum('amount'))['s'] or 0
        mobile_balance_uzs = mobile_in_uzs - mobile_out_uzs

        transfer_in_uzs = trans_qs.filter(type='INFLOW', currency='UZS', payment_method='TRANSFER').aggregate(s=Sum('amount'))['s'] or 0
        transfer_out_uzs = trans_qs.filter(type='OUTFLOW', currency='UZS', payment_method='TRANSFER').aggregate(s=Sum('amount'))['s'] or 0
        transfer_balance_uzs = transfer_in_uzs - transfer_out_uzs

        # Balances by payment method - USD
        cash_in_usd = trans_qs.filter(type='INFLOW', currency='USD', payment_method='CASH').aggregate(s=Sum('amount'))['s'] or 0
        cash_out_usd = trans_qs.filter(type='OUTFLOW', currency='USD', payment_method='CASH').aggregate(s=Sum('amount'))['s'] or 0
        cash_balance_usd = cash_in_usd - cash_out_usd

        card_in_usd = trans_qs.filter(type='INFLOW', currency='USD', payment_method='CARD').aggregate(s=Sum('amount'))['s'] or 0
        card_out_usd = trans_qs.filter(type='OUTFLOW', currency='USD', payment_method='CARD').aggregate(s=Sum('amount'))['s'] or 0
        card_balance_usd = card_in_usd - card_out_usd

        mobile_in_usd = trans_qs.filter(type='INFLOW', currency='USD', payment_method='MOBILE').aggregate(s=Sum('amount'))['s'] or 0
        mobile_out_usd = trans_qs.filter(type='OUTFLOW', currency='USD', payment_method='MOBILE').aggregate(s=Sum('amount'))['s'] or 0
        mobile_balance_usd = mobile_in_usd - mobile_out_usd

        transfer_in_usd = trans_qs.filter(type='INFLOW', currency='USD', payment_method='TRANSFER').aggregate(s=Sum('amount'))['s'] or 0
        transfer_out_usd = trans_qs.filter(type='OUTFLOW', currency='USD', payment_method='TRANSFER').aggregate(s=Sum('amount'))['s'] or 0
        transfer_balance_usd = transfer_in_usd - transfer_out_usd

        # 2. Patient / Visitor stats
        total_visitors = vis_qs.count()
        male_count = vis_qs.filter(gender='M').count()
        female_count = vis_qs.filter(gender='F').count()
        cancelled_count = vis_qs.filter(category='Otmen qildi').count()

        # Category breakdown
        category_counts = vis_qs.values('category').annotate(count=Count('id')).order_by('-count')

        # Recent transactions
        recent_transactions = TransactionSerializer(
            trans_qs[:5], many=True
        ).data

        return Response({
            'financials': {
                'total_inflow_uzs': float(inflow_uzs),
                'total_inflow_usd': float(inflow_usd),
                'total_outflow_uzs': float(outflow_uzs),
                'total_outflow_usd': float(outflow_usd),
                'net_profit_uzs': float(net_profit_uzs),
                'net_profit_usd': float(net_profit_usd),

                'cash_in_uzs': float(cash_in_uzs),
                'cash_out_uzs': float(cash_out_uzs),
                'cash_balance_uzs': float(cash_balance_uzs),

                'cash_in_usd': float(cash_in_usd),
                'cash_out_usd': float(cash_out_usd),
                'cash_balance_usd': float(cash_balance_usd),

                'card_in_uzs': float(card_in_uzs),
                'card_out_uzs': float(card_out_uzs),
                'card_balance_uzs': float(card_balance_uzs),

                'card_in_usd': float(card_in_usd),
                'card_out_usd': float(card_out_usd),
                'card_balance_usd': float(card_balance_usd),

                'mobile_in_uzs': float(mobile_in_uzs),
                'mobile_out_uzs': float(mobile_out_uzs),
                'mobile_balance_uzs': float(mobile_balance_uzs),

                'mobile_in_usd': float(mobile_in_usd),
                'mobile_out_usd': float(mobile_out_usd),
                'mobile_balance_usd': float(mobile_balance_usd),

                'transfer_in_uzs': float(transfer_in_uzs),
                'transfer_out_uzs': float(transfer_out_uzs),
                'transfer_balance_uzs': float(transfer_balance_uzs),

                'transfer_in_usd': float(transfer_in_usd),
                'transfer_out_usd': float(transfer_out_usd),
                'transfer_balance_usd': float(transfer_balance_usd),
            },
            'visitors': {
                'total_count': total_visitors,
                'male_count': male_count,
                'female_count': female_count,
                'cancelled_count': cancelled_count,
                'category_breakdown': category_counts,
            },
            'recent_transactions': recent_transactions
        })
