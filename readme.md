# Recruitment Management System(RMS)
Web based application to streamline the recruitment process. Built as a SaaS for recruiters, candidates, HRs, interviewers and hiring managers to efficiently manage job postings, candidate sourcing, screening, interviews, and reducing time by taking data driven decisions.

## Technology Stack
- **Spring Boot** 
- **PostgreSQL**
- **React** 
- **React**  (**Vite**) 
- **Zustand** - State Management for react 
- **RabbitMQ** (Message Queue)

## Features Implemented

### Authentication & Authorization
- User registration with role assignment
- JWT-based authentication
- Role-based access control

### Job Management
- Create, read, update, delete job postings
- Search and filter job listings
- Job status management (Active/closed)
- Pagination for job listings
- Assign reviewers to open positions
- Manage applicants for a job

### Application Management
- Submit job applications
- Track application status
- Update application workflow
- File upload for resumes/documents
- Change application status and remarks.
- Candidates linked to positions based on skills.
- Reviewers can review assigned job applications.
- Tick skills a candidate posses and add remarks to application

### User Management
- User profile management by Admins
- Role-based user operations
- User authentication and authorization
- Bulk Upload candidates by recruiters through excel or add manually
- Manage users for a company by recruiters

### Interview Management
- Applications moved to interview stage with default or custom rounds for candiates.
- Flexibility to define interview rounds and assign interviewers.
- Schedule online test
- Meeting invites to respective users.
- Interviewers and HR can add feedback to rounds.

## Document Verification
- HR can verify documents and assign joining date
- Application can be put on hold based on verification stauts and feedback 

### Notifications & Messaging
- RabbitMQ for email notifications
    - For OTPs
    - Meeting invites
    - Offer letters
    - Application status updates
    - Job match alerts
    - Scheduled interview updates

## Admin Functionalities
- Delete users
- Update user profile (password and name)
- Update user roles

## Installation and Setup

### Prerequisites

- Java JDK 21
- Node.js (v18+)
- PostgreSQL installed and running
- Maven

### 1. Clone the Repository
```bash
git clone https://github.com/parthmahaa/RMS
cd RMS
```

### 2. Create a PostgreSQL database

1. Create the database (using psql):
```bash
# create database
psql -U postgres -c "CREATE DATABASE rms;"
```

2. Update backend configuration:
- Replace the placeholder values with your Postgres credentials and any Cloudinary settings.

```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/rms
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password
spring.jpa.hibernate.ddl-auto=update

# RabbitMQ Configuration
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

### 3. Run RabbitMQ via Docker
```bash
docker run -d --name rms-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:rms
```
- You can access the RabbitMQ dashboard at http://localhost:15672 (User: guest, Pass: guest).

### 4. Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
The backend will run at http://localhost:8080

### 5. Run frontend
```bash
cd client
npm install
npm run dev
```

## Project Structure
```
RMS/
├── backend/       # Spring Boot Application
│   ├── src/
│   ├── pom.xml
│   └── ...
├── client/        # React + Vite Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```
## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/verify            - Verify Token
POST   /api/auth/activate-account  - Activate imported users account
POST   /api/auth/verify-otp        - Verify otp for verification
```

### Jobs
```
GET    /api/jobs               - Get all jobs for company
GET    /api/jobs/{id}          - Get job by ID
POST   /api/jobs               - Create new job (Recruiter)
PUT    /api/jobs/{id}          - Update job (Recruiter)
DELETE /api/jobs/{id}          - Delete job (Admin)
GET    /api/jobs/open          - Get open jobs for a company (Candidate)
PUT    /api/jobs/status/id     - Close job (Recruiter)
GET    /api/jobs/assinged      - Get assigned jobs (Reviewer)
```

### Applications
```
POST   /api/application               - Submit application (Candidate)
GET    /api/application/jobs/{id}     - Get all applications for a job
GET    /api/application/{id}          - Get application by ID
GET    /api/application/candidate     - Get all application of a canidate
PUT    /api/application/{id/}/status  - Update application status
```

### Recruiter 
```
POST   /api/recruiter/bulk-upload       - Upload candidates from excel 
GET    /api/recruiter/auto-match        - Link canidates to jobs
POST   /api/recruiter/candidate         - Create candidate
POST   /api/recruiter/add               - Add user to company
DELETE /api/recruiter/delete/id         - Delete user by recruiter
GET    /api/recruiter/employees         - Get company employees
POST   /api/recruiter/jobs/{id}/assign  - Assign reviewers to jobs  

```
### Skills
```
GET   /api/skills     - Get all skills
```

### Interview
```
GET   /interviews/assigned              - Get assigned interviews 
POST  /interviews/rounds/{id}/assign    - Assign interviewers to round
POST   /interviews/rounds/{id}/feedback - Give feeback for rounds.
GET   /interviews/company               - Get interviews for a company
POST  /interviews/{id}/verify           - Verify documents
GET   /interviews/my                    - Scheduled interviews for a canidate
POST  /interviews/{id}/documents        - Upload documents by candidate
POST  /interviews/{id}/verify           - Verify documents
```

### Admin
```
GET    /api/admin/users               - Get all users
PUT    /api/admin/users/{id}          - Update a user
GET    /api/admin/users/{id}          - Delete a user
GET    /api/admin/users/{id}/roles    - Update a role for a user
```
### Users/
```
GET    /api/user/status        - Profile completion status
GET    /api/user/profile       - Get user profile details(Recruiter,Candidate)
PUT    /api/user/profile       - Update user profile(Recruiter,Candidate)
```

## Current Limitations

- Reporting and analysis module not implemented
- Generation of offer letters
- Automated scoring mechanism
- Create candidate from CV parsing
- Notification channel for web notifications
- Dashboard design

