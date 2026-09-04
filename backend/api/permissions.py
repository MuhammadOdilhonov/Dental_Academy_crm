from rest_framework import permissions


def _is_super(user):
    return bool(user and user.is_authenticated and (user.is_superuser or user.role == 'superadmin'))


class IsDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        if _is_super(request.user):
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == 'director')


class IsAdminOrDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        if _is_super(request.user):
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'director'])


class IsKassaOrDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        if _is_super(request.user):
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role in ['kassa', 'director'])


class VisitorPermission(permissions.BasePermission):
    """
    - Superadmin: to'liq
    - Director: to'liq CRUD (yaratish, TAHRIRLASH, o'chirish, ko'rish)
    - Admin (Reception): yaratish + ko'rish (tahrirlash/o'chirish YO'Q — faqat direktor)
    - Kassa: faqat o'qish (to'lov uchun mijozlarni ko'rish)
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if _is_super(request.user):
            return True
        role = request.user.role
        if request.method in permissions.SAFE_METHODS:
            return role in ['director', 'admin', 'kassa']
        if request.method == 'POST':
            return role in ['director', 'admin']
        # PUT / PATCH / DELETE — faqat direktor tahrirlay/o'chira oladi
        return role == 'director'


class TransactionPermission(permissions.BasePermission):
    """
    - Superadmin: to'liq
    - Director: to'liq CRUD + barcha hisobotlar (TAHRIRLASH faqat direktorda)
    - Kassa: kirim/chiqim yaratish, tranzaksiyalarni o'qish (tahrirlash YO'Q)
    - Admin: kirish yo'q
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if _is_super(request.user):
            return True
        role = request.user.role
        if request.method in permissions.SAFE_METHODS:
            return role in ['director', 'kassa']
        if request.method == 'POST':
            return role in ['director', 'kassa']
        # PUT / PATCH / DELETE — faqat direktor tahrirlay/o'chira oladi
        return role == 'director'
