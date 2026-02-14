module "alb" {
  source = "./modules/alb"

  name               = "example-alb"
  subnet_ids         = module.public_subnets.subnet_ids
  security_group_ids = [aws_security_group.alb.id]
  vpc_id             = module.vpc.vpc_id
  tags = {
    Environment = "example"
  }
}

