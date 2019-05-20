---
title: Run Rstudio server in a SLURM allocated node 
author: Jake VanCampen
date: '2018-11-11'
slug: rstudio-singularity-slurm
tags: [r, rstudio, hpc]
comments: true
---

# Rstudio server slurm

I have been spoiled at my current workplace. We have Rstudio server running on our shared servers with access to lots of CPUs and enough memory to say the least, but I may not always find myself in this situation. When I was first learning R I was running Rstudio locally, but I wasn't working with massive genomic datasets then, and required fewer CPUs and much less memory. 

This weekend my housemate and I wrote a script to run rstudio server inside a singularity image, on a node allocated via slurm. This is far more complex than we thought, and involved some serious hacking. This was mainly inspired by the [Rstudio Singularity](https://github.com/nickjer/singularity-rstudio) image that we found, which made everything else possible. Here it is:

```bash
#!/bin/bash
##
## Run Rstudio server through SOCKS5 tunnel on a SLURM allocated node.
## Jake VanCampen, Kohl Kinning, November 2018
##
set -euo pipefail

usage ()
{
	 echo "Usage: $(basename $0) [-h] [-n node] [-u remote_user] [-r remote_host] [-p port]" >&2
	 exit 1
}

# exit if no arguments supplied
if [ $# -eq 0 ]
then
   usage
   exit 1
fi

# define default local variable  
NODE=n013
PORT=8123

# Process command line arguments
while getopts ":h:n::u::r::p:" opt; do
  case ${opt} in
    n ) NODE=$OPTARG ;;
    u ) USER=$OPTARG ;;
    r ) REMOTE=$OPTARG;; 
    p ) PORT=$OPTARG;;
    h ) usage;;
    ? ) usage;;
  esac
done
shift $((OPTIND -1))

echo "Writing server command." 
# get commands to run Rstudio server on talapas 
echo "#!/bin/bash
/usr/sbin/fuser -k 8787/tcp
module load singularity
singularity pull --name singularity-rstudio.simg shub://nickjer/singularity-rstudio
singularity run --app rserver ~/singularity-rstudio.simg" > rserver.sh

# make sure it's executable 
chmod 755 rserver.sh

echo "Copying runscript to HPC."
echo "rsync -av rserver.sh $USER@$REMOTE:~/"
rsync -av rserver.sh $USER@$REMOTE:~/

# remove rserver.sh from your machine
rm rserver.sh

echo "Starting Rstudio server on $NODE."
# Start the Rserver
ssh $USER@$REMOTE -o RemoteCommand="srun -w $NODE rserver.sh" & 


echo "Create SOCKS5 proxy tunnel from $NODE, through $REMOTE, to localhost:$PORT."
# forward the port using a proxy command
ssh -D $PORT -N -f -C -q -o ProxyCommand="ssh $USER@$REMOTE exec nc %h %p" $USER@$NODE
```

The script is available on github [rstudio_singularity_slurm](https://github.com/jakevc/rstudio_singularity_slurm), and can be forked or downloaded with wget:

```
wget https://github.com/jakevc/rstudio_singularity_slurm/blob/master/rstudio_slurm.sh
```

# Flow

The scirpt usage is shown below, with all flag arguments required: 

```
./rstudio_slurm.sh -h
Usage: rstudio_slurm.sh [-h] [-n node] [-u remote_user] [-r remote_host] [-p port]
```

The script starts by creating an executable bash script to load singularity, then pull the "singularity-rstudio" image, and start the rserver. This script is then copied to the home directory of `remote_user@remote_host`. Then an SSH command to `remote_user@remote_host` calls the run script that was just generated. This will tell SLURM to allocate you a specific `node` and run Rstudio server on that `node`. The final step creates a SOCKS5 proxy tunnel from `node`, through `remote_host`, to localhost:`port`. This allows you to configure your browser to listen on the SOCKS `port`, and have access to Rstudio server on the SLURM allocated node. 


# Setup

This script assumes the availability of singularity on the remote machine, and loads it using the `module load singularity` command.

It is necessary to have password-less SSH access to the remote server before running this script. This can be done with ssh-keygen to create an rsa key-pair, then copy the public key to the list of authorized keys on the server. For more information on SSH key-pair authentication see this [post](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-freebsd-server). 

Make sure to kill the process on `remote_host` after you are done: 

```
$ scancel JOB_ID
```

Also its a good idea to go kill processes associated with this script on your computer after you're done using them. This can be done with something similar to:

```
ps aux | grep "$NODE" | awk '{print $2}' | xargs kill 
```

Where $NODE is replaced with the node you requested from slurm, for example: `grep "n013"`.

# Accessing Rstudio server from Firefox

To Access Rstudio server through the SOCKS5 tunnel, download firefox if you do not alrady have it and edit the network settings.

In Firefox, go to Preferences > Advanced > Network and find the Connection settings.

Click "Manual Proxy Configuration" and type "localhost" in the SOCKS Host box. Type the port you intend to use when calling `./rstudio_slurm.sh` in the Port box. 

Check the box that says "Proxy DNS when using SOCKS v5". 

![](https://github.com/jakevc/rstudio_singularity_slurm/blob/master/firefox_setup.png)

Once this is setup, run the server script like so:

```
./rstudio_slurm.sh -n n013 -u bob -r remote.server -p 8123
```

This will request n013 from SLURM and begin running Rstudio server in a singularity container on that node. Then a SOCKS tunnel will be established from n013 to your localhost:8123. If you setup your firefox correctly, when you navigate to n013:8787 in the firefox address bar, you will be redirected to the Rstudio instance running on n013. 

# Security issues

A known secutity issue with this script is that it allows you access to another users Rstudio session and account if you request a tunnel to the same port on the same node. We intend to include Rstudio server authentication soon which may solve this problem. 
