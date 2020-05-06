---
title: AWS automation with terraform 
author: Jake VanCampen
date: '2020-02-01'
tags: [terraform, aws, automation]
comments: true
image: "https://source.unsplash.com/ZY7X8S_CnWI" 
---

I am testing the automation of setting up and tearing down AWS resources using [terraform](https://www.terraform.io/), a tool to create infrastructure as code. This example recipe will setup a small EC2 instance and output the command needed to login to it. 

I downloaded terraform with `brew install terraform`. Then I created a new directory and inside created the file `terraec2.tf`. 

The first section I added to the .tf file is the provider. The profile attribute is set to "default", which tells terraform to look for your AWS credentials in the file `~/.aws/credentials` on a unix-based operating system. You have to place your AWS credentials there manually, or set it up with the AWS command-line interface.

```bash
# list provider and regions
provider "aws" {
    profile = "default"
    region = "us-west-2"
}
```

Then I add a variable that corresponds to a public ssh key. It can be a new one or one you already have, but permissions must be `chmod 400`, read-only. Setting this variable allows it to be accessed later in the script via `var.public_key` shown below.

```bash
variable "public_key" {
    type=string
    default="~/.ssh/id_rsa.pub"
}

# define aws_key_pair
resource "aws_key_pair" "my-key" {
    key_name = "my-key"
    public_key = var.public_key
}
```

Defining aws_key_pair, generates a new key in AWS based on the public key you provide. Adding the key to the instance definition ensures that the key is added to ~/.ssh/known_hosts on your new instance. 

```bash
resource "aws_instance" "example" {
    ami = "ami-06d51e91cea0dac8d"
    instance_type = "t2.micro"
    key_name = "my-key"
    security_groups = ["${aws_security_group.allow-ssh.name}"]
}

resource "aws_security_group" "allow-ssh" {
    name = "allow-ssh"
    # SSH access
    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
```

The instance resource is then defined. The AMI and instance type are variables you choose based on what kind of instance you want. I chose a t2.micro and an AMI running Ubuntu 18.04. The hashed AMI id that is listed below can be looked up on the AWS EC2 console under "Choose an AMI" or using a tool like the AMI [locator](https://cloud-images.ubuntu.com/locator/ec2/).

The other resource that needs to be defined is a security group that is added to the instance. This example simply adds ssh access by opening port 22. 

```bash
resource "aws_security_group" "allow-ssh" {
    name = "allow-ssh"
    # SSH access
    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
}
```

Finally the command needed to login to the instance will be printed using the aws_instance public_dns variable.

```bash
output "command" {
  value = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.example.public_dns}"
}
```


With everything put together, terraform is run using the commands

```
# provides necessary plugins and inits backend
terraform init

# lays out the build in a "dryrun" fashion
terraform plan

# executes the plan
terraform apply
```

The apply will output something like the following: 

```
aws_key_pair.my-key: Creating...
aws_security_group.allow-ssh: Creating...
aws_key_pair.my-key: Creation complete after 0s [id=my-key]
aws_security_group.allow-ssh: Creation complete after 4s [id=sg-0a58f7586c96a0b8c]
aws_instance.example: Creating...
aws_instance.example: Still creating... [10s elapsed]
aws_instance.example: Still creating... [20s elapsed]
aws_instance.example: Still creating... [30s elapsed]
aws_instance.example: Still creating... [40s elapsed]
aws_instance.example: Creation complete after 48s [id=i-02660d6c7585d2790]

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

command = ssh -i ~/.ssh/id_rsa ubuntu@ec2-34-217-90-109.us-west-2.compute.amazonaws.com
```

Just like that your infrastructure is live and you can login.

Checkout the example on github: https://github.com/jakevc/terraec2-


