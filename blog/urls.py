from django.urls import path 
from . import views
from .views import (
    BlogCreateView, BlogDetailView, AddCommentView,
    LoginView, LogoutView, HomeView, RegisterView , SaveCommentView , UpdateDeleteCommentView , BloggerListView , BloggerBlogListView , UserProfileView
    )

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('blog/', BlogCreateView.as_view(), name='blog'),
    path('blog/<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),
    path('bloggers/', BloggerListView.as_view(), name='blogger_list'),
    path('bloggers/<int:blogger_id>/', BloggerBlogListView.as_view(), name='blogger_blogs'),
    path('blog/<int:blog_id>/comment/', AddCommentView.as_view(), name='add-comment'),
    path('comment-action/', UpdateDeleteCommentView.as_view(), name='comment-action'),
    path('save-comment/', SaveCommentView.as_view(), name='save-comment'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]
