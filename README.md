# Cloud Project
This project deploys the REST MIMO Movies API in the cloud using a scalable architecture, automated through:
- Docker
- Infrastructure as Code
- AMIs creation

It transforms a local API into a fully automated, scalable, cloud-native deployment on AWS.

The infrastructure includes:
- Custom VPC
- Public and private subnets
- Internet Gateway
- Application Load Balancer (ALB)
- Auto Scaling Group (ASG)
- EC2
- RDS MySQL
- S3
- Security Groups configured per module
- Custom AMI created with Packer

## General architecture
Internet
   │
   ▼
ALB (port 80)
   │
   ▼
EC2 (Docker container - MIMO Movies)
   │
   ▼
RDS MySQL (private subnets)

proyectoCloud/
│
├── MIMO Movies/
│
├── docker/
│   └── Dockerfile
│
├── aws/
│   ├── packer/
│   └── terraform/
│
└── README.md

## MIMO Movies API(Express + TypeScript)
A RESTful API for managing movies, ratings, and personalized watchlists.
Built with **TypeScript**, **Express**, **Sequelize**, and **SQLite**, following a layered architecture and clean separation of concerns.

### MIMO Movies API provides:
1. A paginated movie catalog
2. Average rating calculation per movie
3. User-based rating system (one rating per user per movie)
4. Authenticated watchlist management
5. API key–based authentication
6. Request validation and structured error handling

It simulates a production-ready backend for a movie platform where users can rate movies and maintain personal watchlists.

### Problem it solves
Modern applications (web or mobile) often require:
- A movie catalog with aggregated metrics (e.g., average ratings)
- User-specific actions (ratings, watchlists)
- Controlled access to private resources
- Pagination for scalable data retrieval

This project solves those requirements by:
- Providing structured relational data models
- Enforcing business rules at controller and model level
- Implementing API key authentication
- Returning paginated responses with metadata
- Computing aggregated ratings directly at database level

### Architecture and design

```
src/
 ├── app.ts
 ├── config/
 ├── db.ts
 ├── models/
 ├── controllers/
 ├── routes/
 ├── middlewares/
 ├── schemas/
 └── utils/
scripts/
 ├── seed.ts
 └── reset.ts
```

#### Routing layer
Defines HTTP endpoints using Express routers:
- `/movies`
- `/movies/:movieId/ratings`
- `/watchlist/:userId`

#### Controllers
Contain application logic:
- Validate route parameters
- Apply business rules
- Handle authorization checks
- Format JSON responses
- Set correct HTTP status codes

For example:
- A user cannot rate the same movie twice
- A user can only modify their own ratings
- A user can only access their own watchlist

#### Models
Implemented using **Sequelize ORM**.

Responsibilities:
1. Query abstraction
2. Pagination handling
3. Aggregation (AVG rating calculation)
4. Association management

Notable feature:

##### Average rating calculation
Movies are retrieved with:
```ts
Sequelize.fn("AVG", Sequelize.col("ratings.rating"))
```

This ensures average ratings are computed at database level (efficient and scalable).

#### Middleware layer

#####  `verifyToken`
- Reads `x-api-key` header
- Validates user existence
- Attaches `userId` to request

##### `validatePayload`
- Uses Joi for request body validation
- Returns `422 Unprocessable Entity` on invalid input

##### `respondTo`
- Enforces `application/json` responses
- Returns `406 Not Acceptable` otherwise

##### Error handling
- Centralized 500 handler
- 404 fallback handler

#### Authentication strategy
The API uses **API Key authentication**:
- Users have a unique `apiKey`
- The client must send:
```
x-api-key: YOUR_API_KEY
```

Protected endpoints:
- Create / Update / Delete ratings
- All watchlist endpoints

Public endpoints:
- GET movies
- GET ratings

### Technologies Used

#### TypeScript
- Static typing
- Better maintainability
- Safer refactoring

#### Express
- Minimal and flexible HTTP framework
- Middleware-based architecture

#### Sequelize
- ORM abstraction
- Associations
- Aggregations
- Pagination support

#### SQLite
- Lightweight file-based database
- Ideal for local development and testing

#### Joi
- Declarative schema validation
- Clean error reporting

### Database Design

#### Tables
- `users`
- `movies`
- `ratings`
- `watchlist_items`

#### Relationships
- User → has many Ratings
- User → has many WatchlistItems
- Movie → has many Ratings
- Movie → has many WatchlistItems

#### Constraints
- Unique rating per user per movie
- Unique watchlist item per user per movie

### Pagination
Supported via query parameters:
```
?page=1&limit=10
```

Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Database seeding
The project includes scripts to:
- Reset database
- Populate test data

#### Reset database
- Deletes SQLite file
- Recreates schema

If you want to run alone:
```bash
npm run db:reset
```

#### Seed database
Creates:
- 3 users
- 25 movies
- 10 ratings
- 9 watchlist items

It also prints test API keys in the console.

