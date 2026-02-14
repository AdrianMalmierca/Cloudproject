module "s3_bucket" {
  source        = "./modules/s3"
  bucket        = "proupsa-bucket-proyecto-cloud"
  force_destroy = false
  versioning    = true
  tags = {
    Environment = "proyecto_cloud"
    Name        = "proupsa-bucket-proyecto-cloud"
  }
}
