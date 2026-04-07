from django.contrib import admin
from django.urls import path
from .views import process_command

urlpatterns = [
    path('admin/', admin.site.urls),
    path('process', process_command, name='process'),
    path('process/', process_command, name='process_slash'),
]