If you want to run alone:
```bash
npm run db:seed
```

### API endpoints

#### Movies
| Method | Endpoint           | Authentication | Description                                       |
| ------ | ------------------ | -------------- | ------------------------------------------------- |
| GET    | `/movies`          |   No           | Paginated list of movies including average rating |
| GET    | `/movies/:movieId` |   No           | Retrieve a single movie with its average rating   |

#### Ratings
| Method | Endpoint                             | Authentication     | Description                                      |
| ------ | ------------------------------------ | ------------------ | ------------------------------------------------ |
| GET    | `/movies/:movieId/ratings`           |   No               | Get all ratings for a specific movie (paginated) |
| POST   | `/movies/:movieId/ratings`           |   API Key required | Create a rating for a movie (one per user)       |
| PATCH  | `/movies/:movieId/ratings/:ratingId` |   API Key required | Update a user’s own rating                       |
| DELETE | `/movies/:movieId/ratings/:ratingId` |   API Key required | Delete a user’s own rating                       |


#### Watchlist
| Method | Endpoint                           | Authentication     | Description                               |
| ------ | ---------------------------------- | ------------------ | ----------------------------------------- |
| GET    | `/watchlist/:userId`               |   API Key required | Get paginated watchlist for a user        |
| POST   | `/watchlist/:userId/items`         |   API Key required | Add a movie to the user’s watchlist       |
| PATCH  | `/watchlist/:userId/items/:itemId` |   API Key required | Update watched status of a watchlist item |
| DELETE | `/watchlist/:userId/items/:itemId` |   API Key required | Remove a movie from the watchlist         |

## Docker

### Why?
1. Encapsulates the application
2. Guarantees consistency across environments
3. Simplifies deployment inside EC2

Dockerfile:
- Starts on Ubuntu 24.04
- Install:
   - AWS CLI
   - Terraform
   - Packer
   - Python
   - Git
- Configure a complete DevOps environment
- Runs bash by default
- This container is a portable DevOps machine, not just for the API.

## Packer
Packer creates a custom AMI in AWS that:
   - Installs Docker
   - Copies the MIMO Movies project
   - Builds the Docker image
   - Leaves the instance ready to run the app

Result: An AMI ready to production

### Problem it solves:
1. Avoids slow bootstrapping
2. Avoids runtime installation scripts
3. Ensures immutable infrastructure

## Terraform:
- Terraform defines the entire infrastructure on AWS.

```
Modular structure:
   terraform/
   ├── modules/
   │   ├── vpc/
   │   ├── subnet/
   │   ├── internet_gateway/
   │   ├── route/
   │   ├── alb/
   │   ├── asg/
   │   ├── ec2_instance/
   │   ├── rds/
   │   ├── s3/
   │   └── security_group_rule/
   │
   ├── network.tf
   ├── ec2.tf
   ├── alb.tf
   ├── asg.tf
   ├── rds.tf
   ├── s3.tf
   ├── provider.tf
   ├── variables.tf
   └── outputs.tf
```

### Problem it solves:
1. Manual AWS configuration
2. Error-prone console setup
3. Non-versioned infrastructure
4. Lack of reproducibility


### Terraform modules
Each module encapsulates a specific AWS resource.

#### vpc/
Isolates infrastructure in a private network.

Creates:
- Custom VPC
- Enabled DNS hostnames
- Output:
- vpc_id
- Default route table
- Default security group

#### subnet/
- Dynamically creates multiple subnets using for_each.
- Used for:
   - Public subnets (EC2, ALB)
   - Private subnets (RDS)

- Solves:
   - Security best practices
   - Database isolation

#### internet_gateway/
- Enables the VPC to have internet access.

#### route/
- Creates routes in a route table.

Example:
- 0.0.0.0/0 → Internet Gateway

#### alb/
Creates:
- Application Load Balancer
- Target Group
- HTTP Listener (port 80)
- Health check in /movies
- Distributes traffic to EC2.

#### asg/
Creates:
- Launch Template
- Auto Scaling Group
- Connects to the ALB Target Group
- Allows automatic scaling between 1 and 2 instances.

#### ec2_instance/
- Creates EC2 instances directly (without ASG).
- Includes:
   - user_data
   - SSH key
   - Network configuration

#### rds/
Managed database service

Creates:
- DB Subnet Group
- RDS MySQL 8.0
- Private Security Group
- Databases in private subnets.

#### s3/
Object storage

Creates:
- Bucket
- ​​Optional versioning
- AES256 encryption

#### security_group_rule/
- Allows creating security group rules as a reusable module.
- Excellent modular practice.
- Act as virtual firewalls.

## Installation
1. Clone the repository
git clone https://github.com/AdrianMalmierca/Cloudproject

From MIMO Movies/:
2. Builds a Docker image named mimo-movies from the current directory (.).
``` bash 
docker build -t mimo-movies .
```

