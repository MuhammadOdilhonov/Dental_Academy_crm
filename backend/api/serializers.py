from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Sum
from .models import CustomUser, Visitor, Transaction

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'role')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        return data

class VisitorSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(required=False, allow_null=True, default=None)
    total_paid_uzs = serializers.SerializerMethodField()
    total_paid_usd = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = ('id', 'full_name', 'age', 'gender', 'category', 'comment', 'created_at', 'total_paid_uzs', 'total_paid_usd')

    def get_total_paid_uzs(self, obj):
        total = obj.transactions.filter(type='INFLOW', currency='UZS').aggregate(total=Sum('amount'))['total']
        return float(total or 0)

    def get_total_paid_usd(self, obj):
        total = obj.transactions.filter(type='INFLOW', currency='USD').aggregate(total=Sum('amount'))['total']
        return float(total or 0)

class TransactionSerializer(serializers.ModelSerializer):
    visitor_detail = VisitorSerializer(source='visitor', read_only=True)
    created_by_detail = CustomUserSerializer(source='created_by', read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'type', 'visitor', 'visitor_detail', 'custom_source_name', 
            'amount', 'currency', 'payment_method', 'expense_category', 'comment', 
            'created_by', 'created_by_detail', 'created_at'
        )

    def validate(self, data):
        trans_type = data.get('type')
        visitor = data.get('visitor')
        custom_source_name = data.get('custom_source_name')

        if trans_type == 'INFLOW':
            if not visitor and not custom_source_name:
                raise serializers.ValidationError("Kirim uchun mijoz tanlanishi yoki 'Boshqa' manba nomi kiritilishi shart.")
        elif trans_type == 'OUTFLOW':
            expense_category = data.get('expense_category')
            if not expense_category:
                raise serializers.ValidationError("Chiqim uchun xarajat kategoriyasini kiritish shart.")
        return data
