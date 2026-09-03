from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('director', 'Direktor'),
        ('admin', 'Admin (Reception)'),
        ('kassa', 'Kassir'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Visitor(models.Model):
    GENDER_CHOICES = (
        ('M', 'Erkak'),
        ('F', 'Ayol'),
    )
    
    CATEGORY_CHOICES = (
        ('Yangi mijoz', 'Yangi mijoz'),
        ('Eski klient', 'Eski klient'),
        ('Xabar olingan', 'Xabar olingan'),
        ('Adashib kirgan', 'Adashib kirgan'),
        ('Otmen qildi', 'Otmen qildi'),
        ('Boshqa', 'Boshqa'),
    )

    full_name = models.CharField(max_length=255)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Yangi mijoz')
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.age or '—'} yosh)"


class Transaction(models.Model):
    TYPE_CHOICES = (
        ('INFLOW', 'Kirim'),
        ('OUTFLOW', 'Chiqim'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('CASH', 'Naqd'),
        ('CARD', 'Karta'),
        ('MOBILE', 'Mobile'),
        ('TRANSFER', 'Bank o\'tkazish'),
    )

    CURRENCY_CHOICES = (
        ('UZS', 'UZS (So\'m)'),
        ('USD', 'USD ($)'),
    )

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    visitor = models.ForeignKey(Visitor, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    custom_source_name = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=5, choices=CURRENCY_CHOICES, default='UZS')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='CASH')
    expense_category = models.CharField(max_length=100, blank=True, null=True)
    comment = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.amount} {self.currency} ({self.get_payment_method_display()})"