Runs the mimo-movies container, exposing port 3000 to access the app locally.
``` bash
docker run -p 3000:3000 mimo-movies
```

Try in the browser: http://localhost:3000/movies

From root (Cloudproject):

3. Starts a container with AWS credentials and the current workspace mounted, for executing Packer or Terraform commands interactively.
```bash
docker run -it --rm \
  -v ~/.aws:/root/.aws \
  -v $(pwd):/workspace \
  -w /workspace/aws/packer \
  terraform-packer-awscli \
  bash
```

## Packer execution
Before running the Packer commands, ensure you have initialized the Packer configuration. This step downloads the necessary plugins.

```bash
packer init .
```

### Packer formatting
Format your template. Packer will print out the names of the files it modified, if any. In this case, your template file was already formatted correctly, so Packer won't return any file names.

```bash
packer fmt .
```

### Packer validation
Validate your template. If Packer detects any invalid configuration, Packer will print out the file name, the error type and line number of the invalid configuration. The example configuration provided above is valid, so Packer will return nothing.

```bash
packer validate .
```

### Building the AMI
Build the image with the packer build command. Packer will print output similar to what is shown below.

### Using default variable values
```bash
packer build .
```

## Terraform execution
```bash
cd /workspace/aws/terraform
```

### Terraform initialization
Before running the Terraform commands, ensure you have initialized the Terraform configuration. This step downloads the necessary provider plugins.
```bash
terraform init
```

### TF_VAR_ami_id
Assigns the ID of the custom AMI (created by Packer) to the Terraform variable ami_id.
Terraform uses this AMI when launching EC2 instances or Auto Scaling Groups (ASG).

```bash
export TF_VAR_ami_id=ami-x
```

### TF_VAR_rds_password
Assigns the admin password for the RDS MySQL database to the Terraform variable rds_password.
This avoids hardcoding sensitive credentials in your code.

```bash
export TF_VAR_rds_password="PasswordSegura123!"
```

### Terraform Plan
To see what changes Terraform will make to your AWS environment, run the following command. This generates an execution plan without making any changes.

> You can use the `-out` option to save the plan to a file for later execution:

```bash
export TF_VAR_rds_password="tu_password_segura"
terraform plan -out=tfplan
```

###Terraform Apply
To apply the changes defined in your Terraform configuration, run the following command. This will create the networking resources in your AWS account.

> After running this command, Terraform will prompt you to confirm the changes. Type `yes` to proceed.

```bash
terraform apply tfplan
```

### Terraform output
Prints the values of output variables defined in your Terraform modules.
For example, it can show:
- ec2_instance_public_ip → Public IP of your EC2 instance
- rds_endpoint → Endpoint to connect to the RDS database
- s3_bucket_name → Name of your S3 bucket
- alb_dns_name → DNS name of your Application Load Balancer

```bash
terraform output
```

## SSH conection to EC2 Instance
To connect to the EC2 instance created by Terraform, you need to use SSH. A key pair is generated during the Terraform apply process, and you can use it to connect to the instance.

```bash
ssh -i ec2_key.pem ubuntu@<EC2_INSTANCE_PUBLIC_IP>
```

## Terraform Destroy
To clean up and remove all the resources created by Terraform, you can run the destroy command. This will delete all the resources defined in your Terraform configuration.

```bash
cd aws/terraform
```

```bash
terraform destroy
```

## Key backend concepts demonstrated
- RESTful API design
- Layered architecture
- Authentication middleware
- Database aggregation queries
- Pagination patterns
- Validation with Joi
- Error handling best practices
- Business rule enforcement
- Separation of concerns

## Key cloud and infrastructure concepts demonstrated
- Infrastructure as Code (IaC) using Terraform
- Immutable infrastructure with Packer
- Custom AMI creation on Amazon Web Services
- Containerized deployment with Docker
- Virtual Private Cloud (VPC) network design
- Public and private subnet segmentation
- Internet Gateway and route table configuration
- Security Groups with granular ingress/egress rules
- Application Load Balancer (ALB) architecture
- Target Groups and health checks configuration
- Auto Scaling Group (ASG) with Launch Templates
- Bootstrapping instances via user_data
- Managed relational database provisioning with Amazon RDS (MySQL 8)
- Private database access restricted by security groups
- S3 bucket provisioning with versioning and server-side encryption
- Key pair generation and SSH access management
- Modular Terraform architecture (reusable modules)
- Sensitive variable handling via environment variables (TF_VAR_*)
- Multi-AZ subnet distribution for high availability
- Separation of application layer and infrastructure layer
- Declarative resource provisioning and state management

## What did I learn?
This project has helped me learn how to create an API from scratch. I've also learned how to do it using Packer and Terraform. Although the cloud part is quite complex and not something a junior programmer can easily do, little by little I've come to understand what each part does, and how each part individually forms the whole.

## Author
Adrián Martín Malmierca 

Computer Engineer & Mobile Applications Master's Student