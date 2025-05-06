from django.db import models # type: ignore
from django.contrib.auth.models import User

# Create your models here.

class Blog(models.Model):

    title = models.CharField(max_length=100)
    date = models.DateField()
    content = models.CharField(max_length=1000)
    author = models.ForeignKey(User, on_delete=models.CASCADE , default=1)

    def __str__(self):
        return self.title