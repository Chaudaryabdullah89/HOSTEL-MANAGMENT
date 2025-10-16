import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, Calendar, TrendingUp, CheckCircle, AlertTriangle, Wrench, Clock, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
export default function Home() {
  return (
    <main className="w-full min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-100 to-white py-16 px-4 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-indigo-900 mb-4">Welcome to Sama Hostel</h1>
          <p className="text-lg text-gray-700 mb-6">
            Your home away from home. Experience comfort, security, and a vibrant community in the heart of the city.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 py-4 text-lg">
              <Link href="/dashboard/warden/booking">Book a Room</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Link href="#about">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Image
            src="/hostel-hero.jpg"
            alt="Sama Hostel Building"
            width={700}
            height={350}
            className="rounded-xl shadow-lg object-cover border"
            priority
          />
        </div>
      </section>

      {/* Key Features */}
      <section id="about" className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">Why Choose Sama Hostel?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Bed className="h-7 w-7 text-indigo-600" />
              <CardTitle className="text-lg font-semibold">Modern Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Spacious, well-furnished rooms with attached bathrooms, high-speed Wi-Fi, and daily cleaning.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <CheckCircle className="h-7 w-7 text-green-600" />
              <CardTitle className="text-lg font-semibold">24/7 Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                CCTV surveillance, secure entry, and on-site staff ensure your safety at all times.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Users className="h-7 w-7 text-pink-600" />
              <CardTitle className="text-lg font-semibold">Community Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Regular social and cultural events to help you connect and make lifelong friends.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Wrench className="h-7 w-7 text-yellow-600" />
              <CardTitle className="text-lg font-semibold">On-site Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Quick response to maintenance requests for a hassle-free stay.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hostel Overview / Stats */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">Hostel at a Glance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Total Rooms</CardTitle>
                <Bed className="h-5 w-5 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">120</div>
                <p className="text-xs text-gray-500">All rooms fully furnished</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Current Residents</CardTitle>
                <Users className="h-5 w-5 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98</div>
                <p className="text-xs text-gray-500">Diverse, friendly community</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Rooms Available</CardTitle>
                <Calendar className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">22</div>
                <p className="text-xs text-gray-500">Book your spot today!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹2,40,000</div>
                <p className="text-xs text-gray-500">Supporting hostel growth</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Image src="/gallery/room.jpg" alt="Room" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
          <Image src="/gallery/common-area.jpg" alt="Common Area" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
          <Image src="/gallery/dining.jpg" alt="Dining Hall" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
          <Image src="/gallery/gym.jpg" alt="Gym" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
          <Image src="/gallery/study.jpg" alt="Study Room" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
          <Image src="/gallery/events.jpg" alt="Events" width={400} height={250} className="rounded-lg object-cover w-full h-56" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-indigo-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">What Our Residents Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Image src="/avatars/avatar1.jpg" alt="Resident 1" width={48} height={48} className="rounded-full" />
                <div>
                  <CardTitle className="text-base font-semibold">Amit Sharma</CardTitle>
                  <CardDescription className="text-xs">Student, Delhi University</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  "Sama Hostel is the best! The rooms are clean, the staff is friendly, and I feel safe here. The events are a great way to meet new people."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Image src="/avatars/avatar2.jpg" alt="Resident 2" width={48} height={48} className="rounded-full" />
                <div>
                  <CardTitle className="text-base font-semibold">Priya Verma</CardTitle>
                  <CardDescription className="text-xs">Intern, Tech Company</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  "I love the community vibe and the facilities. The location is perfect for my daily commute. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">Contact & Location</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-indigo-600" />
              <span className="text-gray-700 font-medium">
                123, Main Street, Near City Center, New Delhi, 110001
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-indigo-600" />
              <span className="text-gray-700 font-medium">
                +91 98765 43210
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-indigo-600" />
              <span className="text-gray-700 font-medium">
                info@samahostel.com
              </span>
            </div>
            <div className="mt-6">
              <Button asChild size="lg" className="px-8 py-4 text-lg">
                <Link href="/dashboard/warden/booking">Book Your Stay</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="Sama Hostel Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.2090%2C28.6139%2C77.2190%2C28.6239&amp;layer=mapnik"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-lg">Sama Hostel</span>
            <span className="ml-2 text-sm text-indigo-200">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="#about" className="hover:underline text-indigo-200">About</Link>
            <Link href="#gallery" className="hover:underline text-indigo-200">Gallery</Link>
            <Link href="#contact" className="hover:underline text-indigo-200">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}