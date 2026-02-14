resource "aws_launch_template" "this" {
  name_prefix   = "api-template-"
  image_id      = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  user_data = base64encode(var.user_data)

  network_interfaces {
    security_groups = var.security_group_ids
  }
}


resource "aws_autoscaling_group" "this" {
  desired_capacity     = 1
  max_size             = 2
  min_size             = 1
  vpc_zone_identifier  = var.subnet_ids
  target_group_arns   = [var.target_group_arn]

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "api-asg"
    propagate_at_launch = true
  }
}
