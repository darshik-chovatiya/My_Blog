from django.urls import path # type: ignore
from . import views
from .views import BlogCreateView, blog_detail, LoginView, LogoutView, HomeView ,RegisterView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('blog/', BlogCreateView.as_view(), name='blog'),
    path('blog/<int:id>/', blog_detail, name='blog-detail'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
]
