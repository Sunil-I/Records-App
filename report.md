# COM519 Assignment 1 (CRUD Application)

Author: Sunil Islam https://github.com/Sunil-I/
Github repository: https://github.com/Sunil-I/Records-App/
Hosted application: https://com519-production.herokuapp.com/

### Introduction

For this assignment we were tasked to create, test and deploy a proof of concept data-driven full-stack web application, this application was supposed to solve a problem in life. I have decided to make a small budgeting/record-keeping app that would keep track of your finances and allow you to extend the functionality of the application by allowing a flexible API along with the power to extend the code by adding flexible features such as importing records.

The goal for this application was to allow users to create bank accounts and transactions that would update as you add more transactions, ideally features such as importing transactions/accounts along with exporting them would also be added. The application would also support many forms of authentication to allow a smoother experience.

### System Overview

Data is stored in a non-relational database called MongoDB, this would store persistent data such as user sessions, user data and keep track of things such as transactions and bank accounts. The design of the database models would be minimal but informative as there aren't too many relationships. It was decided to keep the design minimal and consistent to allow users to navigate the site with ease. Users would find themselves familiar with the site as they browse due to the pages being similar.

#### key system components

**Home Page:**
As you can see the home page only contains a welcome message and some basic information to help the user, at the top is our navigation bar which has a dropdown for certain actions such as creating a new record.
![home page](https://i.imgur.com/w5vuitM.png)

**Accounts Page**:
The accounts page is one of the main pages where the users can interact with their accounts with a simple layout of a table with their accounts being listed with the ability to either view, edit or delete their account from the front page.
![Accounts Page](https://i.imgur.com/fFjmCAQ.png)
![View Account](https://i.imgur.com/6T2HaT9.png)
![Edit Account](https://i.imgur.com/7ciS3SF.png)
**Transactions Page**:
The transactions page is one of the main pages where the users can interact with their transactions with a simple layout of a table with their transactions being listed in newest to oldest with the ability to either filter or delete their transaction from the front page.
![Transactions Page](https://i.imgur.com/jwfMGyv.png)

### Key Design Decisions

#### Database Design

It was decided that MongoDB would be the main database to be used as MongoDB has a free tier solution on their hosted databases allowing the application to have a free way of hosting when mixing heroku and MongoDB Atlas together. It was also decided due to the node wrapper mongoose which has its own form of validation and making it easy to store the data in a format.

#### Security and Scalability

Security and Scalability are one of the most important points to consider when it comes to making an public facing application that would also contain sensitive data, this is why that it is important basic security is implemented such as the use of the https protocol which ensures that data transmitted is encrypted, privilaged endpoints or data are secured by sessions which are timed and only given when the server is able to identify the user.

Privilaged endpoints require a valid user session to proceed along with multiple checks to ensure the correct data is sent. The app is also scableable due to the front end and backend being mostly static and data is being sent/fetched from the same database so we could employ k3s/k8s or load balancing to the application if need be.

### Conclusion and Reflection

In conclusion I believe that this project has helped me improve my skills with node.js and front end since I went outside of what was taught in the unit and used technologies not taught in the unit and tried new things while developing the application. I wish I had more time to develop the project as many of my ideas were going to be added but deemed not essential enough to be added.

Looking back I do wish I choose a different problem which would allow me to extend different technologies and look into going outside of my current skillset. I believe that while my application does sort an problem of mine which is keeping track of finnances while allowing the abilty to extend features or incorapte the data stored into different applications I do think that in certain places I could've done things better or looked into a more efficent way of handling things e.g making the code more easier to read.

If I had more time I would've loved to add features such as dissmisble banners for issues such as wrong credentials, unveirfied emails and making other error types a banner. Although I did manage to add welcome emails, dynamic validation, JSON error handling and structured functions.
