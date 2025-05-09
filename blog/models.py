from django.db import models 
from django.contrib.auth.models import User

# Create your models here.

class Blog(models.Model):

    title = models.CharField(max_length=100)
    date = models.DateField()
    content = models.CharField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.CASCADE , default=1)

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.blog.title}"