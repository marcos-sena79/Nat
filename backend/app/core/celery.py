from celery import Celery
from .config import settings

celery_app = Celery(
    "body_piercing",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.notifications",
        "app.tasks.reports",
        "app.tasks.webhooks",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    "send-appointment-reminders": {
        "task": "app.tasks.notifications.send_appointment_reminders",
        "schedule": 3600.0,  # Every hour
    },
    "send-aftercare-reminders": {
        "task": "app.tasks.notifications.send_aftercare_reminders",
        "schedule": 86400.0,  # Every day
    },
    "expire-pending-checkouts": {
        "task": "app.tasks.orders.expire_pending_checkouts",
        "schedule": 300.0,  # Every 5 minutes
    },
    "generate-daily-report": {
        "task": "app.tasks.reports.generate_daily_report",
        "schedule": {
            "hour": 23,
            "minute": 59,
        },
    },
}