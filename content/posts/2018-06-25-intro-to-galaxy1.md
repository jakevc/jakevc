---
title: Intro to galaxy admin
author: Jake VanCampen
date: '2018-06-25'
slug: intro-to-galaxy
tags:
  - gccbosc
  - usegalaxy
  - ansible
category: "galaxy"
image: "https://source.unsplash.com/VHbiV77NnYs"
---


# Into to Galaxy Admin -- Morning

## Using Ansible to setup a Galaxy 

Ansible is an automated computer management system that can be used to install and configure software infastructure. Ansible scripts are called playbooks, written as yaml files, can be structured in folder hierarchy with mnay available modules. 

Why: 
  - avoid forgetting what you did to install and configure some software
  - codify knowledge about system 
  - "make infastructure programmable"

Ansible features: 
  - easy to learn (YAML playbooks, jinja2 templates, INI inventory )
  - sequential execution
  

## Install Galaxy with ansible:

Exercise using ansible to install Galaxy [here](https://github.com/galaxyproject/dagobah-training/blob/2018-gccbosc/sessions/14-ansible/ex2-galaxy-ansible.md).

Install the GalaxyKickStart (GKS) playbook onto a server or VM by cloning the repo, and installing using the requirements_roles.yml. The GKS playbook is a pre-configured playbook for configuration of an operating-system independent, standard galaxy server.

```
sudo pip install ansible
git clone https://github.com/ARTbio/GalaxyKickStart
cd GalaxyKickStart
git checkout 2018-gccbosc
# install all dependent roles
ansible-galaxy install -r requirements_roles.yml -p roles --force
```

You will see output similar to the following:

```
TASK [galaxyprojectdotorg.galaxy-extras : Yarn: Make sure package key is present] ***
changed: [localhost]

TASK [galaxyprojectdotorg.galaxy-extras : Yarn: Add Debian/Ubuntu package to sources list] ***
changed: [localhost]

TASK [galaxyprojectdotorg.galaxy-extras : Yarn: Install] ***********************
changed: [localhost]

RUNNING HANDLER [galaxyprojectdotorg.galaxy-extras : restart nginx] ************
changed: [localhost]

TASK [galaxyprojectdotorg.galaxy-tools : include] ******************************

PLAY RECAP *********************************************************************
localhost                  : ok=119  changed=95   unreachable=0    failed=0   
```

Taking a look at the playbook `galaxy.yml` we see it contains many roles that sequentially execute to produce the desired structure. We can make our own set of variables in `group_vars/gccbosc18.yml`, only including those variables that will override the default values of `group_vars/all`.  E.g. 

```
galaxy_root_dir: /srv/galaxy
galaxy_server_dir: "{{ galaxy_root_dir }}/server"
galaxy_venv_dir: "{{ galaxy_root_dir }}/venv"
galaxy_mutable_data_dir: "{{ galaxy_data }}"
proftpd_files_dir: "{{ galaxy_data }}/ftp"
galaxy_config_dir: "{{ galaxy_root_dir }}/config"
galaxy_mutable_config_dir: "{{ galaxy_config_dir }}"
galaxy_shed_tools_dir: "{{ galaxy_root_dir }}/shed_tools"
galaxy_tool_dependency_dir: "{{ galaxy_root_dir }}/dependencies"
tool_dependency_dir: "{{ galaxy_tool_dependency_dir }}"
galaxy_job_conf_path: "{{ galaxy_config_dir }}/job_conf.xml"
galaxy_job_metrics_conf_path: "{{ galaxy_config_dir }}/job_metrics_conf.xml"
nginx_upload_store_path: "{{ galaxy_data }}/upload_store"
tool_data_table_config_path: "{{ galaxy_config_dir }}/tool_data_table_conf.xml,/cvmfs/data.galaxyproject.org/managed/location/tool_data_table_conf.xml"
len_file_path: "{{ galaxy_config_dir }}/len"
galaxy_log_dir: "{{ galaxy_root_dir }}/log"
supervisor_slurm_config_dir: "{{ galaxy_log_dir }}"

galaxy_manage_trackster: False
galaxy_extras_config_cvmfs: True
galaxy_restart_handler_enabled: True
galaxy_mule_handlers: True
galaxy_handler_processes: 1

galaxy_config_style: yaml
galaxy_config_file: "{{ galaxy_config_dir }}/galaxy.yml"

galaxy_config:
  galaxy:
    database_connection: "{{ galaxy_db }}"
    file_path: "{{ galaxy_data }}/datasets"
    new_file_path: "{{ galaxy_data }}/tmp"
    galaxy_data_manager_data_path: "{{ galaxy_data }}/tool-data"
    job_config_file: "{{ galaxy_job_conf_path }}"
    ftp_upload_dir: "{{ proftpd_files_dir }}"
    ftp_upload_site: ftp://[server IP address]
    tool_data_table_config_path: "{{ tool_data_table_config_path }}"
    len_file_path: "{{ len_file_path }}"
    check_migrate_tools: False
  uwsgi:
    module: galaxy.webapps.galaxy.buildapp:uwsgi_app()
    logfile-chmod: 644


additional_files_list:
  - { src: "extra-files/galaxy-kickstart/logo.png", dest: "{{ galaxy_server_dir }}/static/images/" }
  - { src: "extra-files/tool_sheds_conf.xml", dest: "{{ galaxy_config_dir }}" }
  - { src: "extra-files/cloud_setup/vimrc", dest: "/etc/vim/" }
```

Then add the following code-chunk to the end of the `pre-tasks` section of the playbook in the toplevel `galaxy.yml`.

```
  - name: Create galaxy system user
      user:
        name: "galaxy"
        home: "/srv/galaxy"
        skeleton: "/etc/skel"
        shell: "/bin/bash"
        system: yes
      tags:
          - always
```
This creates the local system user. Then the follwoing lines were added to a new inventory file: 

```
[gccbosc18]
localhost ansible_connection=local
```

Now running `ansible-playbook -i inventory galaxy.yml --tags "install_galaxy,install_extras"` will run the playbook and install everything in it's desired locaiton (~20min). 

  - `sudo supervisorctl status` lists all programs
  - `sudo supervisorctl restart galaxy:` restarts the server with new variables if anything is changed in `/srv/galaxy/config/`. 
  
You can add yourself as a user, so you see an Admin tab on your running server: 

```
$ sudo su galaxy
$ vi /srv/galaxy/config/galaxy.yml
# Add the following line under galaxy: section
    admin_users: your@email.address
$ exit  # change back to ubuntu user
$ sudo supervisorctl restart galaxy:
```


Determine what is running: 

```
ubuntu@2018-gcc-training-42:~/GalaxyKickStart$ sinfo
PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST
debug*       up   infinite      1   idle 2018-gcc-training-42
ubuntu@2018-gcc-training-42:~/GalaxyKickStart$ sudo supervisorctl status 
autofs                           RUNNING   pid 3611, uptime 0:03:18
cron                             STOPPED   Not started
galaxy:galaxy_web                RUNNING   pid 3612, uptime 0:03:18
munge                            RUNNING   pid 3604, uptime 0:03:18
nginx                            RUNNING   pid 3606, uptime 0:03:18
postgresql                       RUNNING   pid 3602, uptime 0:03:18
pre_postgresql                   EXITED    Jun 25 05:22 PM
proftpd                          RUNNING   pid 3610, uptime 0:03:18
reports                          STOPPED   Not started
slurmctld                        RUNNING   pid 3605, uptime 0:03:18
slurmd                           RUNNING   pid 3607, uptime 0:03:18
ubuntu@2018-gcc-training-42:~/GalaxyKickStart$ 

```

More about galaxy and ansible is found by searching ansible on the galaxy [github](https://github.com/galaxyproject).


Summary: 

  Galaxy setup can be continerized and reprodicible. Ansible provides the tools to be able to write your setup as a recipe, and easily manage config in YAML format. 
  
  
More: 
  [Configure FTP upload](https://github.com/galaxyproject/dagobah-training/blob/2018-gccbosc/sessions/06-extending-installation/ex1-proftpd.md) |
  [Reference data and Data Managers](https://github.com/galaxyproject/dagobah-training/blob/2018-gccbosc/sessions/05-reference-genomes/ex1-reference-genomes.md#exercise-3-install-a-datamanager-from-the-toolshed)



# Intro to Galaxy Admin -- Noon

## Building Galaxy tools with planemo

Planemo provides useful tools for testing and writing galaxy tools, a tutorial for writing a basic galaxy tools using a template can be found on the Planemo [documenation](http://planemo.readthedocs.io/en/latest/writing_standalone.html). 


In summary: The command `planemo tool_init` takes a variety of flags to auto-generate boilerplate XML for tool generation, tool files are just XML configuration files. Useful flags include `--example_command`, `--example_output`, and `--example_input`; passing values to these parameters includes them in the XML tool file.

Once the tools is built out well, you can test the validity of the tool file by panemo lint: `planemo l [tool.xml]`. The tool can be tested using plantemo test: `planemo t [tool.xml]`, will output if the test passed or failed. Then you can **serve** the new tool to Galaxy to view it `planemo s`. There are many more ways to tweak the tool XML for additional functionality such as wrapping custom scripts. Planemo provides a nice way to establish a tool development workflow, if that's what you are into.

## Run tools in containers

If your Galaxy install already has a local Docker image you can instruct a tool to be run in a container by setting it's destination as docker in `/srv/galaxy/config/job_conf.xml`:

```
<tools>
   <tool id="jq" destination="local_docker"/>
</tools>
```

You must also enable containers in `galaxy.yml`:

```
galaxy:
    enable_beta_mulled_containers: true
```

, and make sure that the correct docker image has been pulled in this case for the `jq` tool: 

```
$ sudo docker images
REPOSITORY                 TAG                 IMAGE ID            CREATED             SIZE
quay.io/biocontainers/jq   1.5--4              1fe0f3d31487        7 weeks ago         15.6MB
```


# Intro to Galaxy Admin -- Afternoon 

## Send tool jobs to compute cluster

Galaxy can be setup to send jobs to SLURM, instructions for the setup are at the top of this [document](http://galaxyproject.github.io/training-material/topics/admin/tutorials/connect-to-compute-cluster/tutorial.html). Once that is setup, tools can be configured to use multiple cores by editing the tool configuration file ` /srv/galaxy/config/tool_conf.xml`. You have to make sure galaxy knows which tool config file you are using by editing the `/srv/galaxy/config/galaxy.yml` to include the correct path: 

```
galaxy:
    tool_config_file: /srv/galaxy/config/tool_conf.xml,/srv/galaxy/config/shed_tool_conf.xml
```

You can specify destinations to map tools to in `tool_conf.xml`, for example, a slurm destnation: 

```       
<destination id="slurm-2c" runner="slurm">
    <param id="nativeSpecification">--nodes=1 --ntasks=2</param>
</destination>
```

Then map the tool to this destination in the same file by: 

```
<tools>
   <tool id=[tool id] destination="slurm-2c"/>
</tools>
```


You can also specify dynamic tool destinations by creating a `/srv/galaxy/config/tool_destinations.yml`. This file allows you to specify dynamic destinations, for example if the dataset is greater than a certain size, send to multi-core destination, else send to single-core destination. 

## Expanding galaxy file space

[Hierarchical Object storage](https://github.com/galaxyproject/dagobah-training/blob/2018-gccbosc/sessions/19-storage/ex1-objectstore.md#section-1---hierarchical-object-store) allows you direct newer datasets to a different place on disk by creating and `object_store_config.xml` that is pointed to in `galaxy.yml`.


[Distributed Object storage](https://github.com/galaxyproject/dagobah-training/blob/2018-gccbosc/sessions/19-storage/ex1-objectstore.md#section-2---distributed-object-store) could instead be used to defer datsets to different locations with different weights, for example you can configure a `newdata` location to get 3 times more than an `newnewdata` location. 


# End 

The full training course for galaxy admin, and other galaxy training can be found at:

 - [dagobah training](https://github.com/galaxyproject/dagobah-training)
 - [galaxy training](https://galaxyproject.github.io/training-material/)




