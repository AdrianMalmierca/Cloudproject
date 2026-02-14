variable "ami_id" {
  description = "AMI creada por Packer"
  type        = string
}

variable "instance_type" {}
variable "key_name" {}
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "target_group_arn" {}
variable "user_data" {}
