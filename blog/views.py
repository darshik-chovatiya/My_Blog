from django.shortcuts import render, redirect, get_object_or_404 
from django.views import View 
from .models import Blog
from django.http import JsonResponse 
from django.views.decorators.csrf import csrf_exempt 
from django.utils.decorators import method_decorator 
import json
from django.contrib.auth import authenticate, login, logout 
from django.contrib import messages 
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator 


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required(login_url = '/login/') , name='dispatch')
class BlogCreateView(View):
    def get(self, request):
        blogs = Blog.objects.filter(author=request.user).order_by('-id')
        return render(request, 'blog/blog.html', {'blogs': blogs})

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        title = data.get('title')
        content = data.get('content')
        publish_date = data.get('date')

        if title and content:
            blog = Blog.objects.create(
                title=title,
                content=content,
                date=publish_date,
                author=request.user  
            )
            return JsonResponse({'success': True, 'id': blog.id})

        return JsonResponse({'success': False, 'message': 'Missing fields'}, status=400)

def blog_detail(request, id):
    blog = get_object_or_404(Blog, id=id)
    return render(request, 'blog/detail.html', {'blog': blog})

class LoginView(View):
    def get(self, request):
        return render(request, 'blog/login.html')

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password.')
            return render(request, 'blog/login.html')

class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('login')

class HomeView(View):
    def get(self, request):
        return render(request, 'blog/home.html')
    
class RegisterView(View):
    def get(self, request):
        return render(request, 'blog/register.html')

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'blog/register.html')    

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'blog/register.html')

        User.objects.create_user(username=username, password=password)
        messages.success(request, 'Account created! You can now log in.')
        return redirect('login')
