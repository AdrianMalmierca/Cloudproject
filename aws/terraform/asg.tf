module "asg" {
  source = "./modules/asg"

  ami_id             = var.ami_id
  instance_type      = "t3.micro"
  key_name           = aws_key_pair.ec2-key-pair.key_name
  subnet_ids         = module.public_subnets.subnet_ids
  security_group_ids = [aws_security_group.ec2.id]
  target_group_arn   = module.alb.target_group_arn

  user_data = <<-EOF
#!/bin/bash
docker run -d \
  --restart always \
  -p 3000:3000 \
  mimo-movies
EOF
}
