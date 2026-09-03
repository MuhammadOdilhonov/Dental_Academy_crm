import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0004_transaction_currency_alter_transaction_amount'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                choices=[
                    ('superadmin', 'Super Admin'),
                    ('director', 'Direktor'),
                    ('admin', 'Admin (Reception)'),
                    ('kassa', 'Kassir'),
                ],
                default='admin',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='customuser',
            name='director',
            field=models.ForeignKey(
                blank=True,
                help_text="Admin/kassa qaysi direktorga bog'langanligi",
                limit_choices_to={'role': 'director'},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='staff',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='visitor',
            name='director',
            field=models.ForeignKey(
                blank=True,
                help_text='Qaysi direktorga (klinikaga) tegishli',
                limit_choices_to={'role': 'director'},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='visitors',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='transaction',
            name='director',
            field=models.ForeignKey(
                blank=True,
                help_text='Qaysi direktorga (klinikaga) tegishli',
                limit_choices_to={'role': 'director'},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='director_transactions',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
