from django.core.management.base import BaseCommand
from api.models import CustomUser, Visitor, Transaction

class Command(BaseCommand):
    help = 'Seeds initial test users, visitors, and transactions'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Users
        users_data = [
            {'username': 'director', 'first_name': 'Jasur', 'last_name': 'Kamilov', 'role': 'director'},
            {'username': 'admin', 'first_name': 'Malika', 'last_name': 'Aliyeva', 'role': 'admin'},
            {'username': 'kassa', 'first_name': 'Sardor', 'last_name': 'Umarov', 'role': 'kassa'},
        ]

        created_users = {}
        for udata in users_data:
            user, created = CustomUser.objects.get_or_create(
                username=udata['username'],
                defaults={
                    'first_name': udata['first_name'],
                    'last_name': udata['last_name'],
                    'role': udata['role'],
                }
            )
            user.set_password('123456')
            user.save()
            created_users[udata['role']] = user
            self.stdout.write(f"User '{user.username}' (Role: {user.role}) ready. Password: 123456")

        # 2. Create Visitors
        visitors_data = [
            {'full_name': 'Akmal Karimov', 'age': 34, 'gender': 'M', 'category': 'Yangi mijoz', 'comment': 'Tish tozalash va plomba uchun keldi'},
            {'full_name': 'Nigora Abdullayeva', 'age': 28, 'gender': 'F', 'category': 'Eski klient', 'comment': 'Breket ko\'rigi navbatdagi etap'},
            {'full_name': 'Rustam Qosimov', 'age': 45, 'gender': 'M', 'category': 'Xabar olingan', 'comment': 'Implantatsiya bo\'yicha konsultatsiya'},
            {'full_name': 'Zuhra Tosheva', 'age': 22, 'gender': 'F', 'category': 'Otmen qildi', 'comment': 'Vaqti to\'g\'ri kelmadi, otmen qildi'},
            {'full_name': 'Dilshod Raximov', 'age': 50, 'gender': 'M', 'category': 'Yangi mijoz', 'comment': 'Protez qo\'ydirish rejalashtirilmoqda'},
            {'full_name': 'Gulnora Ismoilova', 'age': 31, 'gender': 'F', 'category': 'Boshqa', 'comment': 'Rentgen qilish uchun kirgan'},
        ]

        created_visitors = []
        for vdata in visitors_data:
            vis, _ = Visitor.objects.get_or_create(
                full_name=vdata['full_name'],
                defaults=vdata
            )
            created_visitors.append(vis)

        # 3. Create Transactions
        if not Transaction.objects.exists():
            t1 = Transaction.objects.create(
                type='INFLOW',
                visitor=created_visitors[0],
                amount=450000,
                payment_method='CASH',
                comment='Tish plomba to\'lovi',
                created_by=created_users['kassa']
            )
            t2 = Transaction.objects.create(
                type='INFLOW',
                visitor=created_visitors[1],
                amount=1200000,
                payment_method='CARD',
                comment='Breket navbatdagi to\'lovi',
                created_by=created_users['kassa']
            )
            t3 = Transaction.objects.create(
                type='INFLOW',
                custom_source_name='Dorixona ijara haqidan',
                amount=800000,
                payment_method='TRANSFER',
                comment='Klinika yonidagi dorixona tushumi',
                created_by=created_users['director']
            )
            t4 = Transaction.objects.create(
                type='OUTFLOW',
                amount=250000,
                payment_method='CASH',
                expense_category='Kommunal & Kantselyariya',
                comment='Kassa qog\'ozi va tozalash vositalari',
                created_by=created_users['kassa']
            )
            t5 = Transaction.objects.create(
                type='OUTFLOW',
                amount=600000,
                payment_method='CARD',
                expense_category='Tibbiy materiallar',
                comment='Stomatologik plomba materiallari haridi',
                created_by=created_users['director']
            )

        self.stdout.write(self.style.SUCCESS("Database successfully seeded!"))
