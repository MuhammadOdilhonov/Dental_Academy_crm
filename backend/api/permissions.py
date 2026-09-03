from rest_framework import permissions

class IsDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'director')

class IsAdminOrDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'director'])

class IsKassaOrDirector(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['kassa', 'director'])

class VisitorPermission(permissions.BasePermission):
    """
    - Director: Full CRUD
    - Admin (Reception): Full CRUD (create visitors, edit, view)
    - Kassa: Read-only access to view visitors for payments
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['director', 'admin']:
            return True
        if request.user.role == 'kassa':
            return request.method in permissions.SAFE_METHODS
        return False

class TransactionPermission(permissions.BasePermission):
    """
    - Director: Full CRUD + view all transaction reports
    - Kassa: Create inflow/outflow, read transactions
    - Admin: No access or read-only (if needed), prompt says Kassa & Director only
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['director', 'kassa']:
            return True
        return False
