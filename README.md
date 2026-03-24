# Cloud Project — AWS Infrastructure as Code with Docker, Packer & Terraform

![Docker](https://img.shields.io/badge/Docker-24-2496ED?style=flat-square&logo=docker)
![Terraform](https://img.shields.io/badge/Terraform-1.x-7B42BC?style=flat-square&logo=terraform)
![Packer](https://img.shields.io/badge/Packer-1.x-02A8EF?style=flat-square&logo=hashicorp)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20ALB%20%7C%20ASG-FF9900?style=flat-square&logo=amazonaws)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

A cloud-native deployment pipeline that transforms a local REST API into a fully automated, scalable AWS infrastructure — provisioned entirely through Infrastructure as Code using Terraform, Packer, and Docker.

---

## Live Demo

🔗 [http://example-alb-1756634364.eu-west-1.elb.amazonaws.com/movies](http://example-alb-1756634364.eu-west-1.elb.amazonaws.com/movies)

---

## Problem Statement

Deploying a local API to a production-grade cloud environment typically involves manual console configuration, fragile bootstrapping scripts, and non-reproducible setups. This project solves that by:

- Automating the entire infrastructure lifecycle with Terraform modules
- Creating immutable, pre-baked AMIs with Packer to avoid runtime installs
- Containerizing the application with Docker for environment consistency
- Enforcing network security through VPC segmentation and Security Groups

---

## Architecture
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

---

## Screenshots

### Packer — AMI Creation
Custom AMI built and registered in AWS after a successful Packer build.

![Packer finished](assets/packer%20finished.png)

![Snapshot](assets/ami.png)

### Terraform — Infrastructure Output
Full infrastructure provisioned: VPC, subnets, ALB, ASG, RDS, and S3.

![Terraform finished](assets/terraform%20finished.png)

### Networking
VPC dashboard showing configured networks and subnets.

![Nets](assets/redes.png)

![Subnets](assets/subredes.png)

### API — Endpoints in Action

![GET movies](assets/GET%20movies.png)

![GET movie by id](assets/GET%20movie%20by%20id.png)

![GET ratings](assets/GET%20ratings.png)

---

## Features

### Docker
- Encapsulates the application for environment consistency
- Dockerfile based on Ubuntu 24.04
- Installs AWS CLI, Terraform, Packer, Python, and Git
- Acts as a portable DevOps machine — not just an app container

### Packer
- Creates a custom AMI pre-loaded with Docker and the app image
- Avoids slow bootstrapping and runtime installation scripts
- Guarantees immutable, production-ready infrastructure from day one

### Terraform
- Defines the entire AWS infrastructure declaratively
- Fully modular architecture — each AWS resource is an independent, reusable module
- Sensitive variables handled via environment variables (`TF_VAR_*`)
- State-managed and reproducible across environments

### MIMO Movies API
- RESTful Express + TypeScript API with full CRUD operations
- JWT-based authentication middleware
- Endpoints: movies, ratings, and watchlists
- Layered architecture with validation (Joi), pagination, and error handling

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Containerization | Docker | Environment consistency, simplified EC2 deployment |
| AMI Creation | Packer | Immutable infrastructure, no runtime bootstrapping |
| Infrastructure | Terraform | IaC, modular, versioned, reproducible |
| Cloud Provider | AWS (EC2, RDS, ALB, ASG, S3, VPC) | Industry-standard scalable cloud platform |
| API Framework | Express + TypeScript | Type-safe REST API with layered architecture |
| Database | RDS MySQL 8.0 | Managed relational DB in private subnets |
| Load Balancing | Application Load Balancer | Traffic distribution and health checks |
| Scaling | Auto Scaling Group | Automatic scaling between 1–2 instances |

---

## Project Structure
```
proyectoCloud/
│
├── MIMO Movies/              # Express + TypeScript REST API
│
├── docker/
│   └── Dockerfile            # DevOps environment image
│
├── aws/
│   ├── packer/               # AMI build configuration
│   └── terraform/
│       ├── modules/
│       │   ├── vpc/
│       │   ├── subnet/
│       │   ├── internet_gateway/
│       │   ├── route/
│       │   ├── alb/
│       │   ├── asg/
│       │   ├── ec2_instance/
│       │   ├── rds/
│       │   ├── s3/
│       │   └── security_group_rule/
│       ├── network.tf
│       ├── ec2.tf
│       ├── alb.tf
│       ├── asg.tf
│       ├── rds.tf
│       ├── s3.tf
│       ├── provider.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── README.md
```

---

## Running Locally
```bash
# Clone the repository
git clone https://github.com/AdrianMalmierca/Cloudproject
```
```bash
# Build and run the API container
cd MIMO\ Movies/
docker build -t mimo-movies .
docker run -p 3000:3000 mimo-movies
```
```bash
# Build the DevOps image (Terraform + Packer + AWS CLI)
cd ..
docker build -t terraform-packer-awscli -f docker/Dockerfile .

# Start interactive container with AWS credentials mounted
docker run -it --rm \
  -v ~/.aws:/root/.aws \
  -v $(pwd):/workspace \
  -w /workspace/aws/packer \
  terraform-packer-awscli \
  bash

# Configure AWS credentials
aws configure
```

---

## Packer Execution
```bash
# Initialize, format, validate, and build the AMI
packer init .
packer fmt .
packer validate .
packer build .
```

Keep the resulting AMI ID — it's required for the Terraform step.

---

## Terraform Execution
```bash
cd /workspace/aws/terraform

# Initialize providers
terraform init

# Set required variables
export TF_VAR_ami_id=ami-xxxxxxxxxxxxxxxxx
export TF_VAR_rds_password="PasswordSegura123!"

# Preview and apply
terraform plan -out=tfplan
terraform apply tfplan

# View outputs (ALB DNS, RDS endpoint, S3 bucket, EC2 IP)
terraform output
```

Replace `localhost:3000` with the `alb_dns_name` output to access the deployed API:
```
Before: http://localhost:3000/movies
After:  http://<alb_dns_name>/movies
```

### SSH Access
```bash
ssh -i ec2_key.pem ubuntu@<EC2_INSTANCE_PUBLIC_IP>
```

### Teardown
```bash
cd aws/terraform
terraform destroy
```

---

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/movies` | Public | Get all movies |
| GET | `/movies/:id` | Public | Get movie by ID |
| GET | `/movies/:id/ratings` | Public | Get all ratings for a movie |
| GET | `/movies/:id/ratings/:ratingId` | Public | Get a specific rating |
| POST | `/movies/:id/ratings` | Required | Add a rating |
| PATCH | `/movies/:id/ratings/:ratingId` | Required | Update a rating |
| DELETE | `/movies/:id/ratings/:ratingId` | Required | Delete a rating |
| GET | `/watchlist/:userId` | Required | Get user watchlist |
| POST | `/watchlist/:userId/items` | Required | Add to watchlist |
| PATCH | `/watchlist/:userId/items/:itemId` | Required | Update watched status |
| DELETE | `/watchlist/:userId/items/:itemId` | Required | Remove from watchlist |

---

## Terraform Modules

| Module | Resource | Purpose |
|--------|----------|---------|
| `vpc/` | Custom VPC | Isolated private network with DNS |
| `subnet/` | Public + Private Subnets | EC2/ALB public, RDS private |
| `internet_gateway/` | IGW | VPC internet access |
| `route/` | Route Tables | `0.0.0.0/0 → IGW` |
| `alb/` | ALB + Target Group | Load balancing + health checks on `/movies` |
| `asg/` | Launch Template + ASG | Auto-scaling 1–2 instances |
| `ec2_instance/` | EC2 | Direct instance with SSH + user_data |
| `rds/` | RDS MySQL 8.0 | Managed DB in private subnets |
| `s3/` | S3 Bucket | Object storage with AES256 + versioning |
| `security_group_rule/` | Security Groups | Reusable virtual firewall rules |

---

## What I Learned Building This

### Infrastructure as Code Mindset
The biggest shift was thinking declaratively — describing *what* infrastructure should exist rather than *how* to create it. Terraform's state model made me understand why reproducibility matters: the same configuration applied twice should produce identical results.

### Immutable Infrastructure with Packer
Pre-baking AMIs eliminates the fragility of bootstrapping scripts. If a script fails halfway through on instance launch, the instance is in an unknown state. With a Packer-built AMI, the image is either ready or it isn't — there's no in-between.

### Network Segmentation in Practice
Putting RDS in private subnets with security groups that only allow traffic from EC2 security groups made abstract security concepts concrete. The database is physically unreachable from the internet — not just password-protected.

### Modular Terraform Architecture
Extracting each AWS resource into its own module forced clean interfaces between components. It also made it much easier to reason about what each piece does and to reuse modules across environments.

### Sensitive Variable Handling
Using `TF_VAR_*` environment variables instead of hardcoded values in `.tf` files was a key practice — secrets never end up in version control, yet Terraform picks them up automatically at runtime.

---

## Future Improvements

### Short Term
- **HTTPS** — add ACM certificate and HTTPS listener on the ALB
- **Secrets Manager** — store RDS credentials in AWS Secrets Manager instead of env vars
- **Automated tests** — integrate API tests into the CI pipeline

### Medium Term
- **CI/CD pipeline** — GitHub Actions workflow to build, test, and deploy on push
- **CloudWatch** — add monitoring, alarms, and log groups for EC2 and RDS
- **Multi-environment** — separate `dev`, `staging`, and `prod` Terraform workspaces

### Long Term
- **ECS/Fargate** — replace EC2 + ASG with a managed container orchestration layer
- **RDS Multi-AZ** — enable standby replica for high availability
- **Terraform Cloud** — remote state management and team collaboration

---

## Key Concepts Demonstrated

### Backend
- RESTful API design with layered architecture
- Authentication middleware and JWT validation
- Database aggregation queries and pagination
- Validation with Joi and error handling best practices

### Cloud & Infrastructure
- Infrastructure as Code (IaC) with Terraform
- Immutable infrastructure with Packer and custom AMIs
- Containerized deployment with Docker
- VPC design with public/private subnet segmentation
- Security Groups with granular ingress/egress rules
- ALB with Target Groups and health checks
- Auto Scaling Group with Launch Templates
- Managed RDS provisioning in private subnets
- S3 with versioning and server-side encryption
- Modular Terraform architecture with reusable modules
- Sensitive variable handling via `TF_VAR_*`
- Multi-AZ subnet distribution for high availability

---

## License

MIT — free to use, modify, and deploy.

---

## Author

**Adrián Martín Malmierca**  
Computer Engineer & Mobile Applications Master's Student  
[GitHub](https://github.com/AdrianMalmierca) · [LinkedIn](https://www.linkedin.com/in/adri%C3%A1n-mart%C3%ADn-malmierca-4aa6b0293/)

*Built as a portfolio project to demonstrate cloud infrastructure skills targeting the French tech market — ESNs and consulting firms in Burgundy/Dijon.*