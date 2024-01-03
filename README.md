Class: Internet Scale Applications at the University of Virginia
Professor: Derrick Stone
Student/Author: Isaiah Parr
Grade: 100/100

Note: The goal of the project was for understanding microservice design, and not for maximizing security or UI/UX.

The "dailybuglemicroservices" project is a microservices-based web application for The Daily Bugle, implementing functional and non-functional requirements to create a dynamic and user-friendly news platform. The functional requirements outline key features such as displaying stories with text and optional images, allowing non-authenticated users to read stories, enabling comments on stories, and implementing a search functionality. Additionally, the project focuses on tracking user interactions with ads. Non-functional requirements specify user roles, views for different user types, and detailed criteria for ad event tracking. The project adheres to constraints like microservices architecture, using HTML, Node.js, and MongoDB for data storage. It also includes the development of a login page and authentication service, ensuring that individual services and microservices are containerized for better scalability and maintainability, leveraging Docker. Furthermore, the project involves writing a custom API to facilitate seamless communication and interaction between microservices, providing a tailored and efficient protocol for the Daily Bugle web application.


The Daily Bugle Functional Requirements
1. Displays stories
2. Stories contain text (R) and images (NTH)
3. Stories can be read by non-authenticated users
4. Comments can be added to a story
5. Stories can be searched
6. Interaction with ads must be recorded for tracking

The Daily Bugle Non-Functional Requirements
1. Any authenticated user may comment
2. Only the Author role can create or edit a story
3. The view for an anonymous user (not logged in) is a list of stories
4. The view for an anonymous user contains an ad
5. The view for a logged in user is one story at a time, with appropriate edit controls
6. The view for an Author user does not contain an ad (NTH)
7. An ad event can be an impression (view) or interaction (click)
8. An ad event should record the userid or anon, ip address and user agent

The Daily Bugle Constraints
1. The application will use a microservice design, utilizing HTML, Node, JS
2. You must write the login page and authentication service
3. Any individual services (HTTPD, DB) will live in a separate container
4. Any individual microservices (Node) will live in a separate container
5. Use MongoDB for data
