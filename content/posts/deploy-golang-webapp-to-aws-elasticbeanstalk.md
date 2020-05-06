---
title: "Golang Web App to Aws Elasticbeanstalk - single instance"
date: 2020-05-01T10:59:48-07:00
author: "Jake VanCampen"
comments: true
image: "https://source.unsplash.com/KcOetEFOBYk"
tags:
    - aws
    - elasticbeanstalk
    - golang
---

# TLDR

I built an automated deployment for a sample golang web application to a single-instance elastic beanstalk environment using custom certificate management.

**Check it out on Github: https://github.com/jakevc/golang-eb**

# Background

Building web applications with golang is straight forward. Many of the first tutorials and examples of how to use the language, are a simple "hello, world" webserver. Extending the functionality of the application can be fun an exciting, and easy to develop locally. It is deployment of the application that can be challenging. 

There are a number of services for deploying golang applications including Google App Engine, Heroku, and AWS Elastic Beanstalk. If you are not constrained to a particular cloud provider or cost, then Heroku is a very good choice. Heroku abstracts much of deployment process away so that all you do it push to a heroku git origin and you are done. I would recommend this solution for test apps, and simple projects. Google App Engine is another unique can of beans, and it's also a strong choice. 

AWS supports deployment of Golang web applications using a service called Elastic Beanstalk. If you are not familiar with AWS, Elastic beanstalk is just one of many services offered by AWS. It can a challenge to figure out what service is right for you. 

I spent some time recently configuring the deployment of a golang application to Elastic Beanstalk. Elastic Beanstalk has the ability to scale to multiple instances, and multiple availability zones if you really start to see traffic to your web application. But I just want to throw up my test app like I do on Heroku. 

By default it gives you a load balancer, but initially you don't need this feature, and it costs something like $18/month. The challenge with this is that if you remove the load balancer you have to provide your own TLS certificates, because AWS certificate manager (which is free) only allows SSL termination at a Load Balancer or a CDN. So those are the two things that need to be taken care of. So let's take a look at those two things: custom SSL, and single instance configuration.

# Single Instance 

The simplest way to get this done is using the AWS EB CLI..  https://github.com/aws/aws-elastic-beanstalk-cli-setup. With the CLI you can create a single instance environment using the command `eb create -s`. Easy enough. 

# Custom SSL

This part is a bit more tricky.. if AWS cert manager is not an option, then a different certificate authority has to be used to sign the certificates. A free and widely used option is [Let's encrypt](https://letsencrypt.org/), so I started there. 

To obtain certificates and install them on your system, Let's Encrypt recommends [Certbot](https://certbot.eff.org/). 

Elastic beanstalk uses [nginx](https://nginx.org/) as a reverse-proxy webserver for your application. This means nginx is basically sitting in front of your golang web application, directing traffic per it's configuration. So that's where configuration of the certificates needs to go down. 

This is technically overbuilt for deploying a simple golang web application, but we'll go with it, as the point is the ability to scale with increasing traffic. 

Elastic beanstalk configuration can be extended by adding configuration files in a directory called `.ebextensions/` at the root of your app, so that's where I place the custom configuration files for nginx, and for the additional ssl security group that allows ingress on port 443 of the instance. A custom nginx configuration can be put in this directory, and EB uses that instead of the default, if it exists. So I put a custom nginx configuration at `.ebextensions/nginx/nginx.conf`.  It is similar to the default configuration, but adds an important `location` block allowing `certbot-auto` to perform it's magic. 

The last thing is a script that will configure the certificates when you deploy. I put this in a the file `.ebextensions/https-single-instance.config`. The script looks like this: 

```
# commands run before setup
# add EPEL release package repo to yum for installing certbot dependencies
files:
  "/opt/elasticbeanstalk/hooks/appdeploy/post/configure_certbot.sh":
    mode: "000755"
    owner: root
    group: root
    content: |  
      #!/bin/bash -e
      # installs certbot-auto
      # then reuns monthly cert renewal as cron jobs

      # set these variables for certobot
      ENV_NAME=
      REGION=

      # cert domain gets the public ip of the instance
      CERT_DOMAIN=${ENV_NAME}.${REGION}.elasticbeanstalk.com

      # fill out your email
      CERT_EMAIL=
 
      # install certbot-auto
      wget https://dl.eff.org/certbot-auto 
      sudo mv certbot-auto /usr/local/bin/certbot-auto
      sudo chown root /usr/local/bin/certbot-auto
      sudo chmod 0755 /usr/local/bin/certbot-auto

      # run certbot process
      # creates an ACME challenge in the webroot directory
      # verifies the challenge with an http (80) request
      # installs the certificate in /etc/letsencrypt/live/<DOMAIN_NAME>
      # --debug: required by AWS Linux AMI to install certbot deps
      # --redirect: creates nginx port :80 -> :443 redirect rule on success
      # --agree-tos: agrees to TOS without prompting
      # -n: run without user interaction
      # -d: set domain for certificate
      # -m: set email for ACME account registration
      # -i: select nginx as the installer plugin to update the conf file on success
      # -a: select webroot as the authenticator plugin to use the ACME challenge
      # -w: set the webroot path for serving the ACME challenge
      certbot-auto run --debug --redirect --agree-tos -n -d ${CERT_DOMAIN} -m ${CERT_EMAIL} -i nginx -a webroot -w /usr/share/nginx/html

      # reload nginx
      sudo service nginx reload 

      # setup cert renewal as cron job
      # The newline at the end of this file is extremely important.  Cron won't run without it.
      renew="0 3 1 * * root certbot-auto renew --standalone --pre-hook "sudo service nginx stop" --post-hook "sudo service nginx start" --force-renew"
      echo ${renew} > /etc/cron.d/certificate_renew && chmod 644 /etc/cron.d/certificate_renew

      # start nginx
      sudo service nginx start

packages:
    yum:
        epel-release: [] # latest version
```

This configuration file instructs elastic beanstalk to create the file `/opt/elasticbeanstalk/hooks/appdeploy/post/configure_certbot.sh`. The path this file is created at is critical. Any scripts placed in this hooks directory on the elastic beanstalk instance are executes "post" deployment. 

The script expects to know the `ENV_NAME` and `REGION` variables before you run `eb create -s`. First it downloads certbot-auto, then it downloads certificates, certifies them for your domain, and auto generates the right pointers in your nginx config to direct traffic from 80 to 443 (https). Finally, it installs a cron job to renew the certificates monthly.

It is very important that ENV_NAME be set correctly, BEFORE you create the app, otherwise the deployment will fail because it won't know the correct domain to issue certificates for. Eb create will auto generate a domain for your environment that is constructed by ${ENV_NAME}.${REGION}.elasticbeanstalk.com. 

# Deploy

1. Install AWS EB Cli
2. Set the correct variables in the file `.ebextensions/https-single-instance.cong`

```
# set these variables for certobot
ENV_NAME=
REGION=

# fill out your email
CERT_EMAIL=
```

3. Run `eb create -s`, it will prompt you to enter and environment name, enter the same name as ENV_NAME above.

If everything is configured correctly, this will create your elastic beanstalk environment and deploy the sample application over HTTPS.


# Checkout the project on github: https://github.com/jakevc/golang-eb

