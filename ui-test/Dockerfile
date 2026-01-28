FROM eclipse-temurin:21-jdk

USER root
RUN apt-get update && apt-get install -y git
# Define build-time arguments
ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME

# Set labels for metadata
LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

# Define build-time arguments for user and group
ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1001
ARG container_user_gid=1001

# Set working directory for the user
ENV work_dir=/home/${container_user}/

ARG KUBECTL_VERSION=1.22.9

# install packages and create user
RUN groupadd -g ${container_user_gid} ${container_user_group} \
    && useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/bash -m ${container_user} -d ${work_dir} \
    && chown -R ${container_user}:${container_user} /home/${container_user}/  \
    && curl -LO "https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl" \
    && chmod +x kubectl \
    && mv kubectl /usr/local/bin/

# Switch to the specified user for the subsequent commands
USER ${container_user_uid}:${container_user_gid}


RUN mkdir -p /home/mosip/src/test/resources/config/

RUN mkdir -p /home/mosip/test-output/SparkReport/
RUN chmod -R 777 /home/mosip/test-output

RUN mkdir -p /home/mosip/screenshots/
RUN chmod -R 777 /home/mosip/screenshots/




# Copy files
COPY --chown=${container_user_uid}:${container_user} --chmod=771 ./entrypoint.sh ${work_dir}/entrypoint.sh
COPY --chown=${container_user}:${container_user} ./application.properties $work_dir/
COPY --chown=${container_user}:${container_user} ./target $work_dir/target
COPY --chown=${container_user}:${container_user} ./src/test/resources/featurefiles/ /home/mosip/featurefiles/
COPY --chown=${container_user}:${container_user} ./src/main/resources/ /home/mosip/src/test/resources/
COPY --chown=${container_user}:${container_user} ./src/test/resources/config.properties /home/mosip/src/test/resources/config.properties
COPY --chown=${container_user}:${container_user} ./src/main/java/utils/ /home/mosip/src/main/java/utils/
COPY --chown=${container_user}:${container_user} ./screenshots/ /home/mosip/screenshots/
COPY --chown=${container_user}:${container_user} ./resource/ /home/mosip/resource/
COPY --chown=${container_user}:${container_user} ./application.properties $work_dir/
COPY ["Biometric Devices", "$work_dir/Biometric Devices"]

COPY --chown=${container_user}:${container_user} ./testNgXmlFiles/ /home/mosip/testNgXmlFiles/


COPY --chown=${container_user_uid}:${container_user} ./browserstack.yml /home/mosip/
COPY --chown=${container_user_uid}:${container_user} ./target/*.jar ${work_dir}

# Set working directory
WORKDIR /home/${container_user}/