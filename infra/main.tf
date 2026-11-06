locals {
  platform_name = "meter-platform"
  api_url       = "https://api.meter.example"
  data_kind     = "synthetic"
}

output "platform_name" {
  value = local.platform_name
}

output "api_url" {
  value = local.api_url
}

output "data_kind" {
  value = local.data_kind
}