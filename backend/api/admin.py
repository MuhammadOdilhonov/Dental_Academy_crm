from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Visitor, Transaction


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'role', 'director', 'is_active', 'is_superuser')
    list_filter = ('role', 'director', 'is_active', 'is_superuser')
    search_fields = ('username', 'first_name', 'last_name')

    fieldsets = UserAdmin.fieldsets + (
        ("CRM ma'lumotlari", {'fields': ('role', 'director')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("CRM ma'lumotlari", {'fields': ('first_name', 'last_name', 'role', 'director')}),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # "director" maydonida faqat direktor rolидagi userlar ko'rinsin
        if db_field.name == 'director':
            kwargs['queryset'] = CustomUser.objects.filter(role='director')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'director', 'category', 'gender', 'age', 'created_at')
    list_filter = ('director', 'category', 'gender')
    search_fields = ('full_name', 'comment')
    autocomplete_fields = ()


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('type', 'amount', 'currency', 'payment_method', 'director', 'visitor', 'created_by', 'created_at')
    list_filter = ('director', 'type', 'currency', 'payment_method')
    search_fields = ('custom_source_name', 'comment', 'expense_category')
