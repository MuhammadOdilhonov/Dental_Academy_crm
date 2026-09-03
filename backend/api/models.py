from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('superadmin', 'Super Admin'),
        ('director', 'Direktor'),
        ('admin', 'Admin (Reception)'),
        ('kassa', 'Kassir'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')

    # Admin/kassa bitta directorga tegishli (tenant egasi).
    # Director va superadmin uchun bo'sh (null).
    director = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='staff',
        limit_choices_to={'role': 'director'},
        help_text="Admin/kassa qaysi direktorga bog'langanligi",
    )

    @property
    def is_super(self):
        """Superadmin yoki Django superuser — hammani ko'radi."""
        return self.is_superuser or self.role == 'superadmin'

    @property
    def tenant_director(self):
        """
        Foydalanuvchi qaysi direktorning (tenant) ma'lumotini ko'ra oladi.
        None => hammasi (superadmin).
        """
        if self.is_super:
            return None
        if self.role == 'director':
            return self
        return self.director

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

    director = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='visitors',
        limit_choices_to={'role': 'director'},
        help_text="Qaysi direktorga (klinikaga) tegishli",
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

    director = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='director_transactions',
        limit_choices_to={'role': 'director'},
        help_text="Qaysi direktorga (klinikaga) tegishli",
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
