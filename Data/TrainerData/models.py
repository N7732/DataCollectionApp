from django.db import models
from django.conf import settings


class Trainer(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced')]
    Degree_CHOICES = [
        ('High School', 'High School'),
        ('Diploma A1', 'Diploma A1'),
        ('Bachelors', 'Bachelors'),
        ('Masters', 'Masters'),
        ('PhD', 'PhD'),
    ]
    Hear_CHOICES = [
        ('Social Media', 'Social Media'),
        ('Website', 'Website'),
        ('Friend', 'Friend'),
        ('Advertisement', 'Advertisement'),
        ('Other', 'Other'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    Where_did_Hear_us = models.CharField(max_length=100, blank=True, choices=Hear_CHOICES)
    college = models.CharField(max_length=100, blank=True)
    Degree = models.CharField(max_length=100, blank=True, choices=Degree_CHOICES)
    upload_cv = models.FileField(upload_to='trainer_cvs/', blank=True, null=True)
    Recommendation_letter = models.FileField(upload_to='trainer_recommendations/', blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    profile_picture = models.ImageField(upload_to='trainer_profiles/', blank=True, null=True)
    Country = models.CharField(max_length=100, blank=True)
    City = models.CharField(max_length=100, blank=True)
    Adress = models.CharField(max_length=255, blank=True)
    Phone_number = models.CharField(max_length=15, blank=False, null=False  )

    def __str__(self):
        return self.user.username

