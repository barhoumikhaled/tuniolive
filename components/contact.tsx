"use client";

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Thank you for your message! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Contact Form */ }
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-600" />
            <span>Send us a message</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <form onSubmit={ handleSubmit } className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={ formData.name }
                  onChange={ handleInputChange }
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={ formData.email }
                  onChange={ handleInputChange }
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={ formData.subject }
                onChange={ handleInputChange }
                placeholder="What can we help you with?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={ formData.message }
                onChange={ handleInputChange }
                placeholder="Tell us more about your inquiry..."
                rows={ 5 }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={ isSubmitting }
            >
              { isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </div>
              ) }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */ }
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl mb-4">Other ways to reach us</h3>
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="mb-1">Email Us</h4>
                <p className="text-muted-foreground text-sm mb-2">
                  For general inquiries and customer support
                </p>
                <a href="mailto:tuniolive518@gmail.com" className="text-green-600 hover:underline">
                  tuniolive518@gmail.com
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="mb-1">Call Us</h4>
                <p className="text-muted-foreground text-sm mb-2">
                  Monday to Friday, 9AM - 6PM EST
                </p>
                <a href="tel:+15551234567" className="text-green-600 hover:underline">
                  +1 (514) 601-0603
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="mb-1">Visit Our Farm</h4>
                <p className="text-muted-foreground text-sm mb-2">
                  Schedule a tour of our olive groves
                </p>
                <p className="text-green-600">Bouhajla</p>
                <p className="text-sm text-muted-foreground">Kairouan, Tunisia</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-muted/30 p-6 rounded-lg">
          <h4 className="mb-2">Response Time</h4>
          <p className="text-sm text-muted-foreground">
            We typically respond to all inquiries within 24 hours during business days.
            For urgent matters, please call us directly.
          </p>
        </div>
      </div>
    </div>
  )
}
