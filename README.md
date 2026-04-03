# Event Booking System****************

This is a backend project using Node.js, Express and MongoDB.
It is used to manage events and bookings.

Users can register and login using JWT. After login, they get a token to access protected APIs. I also added roles like admin and user. Admin can create, update and delete events, and users can view and book them.

Events have name, date, capacity and available seats. When user books an event, seats decrease. Booking is not allowed if seats are full.

I also added rate limiting for some APIs and a feature to export bookings as CSV. Events can be fetched with pagination and date filter.






****************Tech Stack****************

Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs







****************Setup****************

Install dependencies
npm


Create .env file:


PORT=5000
MONGO_URI=
JWT_SECRET=


Run server:

=>npm run dev






****************Testing****************

Test APIs using Postman.
Swagger docs available at:

http://localhost:5000/api-docs/#/Bookings
