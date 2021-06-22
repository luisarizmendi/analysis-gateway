# analysis-gateway project

This a microservice part of the ["analysis" APP](https://github.com/luisarizmendi/analysis)

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## What does this microservice?

* It is the entry point (web) of the Analysis APP. 
* It will send the analysis request to Kafka
* It will get analysis status updates from Kafka

## Local Development

__NOTE__: You have to install the domain objects to run the services and the test utilities to run the tests. 

### Updating submodules

If you want to pull the latest commits of the domain repository, you can just run:

```
git submodule update --remote --merge
```

### Running the application in dev mode

You can run your application in dev mode that enables live coding using:
```shell script
./mvnw compile quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8081/q/dev/.


### Attaching a debugger

By default Quarkus listensn on port 5005 for a debugger.  You can change this by appending the flag, "-Ddebug<<PORT NUMBER>>" as in the below examples.  The parameter is optional, of course

### Dependencies
#### Environment Variables

This services uses the following environment variables:
* KAFKA_BOOTSTRAP_URLS
* STREAM_URL

#### Kafka
This service depends on Kafka which is started by the Docker Compose file that you can find in the analysis-support repository (it also creates a postgres that is not needed by this microservice but by others running the APP)

In the developer profile the local kafka and postgres will point to the ones deployed with docker-compose, so you could just run "./mvnw compile quarkus:dev" and you will be ready.

If you want to monitor the Kafka topics (while developing locally) and have Kafka's command line tools installed you can watch the topics with:

```shell script
kafka-console-consumer --bootstrap-server localhost:9092 --topic orders-in --from-beginning
kafka-console-consumer --bootstrap-server localhost:9092 --topic orders-out --from-beginning
kafka-console-consumer --bootstrap-server localhost:9092 --topic regularprocess-in --from-beginning
kafka-console-consumer --bootstrap-server localhost:9092 --topic virusprocess-in --from-beginning
kafka-console-consumer --bootstrap-server localhost:9092 --topic web-updates --from-beginning
```

Orders can be sent directly to the topics with:

```shell script
kafka-console-producer --broker-list localhost:9092 --topic <<TOPIC_NAME>>
```

### Packaging and publishing the application to a repository

First remember to install and setup the GraalVM environment variables:

```shell
GRAALVM_HOME=<PATH TO GRAALVM DIRECTORY>/graalvm-ce-java11-21.1.0
export GRAALVM_HOME
export PATH=${GRAALVM_HOME}/bin:$PATH
export JAVA_HOME=${GRAALVM_HOME}
```

_NOTE_: if you use docker instead of podman you can remove the "-Dquarkus.native.container-runtime=podman" part in the mvn commands and .... well.... just change the word "podman xxx" with "docker xxx" in the rest of commands.....



```shell
./mvnw clean package -Pnative -Dquarkus.native.container-build=true -Dquarkus.native.container-runtime=podman
```
_NOTE_: Pay attention to the dot at the end of the command

```shell
podman build -f src/main/docker/Dockerfile.native -t <<REGISTRY>>/analysis-gateway:<<VERSION>> .
```


```shell
podman push <<REGISTRY>>/analysis-gateway:<<VERSION>>
```

If you want to test it locally, configure the appropiate vaiables pointing to the local kafka and postgres services


```shell
export KAFKA_BOOTSTRAP_URLS=localhost:9092 \
STREAM_URL=http://localhost:8081/dashboard/stream 
```

```shell
podman run -i --network="host" -e KAFKA_BOOTSTRAP_URLS=${KAFKA_BOOTSTRAP_URLS}  -e STREAM_URL=${STREAM_URL} <<REGISTRY>>/analysis-gateway:<<VERSION>>
```


If you want to test it locally, configure the appropiate vaiables pointing to the local kafka and postgres services


```shell
export KAFKA_BOOTSTRAP_URLS=localhost:9092 \
STREAM_URL=http://localhost:8081/dashboard/stream 
```

```shell
podman run -i --network="host" -e KAFKA_BOOTSTRAP_URLS=${KAFKA_BOOTSTRAP_URLS}  -e STREAM_URL=${STREAM_URL} <<REGISTRY>>/analysis-gateway:latest
```


