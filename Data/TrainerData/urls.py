from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainerViewSet, login_view

router = DefaultRouter()
router.register(r'trainers', TrainerViewSet, basename='trainer')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='api-login'),
]
