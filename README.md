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
```
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
```
```
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
```

## MIMO Movies API(Express + TypeScript)
This project is an extension of my other project Api with testing in [**Github**](https://github.com/AdrianMalmierca/Api-with-testing)

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