variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "app_version" {
  type    = string
  default = "1.0.0"
}

locals {
  common_tags = {
    Environment = "proyecto_cloud"
    Name        = "proyecto_cloud_django_app"
  }
}
