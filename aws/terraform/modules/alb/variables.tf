variable "name" {}
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "vpc_id" {}
variable "target_port" {
  default = 3000
}

variable "tags" { type = map(string) }
