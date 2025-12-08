
READ ME 

Design Portfolio II

Course: CPSC 481

Tutorial - 04

Group - 1

THEATRUM

Group Members:

 Sahib Singh Thethi
 
 Kevlam Chundawat
 
 Syed Wasef Daiyan
 
 Harjas Singh Anand
 
 Ali Hassanein


The Final code is in the Final branch. Index.html is the main runnable file. 

Project Name: Theatrum Ticketing System Redesign Submission: Design Portfolio 2 – High-Fidelity Frontend Implementation

Context: This project represents the Design Portfolio 2 evolution of the "Theatrum" system. Moving beyond the static concepts and low-fidelity sketches of Portfolio 1, this submission delivers a fully functional frontend implementation. The design has been translated into a polished, interactive web application using HTML, CSS, and JavaScript to demonstrate the complete user experience.

Scope & Technical Limitations: This is a full frontend system with simulated logic.

Fully Implemented: All client-side interactions are functional, including navigation, movie filtering, seat selection logic, price calculations, and form validation.

No Backend: The system operates without a connected database. Data persistence (such as creating an account or booking a ticket) is simulated within the browser session. Note: Refreshing the page will reset the data.

Key Design Objectives:

High-Fidelity Interactivity: To move away from "click-through" mockups to a responsive, code-based environment that feels like a live product.

Visual Cohesion: Implementing a unified "cinematic" dark theme (with a working light-mode toggle) to improve brand identity and immersion.

Complex Logic Handling: Successfully managing multi-step flows like seat selection and cart management entirely on the frontend to ensure a seamless user journey



1) Cases/Function That were implemented

There are essentially three cases how the user will be able to 
book a ticket : Guest login (no information required), sign in and sign up where 
user has to create an account.


 Implemented Cases & Functions:

    Discovery: Clear  movie lists with functional Date and Genre filters.

    Booking Flow: Interactive calendar, showtime selection, and a split-screen seat selection grid with distinct seat states (Available/Selected).

    Checkout: Visual payment method selection (Visa/Mastercard) with a transparent order summary.

    Account Management: Login/Sign-up modal, user dashboard with "Upcoming" vs. "Past" booking filters, and a full cancellation/refund workflow.

    Extras: Food & Drinks ordering catalog and a global Dark/Light mode toggle.

2. Data Entry Requirements

    Filters (Home Page): By Genre, Title, Rating and Release Date .

    Ticket Counter and Seat Selection: Selecting the amount of Adult and Child tickets, and select seats according to that .

    Payment Forms (Checkout): Payment is done by card, apply pay and google pay.

    Account section: Login will require email and password of the user. Sign up requires First Name, Last Name, Email and Password.

3. Exact Walkthrough Instructions To ensure you see all features without errors, please follow these steps exactly:

    Scenario A: Booking a Ticket

        i) On the Home Page, once the user signs in one of the three ways, they pick a movie.

        ii) Movies can be navigated using the search bar or filter functions.

        ii) Press the Book Ticket button.

        iii)On the panel, click the (+) button next to Adult to set the quantity of your choice. Click "Skip Snacks, go to payment".

        iv) On the Seat Selection page, click  available  seats..

        v) On the Payment summary page, press proceed to payment.

        vi)Press Pay now, by selection Apple Pay G Pay or Add a card.

        vii)Click "Pay now" to view the details.

    Scenario B: Cancelling a Booking

        i) Click Profile and go to My Profile.

        ii) Press "Cancel Booking"  .

        iii) Add a note if you would want to.

        iv) Check the condition, and press Confirm Cancellation.

        v) Click "View Details" on the existing ticket card.

        vi) Moved to Confirmation page.
