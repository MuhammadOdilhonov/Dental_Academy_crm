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
    - Director: to'liq CRUD
    - Admin (Reception): to'liq CRUD (mijoz yaratish, tahrirlash, ko'rish)
    - Kassa: faqat o'qish (to'lov uchun mijozlarni ko'rish)
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if _is_super(request.user):
            return True
        if request.user.role in ['director', 'admin']:
            return True
        if request.user.role == 'kassa':
            return request.method in permissions.SAFE_METHODS
        return False


class TransactionPermission(permissions.BasePermission):
    """
    - Superadmin: to'liq
    - Director: to'liq CRUD + barcha hisobotlar
    - Kassa: kirim/chiqim yaratish, tranzaksiyalarni o'qish
    - Admin: kirish yo'q
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if _is_super(request.user):
            return True
        if request.user.role in ['director', 'kassa']:
            return True
        return False
