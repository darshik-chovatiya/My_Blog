from django.shortcuts import render, redirect, get_object_or_404 
from django.http import HttpResponseForbidden
from django.views import View 
from django.views.generic import UpdateView , DeleteView
from django.urls import reverse_lazy
from .models import Blog, Comment
from django.http import JsonResponse 
from django.views.decorators.csrf import csrf_exempt 
from django.utils.decorators import method_decorator  
import json
from django.contrib.auth import authenticate, login, logout 
from django.contrib import messages 
from django.contrib.auth.models import User 
from django.contrib.auth.decorators import login_required

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required(login_url='/login/'), name='dispatch')

class BlogCreateView(View):
    def get(self, request):
        blogs = Blog.objects.all().order_by('-id')
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
    
class BlogDetailView(View):
    def get(self, request, pk):
        try:
            blog = get_object_or_404(Blog, pk=pk)
            comments = Comment.objects.filter(blog=blog).order_by('-created_at')
            
            print(f"Blog: {blog.title}, Comments count: {comments.count()}")
            
            return render(request, 'blog/detail.html', {
                'blog': blog,
                'comments': comments,
                'is_owner': blog.author == request.user
            })
        except Exception as e:
            print(f"Error: {str(e)}")
            return render(request, 'blog/detail.html', {
                'error': "Something went wrong!"
            })
        
class BloggerListView(View):
    def get(self, request):
        bloggers = User.objects.exclude(id=request.user.id)
        return render(request, 'blog/blogger.html', {'bloggers': bloggers})

class BloggerBlogListView(View):
    def get(self, request, blogger_id):
        blogger = get_object_or_404(User, id=blogger_id)
        blogs = Blog.objects.filter(author=blogger).order_by('-id')
        return render(request, 'blog/blogger_blogs.html', {'blogger': blogger, 'blogs': blogs})

      
class AddCommentView(View):
     def post(self, request, blog_id):
        if not request.user.is_authenticated:
            return redirect('login')

        blog = Blog.objects.get(id=blog_id)

        # Prevent blog owner from commenting
        if blog.author == request.user:
            return HttpResponseForbidden("Authors cannot comment on their own blog.")

        content = request.POST.get('content')
        if content:
            Comment.objects.create(
                blog=blog,
                author=request.user,
                content=content
            )
        return redirect('blog_detail', blog_id=blog_id)
    
@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class SaveCommentView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            print("Incoming data:", data)

            content = data.get('comment')
            blog_id = data.get('blog_id')

            if not content:
                return JsonResponse({'status': 'error', 'message': 'Empty comment'}, status=400)

            if not blog_id:
                return JsonResponse({'status': 'error', 'message': 'Missing blog ID'}, status=400)

            blog = Blog.objects.get(id=blog_id)

            comment = Comment.objects.create(
                user=request.user,
                content=content,
                blog=blog
            )

            return JsonResponse({
                'status': 'ok',
                'comment': comment.content,
                'username': request.user.username
            })

        except Blog.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid blog ID'}, status=404)
        except Exception as e:
            print('calling.................', e)
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        

@method_decorator(csrf_exempt, name='dispatch')
class UpdateDeleteCommentView(View):
    def put(self, request):
        try:
            data = json.loads(request.body)
            comment_id = data.get('comment_id')
            content = data.get('content')

            comment = Comment.objects.get(id=comment_id, user=request.user)
            comment.content = content
            comment.save()

            return JsonResponse({'status': 'ok', 'content': comment.content})

        except Comment.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Comment not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    def delete(self, request):
        try:
            data = json.loads(request.body)
            comment_id = data.get('comment_id')

            comment = Comment.objects.get(id=comment_id, user=request.user)
            comment.delete()

            return JsonResponse({'status': 'ok'})
        except Comment.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Comment not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

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

class HomeView(View):
    def get(self, request):
        return render(request, 'blog/home.html')
    
class BlogEditView(UpdateView):
    model = Blog
    fields = ['title', 'content']  
    template_name = 'blog/blog_edit.html'
    success_url = '/'

class BlogDeleteView(DeleteView):
    model = Blog
    template_name = 'blog/blog_confirm_delete.html'
    success_url = reverse_lazy('blog-list')  


class UserProfileView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return render(request, 'blog/profile.html', {'user': request.user})
        else:
            return redirect('login')
